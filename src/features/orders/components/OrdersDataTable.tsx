"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useReduxDispatch, useReduxSelector } from "@/redux/provider";
import { loadOrders } from "../slices/orderSlice";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { OrderDetailsDrawer } from "./OrderDetailsDrawer";
import { Order } from "../slices/orderSlice";
import { Button } from "@/components/ui/button";
import { Download, MessageSquare, ChevronLeft, ChevronRight, ArrowUpDown } from "lucide-react";
import { exportToCSV } from "@/lib/exportToCSV";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface OrdersDataTableProps {
  filters?: Record<string, string | number>;
  lastScanTime?: number;
}

const statusMap: Record<string, string> = {
  purchased: "تم الشراء",
  arrived_to_china: "وصلت إلى المخزن",
  shipping_to_libya: "جاري الشحن إلى ليبيا",
  arrived_libya: "وصل إلى ليبيا",
  ready_for_pickup: "جاهز للاستلام",
  delivered: "تم التسليم",
  canceled: "ملغي",
};

const countryMap: Record<string, string> = {
  CHINA: "الصين",
  DUBAI: "دبي",
  USA: "أمريكا",
  TURKEY: "تركيا",
};

const exportOrders = (orders: Order[]) => {
  const columnMappings = {
    trackingNumber: "رقم التتبع",
    name: "اسم الطلب",
    "customer.user.name": "اسم العميل",
    usdPrice: "السعر (USD)",
    "shippingRate.name": "نوع الشحن",
    "shippingRate.country": "بلد الشحن",
    shippingCost: "تكلفة الشحن",
    flightNumber: "رقم الرحلة",
    status: "الحالة",
    createdAt: "تاريخ الإنشاء",
    updatedAt: "آخر تحديث",
  };
  
  const dataToExport = orders.map(order => ({
    ...order,
    flightNumber: order.flight?.flightNumber || order.flightNumber || "-",
    status: statusMap[order.status] || order.status,
    createdAt: format(new Date(order.createdAt), "dd MMMM yyyy", { locale: ar }),
    updatedAt: format(new Date(order.updatedAt), "dd MMMM yyyy", { locale: ar }),
    shippingCost: order.shippingCost || 0,
    shippingRate: order.shippingRate ? {
      ...order.shippingRate,
      country: order.shippingRate.country ? countryMap[order.shippingRate.country] || order.shippingRate.country : "-"
    } : undefined,
  }));
  
  exportToCSV(dataToExport, columnMappings, "orders");
};

const ITEMS_PER_PAGE = 10;

