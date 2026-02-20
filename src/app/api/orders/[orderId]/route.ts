import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateOrderSchema } from "@/lib/validation";
import { requireAuth } from "@/lib/auth";
import { requireRole } from "@/lib/rbac";
import { Prisma } from "@prisma/client";
import { sendNotificationToUser } from "@/lib/notifications";
import { getStatusLabel } from "@/lib/orderStatus";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const user = await requireAuth(request);
    const { orderId } = await params;
    const id = parseInt(orderId);

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        customer: {
          include: {
            user: true,
          },
        },
        shippingRate: true,
        logs: {
          orderBy: {
            createdAt: 'asc'
          }
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Check access rights
    if (user.role === "CUSTOMER" && order.customerId !== user.customerId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 400 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const user = await requireAuth(request);
    const { orderId } = await params;
    const id = parseInt(orderId);
    const body = await request.json();
    const data = updateOrderSchema.parse(body);

    const order = await prisma.order.findUnique({
      where: { id },
      include: { shippingRate: true }
    });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Role-based logic enforcement
    if (user.role === "PURCHASE_OFFICER") {
      // Purchase officer CANNOT change status
      if (data.status && data.status !== order.status) {
        return NextResponse.json({ error: "لا يملك مسؤول المشتريات صلاحية تغيير حالة الطلب" }, { status: 403 });
      }
    } else if (user.role === "CHINA_WAREHOUSE") {
      // China warehouse can only update weight and status to arrived_to_china or shipping_to_libya
      const allowedStatuses = ["purchased", "arrived_to_china", "shipping_to_libya"];
      if (data.status && !allowedStatuses.includes(data.status)) {
        return NextResponse.json({ error: "مخزن الصين يمكنه فقط التغيير إلى 'وصل للمخزن' أو 'جاري الشحن'" }, { status: 403 });
      }
      // Restricted fields for warehouse
      if (data.name || data.usd_price || data.cny_price || data.product_url) {
        return NextResponse.json({ error: "لا يملك المخزن صلاحية تعديل بيانات الطلب الأساسية" }, { status: 403 });
      }
    } else if (user.role === "LIBYA_WAREHOUSE") {
      // Libya warehouse transitions
      const allowedStatuses = ["shipping_to_libya", "arrived_libya", "ready_for_pickup", "delivered"];
      if (data.status && !allowedStatuses.includes(data.status)) {
        return NextResponse.json({ error: "مخزن ليبيا يمكنه التغيير فقط للحالات المحلية" }, { status: 403 });
      }
      if (data.name || data.usd_price || data.cny_price || data.product_url) {
        return NextResponse.json({ error: "لا يملك المخزن صلاحية تعديل بيانات الطلب الأساسية" }, { status: 403 });
      }
    } else if (user.role === "ADMIN") {
      // Admin has full access
    } else {
      return NextResponse.json({ error: "صلاحية غير معروفة" }, { status: 403 });
    }

    const updatedOrder = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // 1. If order is already canceled, it cannot be changed
      if (order.status === "canceled") {
        throw new Error("لا يمكن تعديل طلب ملغي");
      }

      // Status progression validation - prevent skipping statuses
      const STATUS_ORDER = [
        "purchased",
        "arrived_to_china",
        "shipping_to_libya",
        "arrived_libya",
        "ready_for_pickup",
        "delivered"
      ];

      // 2. If changing TO canceled, allow it from any status
      if (data.status === "canceled") {
        // Allow transition to canceled
      } else {
        const currentStatusIndex = STATUS_ORDER.indexOf(order.status);
        const newStatusIndex = data.status ? STATUS_ORDER.indexOf(data.status) : currentStatusIndex;

        // Prevent skipping forward - can only move to next status or stay at current
        if (newStatusIndex > currentStatusIndex + 1) {
          throw new Error(`لا يمكن تجاوز الحالات. يجب إكمال الحالة الحالية "${order.status}" أولاً`);
        }

        // Allow going backwards for corrections (except after certain points)
        if (newStatusIndex < currentStatusIndex) {
          // Allow going back, but maybe add some restrictions later if needed
        }
      }

      let shippingCost = undefined;

      // Calculate shipping cost if status is changing to arrived_to_china or shipping_to_libya
      // and we have weight and shippingRateId
      if (
        (data.status === "arrived_to_china" || data.status === "shipping_to_libya") &&
        data.weight &&
        data.shippingRateId
      ) {
        const rate = await tx.shippingRate.findUnique({
          where: { id: data.shippingRateId },
        });

        if (rate) {
          // Validation: Cannot change shipping type (AIR/SEA) once set
          if (order.shippingRate && order.shippingRate.type !== rate.type) {
            throw new Error("لا يمكن تغيير نوع الشحن (جوي/بحري) بعد تحديده");
          }

          const newCost = data.weight * rate.price;
          shippingCost = newCost;

          // Calculate difference from previous cost (if any)
          // We use a small epsilon for float comparison to avoid precision issues
          const previousCost = order.shippingCost || 0;
          const costDifference = newCost - previousCost;

          // Only update balance if there is a significant difference (e.g. > 0.01)
          if (Math.abs(costDifference) > 0.01 && order.customerId) {
            // Get current customer balance before update
            const customer = await tx.customer.findUnique({
              where: { id: order.customerId },
            });

            if (customer) {
              const balanceBefore = customer.balanceUSD;
              const balanceAfter = balanceBefore - costDifference;

              // Update customer balance
              await tx.customer.update({
                where: { id: order.customerId },
                data: {
                  balanceUSD: { decrement: costDifference },
                },
              });

              // Create transaction record
              await tx.transaction.create({
                data: {
                  customerId: order.customerId,
                  type: "WITHDRAWAL",
                  amount: Math.abs(costDifference),
                  currency: "USD",
                  balanceBefore: balanceBefore,
                  balanceAfter: balanceAfter,
                  notes: `خصم سعر الشحن - ${order.name} (#${order.trackingNumber})`,
                  createdBy: user.sub,
                },
              });
            }
          }
        }
      }

      return await tx.order.update({
        where: { id },
        data: {
          status: data.status as any,
          weight: data.weight,
          trackingNumber: data.tracking_number,
          name: data.name,
          usdPrice: data.usd_price,
          cnyPrice: data.cny_price,
          productUrl: data.product_url,
          notes: data.notes,
          shippingRateId: data.shippingRateId,
          shippingCost: shippingCost,
          // Snapshot shipping rate details if available
          shippingRateName: data.shippingRateId && shippingCost !== undefined ? (await tx.shippingRate.findUnique({ where: { id: data.shippingRateId } }))?.name : order.shippingRateName,
          shippingRatePrice: data.shippingRateId && shippingCost !== undefined ? (await tx.shippingRate.findUnique({ where: { id: data.shippingRateId } }))?.price : order.shippingRatePrice,
          flightNumber: data.flightNumber,
          ...(data.status && data.status !== order.status
            ? {
              logs: {
                create: {
                  status: data.status as any,
                },
              },
            }
            : {}),
        },
        include: {
          customer: {
            include: {
              user: true,
            },
          },
          shippingRate: true,
          logs: {
            orderBy: {
              createdAt: 'asc'
            }
          },
        },
      });
    });

    const orderWithCustomer = updatedOrder as any;
    if (data.status && data.status !== order.status && orderWithCustomer.customer?.user?.fcmTokens?.length) {
      const statusLabel = getStatusLabel(data.status, updatedOrder.country);
      await sendNotificationToUser(
        orderWithCustomer.customer.user.fcmTokens,
        "تحديث حالة الطلب",
        `تم تغيير حالة الطلب ${updatedOrder.trackingNumber} إلى ${statusLabel}`,
        {
          orderId: updatedOrder.id.toString(),
          type: "status_update"
        }
      );
    }

    return NextResponse.json(updatedOrder);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update order" },
      { status: 400 }
    );
  }
}
