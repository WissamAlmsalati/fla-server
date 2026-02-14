"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { OrdersDataTable } from "@/features/orders/components/OrdersDataTable";
import { OrderDetailsDrawer } from "@/features/orders/components/OrderDetailsDrawer";
import { useBarcodeScanner } from "@/hooks/useBarcodeScanner";
import type { Order } from "@/features/orders/slices/orderSlice";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";

const locationConfig: Record<string, { statusFilter: string; title: string }> = {
  purchased: { statusFilter: "purchased", title: "تم الشراء" },
  china: { statusFilter: "arrived_to_china", title: "المخزن الخارجي" },
  libya: { statusFilter: "arrived_libya", title: "طلبات مخزن ليبيا" },
  shipping: { statusFilter: "shipping_to_libya", title: "جاري الشحن لليبيا" },
  ready: { statusFilter: "ready_for_pickup", title: "جاهز للاستلام" },
  delivered: { statusFilter: "delivered", title: "تم التسليم" },
};

export default function WarehouseOrdersPage() {
  const params = useParams();
  const location = params.location as string;
  
  const config = locationConfig[location];
  
  // State for barcode scanner bottom sheet
  const [scannedOrder, setScannedOrder] = useState<Order | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [lastScanTime, setLastScanTime] = useState(0);
  
  // State for not found dialog
  const [notFoundOpen, setNotFoundOpen] = useState(false);
  const [notFoundBarcode, setNotFoundBarcode] = useState("");

  const fetchOrderByTracking = useCallback(async (trackingNumber: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/orders?search=${trackingNumber}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.data && data.data.length > 0) {
        setScannedOrder(data.data[0]);
        setIsDrawerOpen(true);
      } else {
        // Show not found dialog
        setNotFoundBarcode(trackingNumber);
        setNotFoundOpen(true);
      }
    } catch (err) {
      console.error("Error fetching order:", err);
      toast.error("فشل في تحميل بيانات الطلب");
    }
  }, []);

  // Only enable barcode scanner on ready and delivered pages
  const isScannerEnabled = location === "ready" || location === "delivered";

  // Hardware barcode scanner listener
  useBarcodeScanner({
    onScan: (barcode) => {
      // Close any open dialogs first
      setIsDrawerOpen(false);
      setScannedOrder(null);
      setNotFoundOpen(false);
      
      // Show toast that we detected a scan
      toast.info(`جاري البحث عن: ${barcode}`);
      fetchOrderByTracking(barcode);
    },
    enabled: isScannerEnabled && !isDrawerOpen,
  });

  const handleOrderUpdate = () => {
    setScannedOrder(null);
    setIsDrawerOpen(false);
    setLastScanTime(Date.now()); // Refresh the table
  };

  if (!config) {
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
                <h1 className="text-2xl font-bold tracking-tight">{config.title}</h1>
              </div>
              <OrdersDataTable filters={{ status: config.statusFilter }} lastScanTime={lastScanTime} />
            </div>
          </div>
        </div>
      </SidebarInset>

      {/* Bottom sheet for barcode scanner */}
      <OrderDetailsDrawer
        order={scannedOrder}
        open={isDrawerOpen}
        onOpenChange={(open) => {
          setIsDrawerOpen(open);
          if (!open) setScannedOrder(null);
        }}
        onUpdate={handleOrderUpdate}
      />

      {/* Product not found dialog */}
      <Dialog open={notFoundOpen} onOpenChange={setNotFoundOpen}>
        <DialogContent className="sm:max-w-md" dir="rtl">
          <DialogHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <DialogTitle className="text-center text-xl">المنتج غير موجود</DialogTitle>
            <DialogDescription className="text-center">
              لم يتم العثور على طلب برقم التتبع:
              <br />
              <span className="font-mono font-bold text-foreground">{notFoundBarcode}</span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center">
            <Button onClick={() => setNotFoundOpen(false)}>
              إغلاق
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
