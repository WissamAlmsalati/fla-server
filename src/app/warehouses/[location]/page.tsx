import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { OrdersDataTable } from "@/features/orders/components/OrdersDataTable";

export default async function WarehouseOrdersPage({
  params,
}: {
  params: Promise<{ location: string }>;
}) {
  const { location } = await params;
  
  let statusFilter = "";
  let title = "";

  if (location === "purchased") {
    statusFilter = "purchased";
    title = "تم الشراء";
  } else if (location === "china") {
    statusFilter = "arrived_to_china";
    title = "طلبات مخزن الصين";
  } else if (location === "libya") {
    statusFilter = "arrived_libya";
    title = "طلبات مخزن ليبيا";
  } else if (location === "shipping") {
    statusFilter = "shipping_to_libya";
    title = "جاري الشحن لليبيا";
  } else if (location === "ready") {
    statusFilter = "ready_for_pickup";
    title = "جاهز للاستلام";
  } else if (location === "delivered") {
    statusFilter = "delivered";
    title = "تم التسليم";
  } else {
    return (
      <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className="p-8 text-center">المخزن غير موجود</div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

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
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
              </div>
              <OrdersDataTable filters={{ status: statusFilter }} />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
