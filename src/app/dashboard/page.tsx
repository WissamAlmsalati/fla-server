"use client";

import { useEffect, useMemo, useState } from "react";
import { AppSidebar } from "@/components/app-sidebar"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { RecentOrders } from "@/components/dashboard/recent-orders"
import { OrderDistributionChart } from "@/components/dashboard/order-distribution-chart"
import { OrderTrendChart } from "@/components/dashboard/order-trend-chart"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { useReduxDispatch, useReduxSelector } from "@/redux/provider";
import { loadOrders } from "@/features/orders/slices/orderSlice";

interface DashboardStats {
  totalOrders: number;
  totalUsers: number;
  totalWarehouses: number;
  ordersLast30Days: number;
  growthPercentage: number;
  byStatus: Record<string, number>;
  byCountry: Record<string, number>;
  trendData: Array<{ date: string; count: number }>;
}

export default function Page() {
  const dispatch = useReduxDispatch();
  const { list: orders, status } = useReduxSelector((state) => state.orders);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dispatch(loadOrders());
  }, [dispatch]);

  useEffect(() => {
    async function fetchDashboardStats() {
      try {
        const response = await fetch("/api/dashboard/stats");
        const result = await response.json();
        setDashboardStats(result.data);
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardStats();
  }, []);

  const stats = useMemo(() => {
    const ordersInChina = orders.filter(o => o.status === "arrived_to_china").length;
    const ordersInLibya = orders.filter(o => o.status === "arrived_libya" || o.status === "ready_for_delivery").length;
    const deliveredOrders = orders.filter(o => o.status === "delivered").length;
    const pendingOrders = orders.filter(o => o.status === "pending" || o.status === "confirmed").length;
    const inTransitOrders = orders.filter(o => o.status === "shipped_from_china").length;

    return {
      totalOrders: dashboardStats?.totalOrders || orders.length,
      ordersInChina,
      ordersInLibya,
      deliveredOrders,
      pendingOrders,
      inTransitOrders,
      totalUsers: dashboardStats?.totalUsers || 0,
      totalWarehouses: dashboardStats?.totalWarehouses || 0,
      growthPercentage: dashboardStats?.growthPercentage || 0,
    };
  }, [orders, dashboardStats]);

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
          {/* Stats Cards */}
          <StatsCards {...stats} />
          
          {/* Recent Orders and Distribution Charts */}
          {dashboardStats && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <OrderDistributionChart 
                data={dashboardStats.byCountry} 
                type="country" 
              />
              <OrderDistributionChart 
                data={dashboardStats.byStatus} 
                type="status" 
              />
              {dashboardStats.trendData && (
                <OrderTrendChart data={dashboardStats.trendData} />
              )}
            </div>
          )}
          
          <RecentOrders orders={orders.slice(0, 5)} />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
