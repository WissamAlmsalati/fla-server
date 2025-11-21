"use client";

import { useEffect } from "react";
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
import ChangeStatusDialog from "./ChangeStatusDialog";
import { OrderDetailsDrawer } from "./OrderDetailsDrawer";
import { Order } from "../slices/orderSlice";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
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
};

const exportOrders = (orders: Order[]) => {
  const columnMappings = {
    trackingNumber: "رقم التتبع",
    name: "اسم الطلب",
    "customer.user.name": "اسم العميل",
    usdPrice: "السعر (USD)",
    "shippingRate.name": "نوع الشحن",
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
  }));
  
  exportToCSV(dataToExport, columnMappings, "orders");
};

export function OrdersDataTable({ filters, lastScanTime }: OrdersDataTableProps) {
  const router = useRouter();
  const dispatch = useReduxDispatch();
  const { list: orders, status, error } = useReduxSelector((state) => state.orders);
  const [sheetOrder, setSheetOrder] = useState<Order | null>(null);

  useEffect(() => {
    dispatch(loadOrders(filters));
  }, [dispatch, JSON.stringify(filters)]);

  if (status === "loading") {
    return <div className="text-center p-4">جاري التحميل...</div>;
  }

  if (status === "failed") {
    return <div className="text-center text-red-500 p-4">خطأ: {error}</div>;
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={() => exportOrders(orders)} variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          تصدير CSV
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">رقم التتبع</TableHead>
              <TableHead className="text-right">اسم الطلب</TableHead>
              <TableHead className="text-right">العميل</TableHead>
              <TableHead className="text-right">السعر (USD)</TableHead>
              <TableHead className="text-right">نوع الشحن</TableHead>
              <TableHead className="text-right">تكلفة الشحن</TableHead>
              <TableHead className="text-right">الحالة</TableHead>
              <TableHead className="text-right">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow
                key={order.id}
                onClick={() => router.push(`/orders/${order.id}`)}
                className="cursor-pointer hover:bg-muted/50"
              >
                <TableCell className="font-medium font-mono">
                  {order.trackingNumber}
                </TableCell>
                <TableCell>{order.name}</TableCell>
                <TableCell>{order.customer?.user?.name || "-"}</TableCell>
                <TableCell>${order.usdPrice}</TableCell>
                <TableCell>{order.shippingRate?.name || "-"}</TableCell>
                <TableCell>{order.shippingCost ? `$${order.shippingCost}` : "-"}</TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {statusMap[order.status] || order.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex gap-2 justify-end">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSheetOrder(order)}
                    >
                      تعديل
                    </Button>
                    <ChangeStatusDialog order={order} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {orders.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center h-24">
                  لا يوجد طلبات
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
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


