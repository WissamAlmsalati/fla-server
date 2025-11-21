"use client";

import { useEffect, useState } from "react";
import { Order } from "@/features/orders/slices/orderSlice";
import { fetchOrders } from "@/features/orders/api/ordersService";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";

interface CustomerOrdersProps {
  customerId: number;
}

const statusMap: Record<string, string> = {
  purchased: "تم الشراء",
  arrived_to_china: "وصل إلى الصين",
  shipping_to_libya: "جاري الشحن إلى ليبيا",
  arrived_libya: "وصل إلى ليبيا",
  ready_for_pickup: "جاهز للاستلام",
  delivered: "تم التسليم",
};

export function CustomerOrders({ customerId }: CustomerOrdersProps) {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const response = await fetchOrders({ customerId });
        setOrders(response.data as Order[]);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [customerId]);

  if (loading) return <div className="text-center p-4">جاري التحميل...</div>;
  if (error) return <div className="text-center text-red-500 p-4">خطأ: {error}</div>;

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-right">رقم التتبع</TableHead>
            <TableHead className="text-right">اسم الطلب</TableHead>
            <TableHead className="text-right">السعر (USD)</TableHead>
            <TableHead className="text-right">نوع الشحن</TableHead>
            <TableHead className="text-right">سعر الشحن</TableHead>
            <TableHead className="text-right">الحالة</TableHead>
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
              <TableCell>${order.usdPrice}</TableCell>
              <TableCell>{order.shippingRate?.name || "-"}</TableCell>
              <TableCell>{order.shippingCost ? `$${order.shippingCost}` : "-"}</TableCell>
              <TableCell>
                <Badge variant="outline">
                  {statusMap[order.status] || order.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
          {orders.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-center h-24">
                لا يوجد طلبات لهذا العميل
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
