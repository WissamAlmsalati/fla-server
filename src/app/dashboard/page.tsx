"use client";

import { useEffect, useMemo } from "react";
import { AppSidebar } from "@/components/app-sidebar"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { RecentOrders } from "@/components/dashboard/recent-orders"
import { OverviewChart } from "@/components/dashboard/overview-chart"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { useReduxDispatch, useReduxSelector } from "@/redux/provider";
import { loadOrders } from "@/features/orders/slices/orderSlice";

export default function Page() {
  const dispatch = useReduxDispatch();
  const { list: orders, status } = useReduxSelector((state) => state.orders);

  useEffect(() => {
    dispatch(loadOrders());
  }, [dispatch]);

  const stats = useMemo(() => {
    return {
      totalOrders: orders.length,
      ordersInChina: orders.filter(o => o.status === "arrived_to_china").length,
      ordersInLibya: orders.filter(o => o.status === "arrived_libya").length,
      deliveredOrders: orders.filter(o => o.status === "delivered").length,
    };
  }, [orders]);

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <StatsCards {...stats} />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <div className="col-span-4">
              <OverviewChart />
            </div>
            <div className="col-span-3">
              <RecentOrders orders={orders} />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
