"use client";

import type { Order } from "@/features/orders/slices/orderSlice";

export function OrdersTable({ orders }: { orders: Order[] }) {
  if (!orders.length) {
    return <p className="text-sm text-neutral-500">No orders yet.</p>;
  }

  return (
    <div className="mt-6 overflow-hidden rounded-2xl border border-neutral-200 shadow-sm">
      <div className="grid grid-cols-[2fr,1fr,1fr,1fr] bg-neutral-100 px-6 py-3 text-xs uppercase tracking-wider text-neutral-500">
        <span>Order</span>
        <span>Status</span>
        <span>Price (USD)</span>
        <span>Customer</span>
      </div>
      <div className="divide-y divide-neutral-100 bg-white">
        {orders.map((order) => (
          <div key={order.id} className="grid grid-cols-[2fr,1fr,1fr,1fr] px-6 py-4 text-sm text-neutral-800">
            <div>
              <p className="font-semibold">{order.trackingNumber}</p>
              <p className="text-xs text-neutral-500">{order.name}</p>
            </div>
            <div className="flex items-center">
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">
                {order.status}
              </span>
            </div>
            <div className="flex items-center font-semibold">${order.usdPrice.toFixed(2)}</div>
            <div>#{order.customerId}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
