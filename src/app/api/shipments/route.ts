import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const user = await requireAuth(request);
    const { searchParams } = new URL(request.url);
    
    // Pagination parameters
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit') as string) : 20;
    const page = searchParams.get('page') ? parseInt(searchParams.get('page') as string) : 1;
    const skip = (page - 1) * limit;
    
    let where: any = {};
    let currentCustomerId: number | null = null;
    
    // If the user is a CUSTOMER, only show shipments that contain their orders
    if (user.role === "CUSTOMER") {
      const customer = await prisma.customer.findUnique({
        where: { userId: user.sub },
      });
      
      if (customer) {
        currentCustomerId = customer.id;
        where.items = {
          some: {
            order: {
              customerId: customer.id
            }
          }
        };
      } else {
        return NextResponse.json({ data: [], pagination: { total: 0, page: 1, limit } });
      }
    }

    const [shipments, total] = await Promise.all([
      prisma.shipment.findMany({
        where,
        take: limit,
        skip,
        orderBy: { id: 'desc' }, // Order by ID instead of createdAt since it doesn't exist
        include: {
          items: currentCustomerId ? {
            where: {
              order: {
                customerId: currentCustomerId
              }
            },
            include: {
              order: true,
            },
          } : {
            include: {
              order: true,
            },
          },
          fromWarehouse: true,
          toWarehouse: true,
        },
      }),
      prisma.shipment.count({ where })
    ]);
    
    // With currentCustomerId in the PRISMA WHERE clause natively,
    // we don't need to manually filter items in memory anymore.
    const optimizedShipments = shipments;

    return NextResponse.json({ 
      data: optimizedShipments,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unauthorized" }, { status: 401 });
  }
}
