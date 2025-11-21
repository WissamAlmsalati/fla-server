"use client";

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShippingRatesTable } from "@/features/shipping/components/ShippingRatesTable";
import { AddRateDialog } from "@/features/shipping/components/AddRateDialog";
import { Plane, Ship } from "lucide-react";

export default function Page() {
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
                <h1 className="text-2xl font-bold tracking-tight">إدارة أسعار الشحن</h1>
                <AddRateDialog />
              </div>

              <Tabs defaultValue="AIR" className="w-full" dir="rtl">
                <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
                  <TabsTrigger value="AIR" className="gap-2">
                    <Plane className="h-4 w-4" />
                    شحن جوي
                  </TabsTrigger>
                  <TabsTrigger value="SEA" className="gap-2">
                    <Ship className="h-4 w-4" />
                    شحن بحري
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="AIR" className="mt-6">
                  <ShippingRatesTable type="AIR" />
                </TabsContent>
                <TabsContent value="SEA" className="mt-6">
                  <ShippingRatesTable type="SEA" />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