export function OrdersDataTable({ filters, lastScanTime }: OrdersDataTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const dispatch = useReduxDispatch();
  const { list: orders, status, error } = useReduxSelector((state) => state.orders);
  const [sheetOrder, setSheetOrder] = useState<Order | null>(null);
  
  const pageParam = searchParams.get("page");
  const currentPage = pageParam ? parseInt(pageParam, 10) : 1;
  const sortParam = searchParams.get("sort") || "desc"; // Default desc
  const prevFiltersRef = useRef(filters);

  useEffect(() => {
    dispatch(loadOrders(filters));
    
    // Only reset to page 1 if the filters ACTUALLY changed (e.g. user typed a search).
    if (JSON.stringify(prevFiltersRef.current) !== JSON.stringify(filters)) {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("page");
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      prevFiltersRef.current = filters;
    }
  }, [dispatch, JSON.stringify(filters), searchParams, pathname, router]);

  if (status === "loading") {
    return <div className="text-center p-4">جاري التحميل...</div>;
  }

  if (status === "failed") {
    return <div className="text-center text-red-500 p-4">خطأ: {error}</div>;
  }

  // Sort orders
  const sortedOrders = [...orders].sort((a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    
    if (dateA !== dateB) {
      return sortParam === "asc" ? dateA - dateB : dateB - dateA;
    }
    
    // If dates are exactly the same (common in seeded data), sort by ID
    return sortParam === "asc" ? a.id - b.id : b.id - a.id;
  });

  // Pagination calculations
  const totalPages = Math.ceil(sortedOrders.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedOrders = sortedOrders.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSortChange = (newSort: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", newSort);
    params.set("page", "1"); // Reset to page 1 on sort change
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowUpDown className="h-4 w-4" />
              {sortParam === "desc" ? "الأحدث أولاً" : "الأقدم أولاً"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleSortChange("desc")}>
              الأحدث أولاً
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSortChange("asc")}>
              الأقدم أولاً
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button onClick={() => exportOrders(sortedOrders)} variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          تصدير CSV
        </Button>
      </div>
      
      {/* ─── Mobile Cards (< md) ─── */}
      <div className="md:hidden flex flex-col gap-3">
        {paginatedOrders.map((order, index) => (
          <div
            key={order.id}
            className="rounded-xl border bg-card p-4 shadow-sm flex flex-col gap-3 cursor-pointer active:scale-[0.98] transition-transform"
            onClick={() => router.push(`/orders/${order.id}`)}
          >
            {/* Top row */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                <span className="font-semibold truncate text-base">{order.name}</span>
                <span className="font-mono text-xs text-muted-foreground truncate">{order.trackingNumber}</span>
              </div>
              <Badge variant={order.status === "canceled" ? "destructive" : "outline"} className="shrink-0 text-xs">
                {statusMap[order.status] || order.status}
              </Badge>
            </div>

            {/* Details grid */}
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-muted-foreground text-xs">العميل</p>
                <p className="font-medium truncate">{order.customer?.user?.name || "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">السعر (USD)</p>
                <p className="font-medium">${order.usdPrice || "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">بلد الشحن</p>
                <p className="font-medium">{order.country ? (countryMap[order.country] || order.country) : "الصين"}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">تكلفة الشحن</p>
                <p className="font-medium">{order.shippingCost ? `$${order.shippingCost}` : "—"}</p>
              </div>
              {(order.flight?.flightNumber || order.flightNumber) && (
                <div>
                  <p className="text-muted-foreground text-xs">رقم الرحلة</p>
                  <p className="font-mono font-medium">{order.flight?.flightNumber || order.flightNumber}</p>
                </div>
              )}
              {order.unreadCount && order.unreadCount > 0 ? (
                <div className="flex items-center gap-1 text-destructive">
                  <MessageSquare className="h-4 w-4" />
                  <span className="font-semibold">{order.unreadCount} رسالة</span>
                </div>
              ) : null}
            </div>

            {/* Action */}
            <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSheetOrder(order)}
              >
                تعديل
              </Button>
            </div>
          </div>
        ))}
        {paginatedOrders.length === 0 && (
          <p className="text-center text-muted-foreground py-10">لا يوجد طلبات</p>
        )}
      </div>

      {/* ─── Desktop Table (≥ md) ─── */}
      <div className="hidden md:block rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right w-16">#</TableHead>
              <TableHead className="text-right">رقم التتبع</TableHead>
              <TableHead className="text-right">اسم الطلب</TableHead>
              <TableHead className="text-right">العميل</TableHead>
              <TableHead className="text-right">السعر (USD)</TableHead>
              <TableHead className="text-right">نوع الشحن</TableHead>
              <TableHead className="text-right">بلد الشحن</TableHead>
              <TableHead className="text-right">تكلفة الشحن</TableHead>
              <TableHead className="text-right">رقم الرحلة</TableHead>
              <TableHead className="text-right">الحالة</TableHead>
              <TableHead className="text-right">رسائل</TableHead>
              <TableHead className="text-right">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedOrders.map((order, index) => (
              <TableRow
                key={order.id}
                onClick={() => router.push(`/orders/${order.id}`)}
                className="cursor-pointer hover:bg-muted/50"
              >
                <TableCell className="text-muted-foreground">
                  {startIndex + index + 1}
                </TableCell>
                <TableCell className="font-medium font-mono">
                  {order.trackingNumber}
                </TableCell>
                <TableCell>{order.name}</TableCell>
                <TableCell>{order.customer?.user?.name || "-"}</TableCell>
                <TableCell>${order.usdPrice}</TableCell>
                <TableCell>{order.shippingRate?.name || "-"}</TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {order.country ? (countryMap[order.country] || order.country) : "الصين"}
                  </Badge>
                </TableCell>
                <TableCell>{order.shippingCost ? `$${order.shippingCost}` : "-"}</TableCell>
                <TableCell className="font-mono">{order.flight?.flightNumber || order.flightNumber || "-"}</TableCell>
                <TableCell>
                  <Badge variant={order.status === "canceled" ? "destructive" : "outline"}>
                    {statusMap[order.status] || order.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {order.unreadCount && order.unreadCount > 0 ? (
                    <div className="flex items-center gap-1.5 text-destructive justify-end">
                      <MessageSquare className="h-4 w-4" />
                      <span className="font-semibold">{order.unreadCount}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-muted-foreground justify-end">
                      <MessageSquare className="h-4 w-4" />
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSheetOrder(order)}
                  >
                    تعديل
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {paginatedOrders.length === 0 && (
              <TableRow>
                <TableCell colSpan={12} className="text-center h-24">
                  لا يوجد طلبات
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>


      {sortedOrders.length > 0 && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-muted-foreground">
            عرض {startIndex + 1} - {Math.min(endIndex, sortedOrders.length)} من {sortedOrders.length} طلب
          </div>
        
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronRight className="h-4 w-4" />
              السابق
            </Button>
            
            <div className="flex items-center gap-1">
              {(() => {
                const pages = [];
                // Always show first page
                pages.push(1);

                if (currentPage > 3) {
                  pages.push('...');
                }

                // Show pages around current page
                const start = Math.max(2, currentPage - 1);
                const end = Math.min(totalPages - 1, currentPage + 1);

                for (let i = start; i <= end; i++) {
                  pages.push(i);
                }

                if (currentPage < totalPages - 2) {
                  pages.push('...');
                }

                // Always show last page if more than 1 page
                if (totalPages > 1) {
                  pages.push(totalPages);
                }

                return pages.map((page, index) => {
                  if (page === '...') {
                    return <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground">...</span>;
                  }

                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(page as number)}
                      className="min-w-[2.5rem]"
                    >
                      {page}
                    </Button>
                  );
                });
              })()}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              التالي
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
        )}
        </div>
      )}

      <OrderDetailsDrawer 
        order={sheetOrder} 
        open={!!sheetOrder} 
        onOpenChange={(open) => !open && setSheetOrder(null)} 
        onUpdate={() => dispatch(loadOrders(filters))}
      />
    </>
  );
}



