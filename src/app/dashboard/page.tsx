"use client";

import { useEffect, useMemo } from "react";
import { AppSidebar } from "@/components/app-sidebar"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { OrdersDataTable } from "@/features/orders/components/OrdersDataTable"
import { SectionCards } from "@/components/section-cards"
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
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <SectionCards {...stats} />
              <div className="px-4 lg:px-6">
                <ChartAreaInteractive />
              </div>
              {/* Dashboard might show recent orders or nothing, for now let's keep it or remove it. 
                  Usually dashboard has a summary. I'll remove the full table from dashboard to avoid duplication 
                  or maybe keep a simplified version. For now I'll remove the table from dashboard 
                  to make it distinct from Orders page. */}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
