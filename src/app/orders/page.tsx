"use client";

import { useState, useEffect, useCallback } from "react";
import { AppSidebar } from "@/components/app-sidebar"
import { OrdersDataTable } from "@/features/orders/components/OrdersDataTable"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { CreateOrderDialog } from "@/features/orders/components/CreateOrderDialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Scan, Search } from "lucide-react";
import { ScannerDialog } from "@/components/scanner-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { OrderDetailsDrawer } from "@/features/orders/components/OrderDetailsDrawer";
import { useBarcodeScanner } from "@/hooks/useBarcodeScanner";
import type { Order } from "@/features/orders/slices/orderSlice";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { AlertCircle } from "lucide-react";

export default function Page() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [countryFilter, setCountryFilter] = useState("all");
  const [scannerOpen, setScannerOpen] = useState(false);
  const [lastScanTime, setLastScanTime] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  
  // State for barcode scanner bottom sheet
  const [scannedOrder, setScannedOrder] = useState<Order | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
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
    enabled: !scannerOpen, // Only disable when camera scanner is open
  });

  useEffect(() => {
    if (search !== debouncedSearch) {
      setIsSearching(true);
    }
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setIsSearching(false);
    }, 300); // Reduced from 500ms to 300ms for faster search
    return () => clearTimeout(timer);
  }, [search]);

  const filters: Record<string, string | number> = {};
  if (debouncedSearch) filters.search = debouncedSearch;
  if (statusFilter && statusFilter !== "all") filters.status = statusFilter;
  if (countryFilter && countryFilter !== "all") filters.country = countryFilter;

  const handleOrderUpdate = () => {
    setScannedOrder(null);
    setIsDrawerOpen(false);
    setLastScanTime(Date.now()); // Refresh the table
  };

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
                <h1 className="text-2xl font-bold tracking-tight">إدارة الطلبات</h1>
                <CreateOrderDialog />
              </div>

              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className={`absolute right-2.5 top-2.5 h-4 w-4 ${isSearching ? 'text-primary animate-pulse' : 'text-muted-foreground'}`} />
                  <Input
                    placeholder="بحث برقم التتبع، اسم العميل، أو اسم الطلب..."
                    className="pr-8"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="جميع الحالات" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الحالات</SelectItem>
                    <SelectItem value="purchased">تم الشراء</SelectItem>
                    <SelectItem value="arrived_to_china">وصل إلى الصين</SelectItem>
                    <SelectItem value="shipping_to_libya">جاري الشحن إلى ليبيا</SelectItem>
                    <SelectItem value="arrived_libya">وصل إلى ليبيا</SelectItem>
                    <SelectItem value="ready_for_pickup">جاهز للاستلام</SelectItem>
                    <SelectItem value="delivered">تم التسليم</SelectItem>
                    <SelectItem value="canceled">ملغي</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={countryFilter} onValueChange={setCountryFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="جميع المناطق" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع المناطق</SelectItem>
                    <SelectItem value="CHINA">الصين (China)</SelectItem>
                    <SelectItem value="DUBAI">دبي (Dubai)</SelectItem>
                    <SelectItem value="USA">أمريكا (USA)</SelectItem>
                    <SelectItem value="TURKEY">تركيا (Turkey)</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setScannerOpen(true)}
                  title="Scan Barcode"
                >
                  <Scan className="h-4 w-4" />
                </Button>
              </div>

              <OrdersDataTable filters={filters} lastScanTime={lastScanTime} />
            </div>
          </div>
        </div>
      </SidebarInset>

      <ScannerDialog
        open={scannerOpen}
        onOpenChange={setScannerOpen}
        onScan={(result) => {
          setSearch(result);
          setDebouncedSearch(result);
          setLastScanTime(Date.now());
          setScannerOpen(false);
        }}
      />

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
  )
}
