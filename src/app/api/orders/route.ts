import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { orderFiltersSchema, createOrderSchema } from "@/lib/validation";
import { parsePaginationMeta } from "@/lib/pagination";
import { requireAuth } from "@/lib/auth";
import { requireRole } from "@/lib/rbac";
import { Prisma } from "@prisma/client";
import { sendNotificationToUser } from "@/lib/notifications";

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const query = orderFiltersSchema.parse(Object.fromEntries(request.nextUrl.searchParams));

    const where: any = {};

    // For CUSTOMER users, ALWAYS filter by their customerId
    if (user.role === "CUSTOMER") {
      let customerIdToUse: number | null = user.customerId || null;

      // If customerId not in token, fetch it from database
      if (!customerIdToUse) {
        const dbUser = await prisma.user.findUnique({
          where: { id: user.sub },
          include: { customer: true }
        });
        customerIdToUse = dbUser?.customer?.id || null;
      }

      if (!customerIdToUse) {
        // Customer has no associated customer record - return empty
        return NextResponse.json({
          data: [],
          meta: { nextCursor: null, hasMore: false },
        });
      }

      // FORCE customerId filter for customers - they can ONLY see their own orders
      where.customerId = customerIdToUse;
    }

    if (query.search) {
      // First, try to find an exact match for tracking number or flight number
      const exactMatch = await prisma.order.findFirst({
        where: {
          OR: [
            { trackingNumber: query.search },
            { flightNumber: query.search }
          ]
        },
        include: {
          customer: {
            include: {
              user: true,
            },
          },
          shippingRate: true,
          flight: true,
        },
      });

      if (exactMatch) {
        // If exact match found, return only that (respecting user permissions)
        if (user.role !== "CUSTOMER" || exactMatch.customerId === user.customerId) {
          const unreadCount = await prisma.orderMessage.count({
            where: {
              orderId: exactMatch.id,
              authorId: { not: user.sub },
              NOT: {
                readBy: {
                  has: user.sub,
                },
              },
            },
          });

          return NextResponse.json({
            data: [{ ...exactMatch, unreadCount }],
            meta: parsePaginationMeta([exactMatch], query.limit),
          });
        }
      }

      where.OR = [
        { trackingNumber: { contains: query.search, mode: "insensitive" } },
        { flightNumber: { contains: query.search, mode: "insensitive" } },
        { name: { contains: query.search, mode: "insensitive" } },
        {
          customer: {
            OR: [
              { name: { contains: query.search, mode: "insensitive" } },
              { code: { contains: query.search, mode: "insensitive" } },
              { user: { name: { contains: query.search, mode: "insensitive" } } },
            ],
          },
        },
      ];
    }

    const orders = await prisma.order.findMany({
      where: {
        ...where,
        ...(query.status && { status: query.status as string }),
        // Only allow admins/staff to filter by customerId - customers already have it forced
        ...(query.customerId && user.role !== "CUSTOMER" && { customerId: query.customerId }),
        ...(query.country && { country: query.country }),
      },
      take: query.limit,
      skip: query.cursor ? 1 : undefined,
      cursor: query.cursor ? { id: Number(query.cursor) } : undefined,
      orderBy: { id: "desc" },
      include: {
        customer: {
          include: {
            user: true,
          },
        },
        shippingRate: true,
        flight: true,
      },
    });

    // Calculate unread message counts for each order
    const ordersWithUnreadCounts = await Promise.all(
      orders.map(async (order: any) => {
        const unreadCount = await prisma.orderMessage.count({
          where: {
            orderId: order.id,
            authorId: { not: user.sub },
            NOT: {
              readBy: {
                has: user.sub,
              },
            },
          },
        });

        return {
          ...order,
          unreadCount,
        };
      })
    );

    return NextResponse.json({
      data: ordersWithUnreadCounts,
      meta: parsePaginationMeta(orders, query.limit),
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 400 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth(request);
    requireRole(user.role, ["ADMIN", "PURCHASE_OFFICER"]);
    const body = createOrderSchema.parse(await request.json());

    // Check if tracking number already exists
    const existingOrder = await prisma.order.findUnique({
      where: { trackingNumber: body.tracking_number }
    });

    if (existingOrder) {
      return NextResponse.json(
        { error: "رقم التتبع هذا موجود مسبقاً في النظام" },
        { status: 400 }
      );
    }

    const order = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Create the order
      const newOrder = await tx.order.create({
        data: {
          trackingNumber: body.tracking_number,
          name: body.name,
          usdPrice: body.usd_price || 0, // Fallback to 0 if not provided
          cnyPrice: body.cny_price,
          productUrl: body.product_url,
          notes: body.notes,
          weight: body.weight,
          customerId: body.customer_id,
          country: body.country,
          flightId: body.flightId,
          logs: {
            create: {
              status: "purchased"
            }
          }
        },
      });

      // If a price is provided, deduct from customer balance and create transaction
      if (body.usd_price && body.usd_price > 0 && body.customer_id) {
        const customer = await tx.customer.findUnique({
          where: { id: body.customer_id! }
        });

        if (customer) {
          const balanceBefore = customer.balanceUSD;
          const balanceAfter = balanceBefore - body.usd_price;

          await tx.customer.update({
            where: { id: body.customer_id! },
            data: { balanceUSD: balanceAfter }
          });

          const withdrawalTransaction = await tx.transaction.create({
            data: {
              customerId: body.customer_id!,
              type: "WITHDRAWAL",
              amount: body.usd_price,
              currency: "USD",
              balanceBefore: balanceBefore,
              balanceAfter: balanceAfter,
              notes: `خصم سعر الطلب - ${newOrder.name} (#${newOrder.trackingNumber})`,
              createdBy: user.sub,
            }
          });

          // Send wallet deduction notification
          const customerUser = await tx.user.findUnique({
            where: { id: customer.userId as number }
          });

          if (customerUser) {
            const title = "إشعار سحب مالي (طلب جديد)";
            const notifBody = `تم سحب مبلغ ${body.usd_price}$ من محفظتك لشراء الطلب "${newOrder.name}". الرصيد الحالي: ${balanceAfter}$`;

            const dbNotification = await tx.notification.create({
              data: {
                title,
                body: notifBody,
                userId: customerUser.id as number,
                type: "WALLET_UPDATE",
              }
            });

            if (customerUser.fcmTokens && customerUser.fcmTokens.length > 0) {
              await sendNotificationToUser(
                customerUser.fcmTokens,
                title,
                notifBody,
                {
                  type: "wallet_update",
                  transactionId: String(withdrawalTransaction.id),
                  notificationId: String(dbNotification.id)
                }
              );
            }
          }
        }
      }

      return newOrder;
    });

    // Send notification to customer (fire-and-forget)
    if (body.customer_id) {
      const customerUser = await prisma.customer.findUnique({
        where: { id: body.customer_id! },
        include: { user: true },
      });

      if (customerUser?.user) {
        const title = "تم إضافة طلب جديد";
        const notifBody = `تمت إضافة الطلب "${order.name}" (${order.trackingNumber}) إلى حسابك بنجاح.`;

        // Save to DB
        const dbNotification = await prisma.notification.create({
          data: {
            title,
            body: notifBody,
            userId: customerUser.user.id,
            type: "NEW_ORDER",
            referenceId: order.id,
          },
        });

        // Push notification if FCM tokens exist
        if (customerUser.user.fcmTokens?.length) {
          await sendNotificationToUser(
            customerUser.user.fcmTokens,
            title,
            notifBody,
            {
              orderId: order.id.toString(),
              type: "new_order",
              notificationId: String(dbNotification.id),
            }
          );
        }
      }
    }

    return NextResponse.json({ data: order }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to create order" },
      { status: 400 },
    );
  }
}
