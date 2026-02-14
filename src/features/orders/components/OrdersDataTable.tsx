"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
import { Download, MessageSquare, ChevronLeft, ChevronRight } from "lucide-react";
import { exportToCSV } from "@/lib/exportToCSV";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface OrdersDataTableProps {
  filters?: Record<string, string | number>;
  lastScanTime?: number;
}

const statusMap: Record<string, string> = {
  purchased: "تم الشراء",
  arrived_to_china: "وصل إلى الصين",
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
    status: "الحالة",
    createdAt: "تاريخ الإنشاء",
    updatedAt: "آخر تحديث",
  };
  
  const dataToExport = orders.map(order => ({
    ...order,
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

const ITEMS_PER_PAGE = 20;

export function OrdersDataTable({ filters, lastScanTime }: OrdersDataTableProps) {
  const router = useRouter();
  const dispatch = useReduxDispatch();
  const { list: orders, status, error } = useReduxSelector((state) => state.orders);
  const [sheetOrder, setSheetOrder] = useState<Order | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    dispatch(loadOrders(filters));
  }, [dispatch, JSON.stringify(filters)]);

  // Reset to page 1 when orders change
  useEffect(() => {
    setCurrentPage(1);
  }, [orders.length]);

  if (status === "loading") {
    return <div className="text-center p-4">جاري التحميل...</div>;
  }

  if (status === "failed") {
    return <div className="text-center text-red-500 p-4">خطأ: {error}</div>;
  }

  // Pagination calculations
  const totalPages = Math.ceil(orders.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedOrders = orders.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={() => exportOrders(orders)} variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          تصدير CSV
        </Button>
      </div>
      
      <div className="rounded-md border overflow-x-auto">
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
                <TableCell colSpan={11} className="text-center h-24">
                  لا يوجد طلبات
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Order count and Pagination Controls */}
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-muted-foreground">
          عرض {startIndex + 1} - {Math.min(endIndex, orders.length)} من {orders.length} طلب
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

      <OrderDetailsDrawer 
        order={sheetOrder} 
        open={!!sheetOrder} 
        onOpenChange={(open) => !open && setSheetOrder(null)} 
        onUpdate={() => dispatch(loadOrders(filters))}
      />
    </>
  );
}



