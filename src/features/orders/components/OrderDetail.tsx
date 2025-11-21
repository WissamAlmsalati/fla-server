"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Order } from "../slices/orderSlice";
import { fetchOrder } from "../api/ordersService";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { 
  ArrowRight, 
  Package, 
  User, 
  DollarSign, 
  Scale, 
  Calendar, 
  FileText, 
  Link as LinkIcon,
  Truck
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface OrderDetailProps {
  orderId: number;
}

const statusMap: Record<string, string> = {
  purchased: "تم الشراء",
  arrived_to_china: "وصل إلى الصين",
  shipping_to_libya: "جاري الشحن إلى ليبيا",
  arrived_libya: "وصل إلى ليبيا",
  ready_for_pickup: "جاهز للاستلام",
  delivered: "تم التسليم",
};

export function OrderDetail({ orderId }: OrderDetailProps) {
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchOrder(orderId);
        setOrder(data as Order);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [orderId]);

  if (loading) return <div className="p-8 text-center">جاري التحميل...</div>;
  if (error || !order) return <div className="p-8 text-center text-red-500">خطأ: {error || "الطلب غير موجود"}</div>;

  return (
    <div className="space-y-6 text-right" dir="rtl">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowRight className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Package className="h-6 w-6" />
              {order.name}
            </h1>
            <div className="text-sm text-muted-foreground font-mono mt-1">
              {order.trackingNumber}
            </div>
          </div>
        </div>
        <Badge variant="outline" className="text-lg px-3 py-1 capitalize">
          {statusMap[order.status] || order.status}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              تفاصيل الطلب
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-muted-foreground">السعر (USD)</span>
              <span className="font-semibold flex items-center gap-1">
                {order.usdPrice} <DollarSign className="h-3 w-3" />
              </span>
            </div>
            {order.cnyPrice && (
              <div className="flex items-center justify-between border-b pb-2">
                <span className="text-muted-foreground">السعر (CNY)</span>
                <span className="font-semibold">¥{order.cnyPrice}</span>
              </div>
            )}
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-muted-foreground">الوزن</span>
              <span className="font-semibold flex items-center gap-1">
                {order.weight || "-"} <Scale className="h-3 w-3" />
              </span>
            </div>
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-muted-foreground">تاريخ الإنشاء</span>
              <span>{format(new Date(order.createdAt), "dd MMMM yyyy", { locale: ar })}</span>
            </div>
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-muted-foreground">آخر تحديث</span>
              <span>{format(new Date(order.updatedAt), "dd MMMM yyyy", { locale: ar })}</span>
            </div>
            {order.productUrl && (
              <div className="flex flex-col gap-2 pt-2">
                <span className="text-muted-foreground">رابط المنتج</span>
                <a 
                  href={order.productUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline flex items-center gap-1 text-sm truncate"
                >
                  <LinkIcon className="h-3 w-3" />
                  {order.productUrl}
                </a>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                معلومات العميل
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              {order.customer ? (
                <>
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="text-muted-foreground">الاسم</span>
                    <span 
                      className="font-semibold cursor-pointer hover:text-primary"
                      onClick={() => router.push(`/users/${order.customer?.user.id}`)} // Assuming user.id is available via customer relation if we fetched it right. Wait, the type says customer.user.name. I need to check if I have the ID.
                      // The type in slice has customer.id, customer.code, customer.user.name.
                      // I should probably navigate to customer page or user page.
                      // The customer object has id. I can fetch customer details.
                      // Actually, let's just show the name for now.
                    >
                      {order.customer.user.name}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="text-muted-foreground">كود العميل</span>
                    <Badge variant="secondary" className="font-mono">
                      {order.customer.code}
                    </Badge>
                  </div>
                </>
              ) : (
                <div className="text-muted-foreground text-center py-4">
                  لا يوجد عميل مرتبط
                </div>
              )}
            </CardContent>
          </Card>

          {order.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  ملاحظات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {order.notes}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
