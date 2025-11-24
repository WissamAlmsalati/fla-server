"use client";

import { useState, useEffect } from "react";
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

export default function Page() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [countryFilter, setCountryFilter] = useState("all");
  const [scannerOpen, setScannerOpen] = useState(false);
  const [lastScanTime, setLastScanTime] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const filters: Record<string, string | number> = {};
  if (debouncedSearch) filters.search = debouncedSearch;
  if (statusFilter && statusFilter !== "all") filters.status = statusFilter;
  if (countryFilter && countryFilter !== "all") filters.country = countryFilter;

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
                  <Search className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
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
    </SidebarProvider>
  )
}

