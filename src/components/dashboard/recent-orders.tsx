"use client";

import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Order } from "@/features/orders/slices/orderSlice";

interface RecentOrdersProps {
  orders: Order[];
}

const statusMap: Record<string, string> = {
  pending: "قيد الانتظار",
  confirmed: "مؤكد",
  purchased: "تم الشراء",
  arrived_to_china: "وصل للصين",
  shipped_from_china: "شُحن من الصين",
  arrived_libya: "وصل ليبيا",
  ready_for_delivery: "جاهز للتسليم",
  delivered: "تم التسليم",
  cancelled: "ملغي",
};

export function RecentOrders({ orders }: RecentOrdersProps) {
  const router = useRouter();

  const handleRowClick = (orderId: number) => {
    router.push(`/orders/${orderId}`);
  };

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>أحدث الطلبات</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">رقم التتبع</TableHead>
              <TableHead className="text-right">العميل</TableHead>
              <TableHead className="text-right">الحالة</TableHead>
              <TableHead className="text-right">التاريخ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.slice(0, 5).map((order) => (
              <TableRow 
                key={order.id}
                onClick={() => handleRowClick(order.id)}
                className="cursor-pointer hover:bg-muted/50 transition-colors"
              >
                <TableCell className="font-medium">{order.trackingNumber}</TableCell>
                <TableCell>{order.customer?.user?.name || "غير معروف"}</TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {statusMap[order.status] || order.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Date(order.createdAt).toLocaleDateString("ar-LY")}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
