"use client";

import { Order } from "../slices/orderSlice";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface OrderDetailsModalProps {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const statusMap: Record<string, string> = {
  purchased: "تم الشراء",
  arrived_to_china: "وصل إلى الصين",
  shipping_to_libya: "جاري الشحن إلى ليبيا",
  arrived_libya: "وصل إلى ليبيا",
  ready_for_pickup: "جاهز للاستلام",
  delivered: "تم التسليم",
};

export function OrderDetailsModal({ order, open, onOpenChange }: OrderDetailsModalProps) {
  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-right">تفاصيل الطلب</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-right">
              <label className="text-sm font-medium text-muted-foreground">رقم التتبع</label>
              <p className="font-mono font-medium">{order.trackingNumber}</p>
            </div>
            <div className="text-right">
              <label className="text-sm font-medium text-muted-foreground">اسم الطلب</label>
              <p>{order.name}</p>
            </div>
            <div className="text-right">
              <label className="text-sm font-medium text-muted-foreground">العميل</label>
              <p>{order.customer?.user?.name || "-"}</p>
            </div>
            <div className="text-right">
              <label className="text-sm font-medium text-muted-foreground">الحالة</label>
              <Badge variant="outline">
                {statusMap[order.status] || order.status}
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Pricing */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-right">
              <label className="text-sm font-medium text-muted-foreground">السعر (USD)</label>
              <p className="font-medium">${order.usdPrice}</p>
            </div>
            <div className="text-right">
              <label className="text-sm font-medium text-muted-foreground">السعر (CNY)</label>
              <p>{order.cnyPrice ? `¥${order.cnyPrice}` : "-"}</p>
            </div>
          </div>

          <Separator />

          {/* Shipping */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-right">
              <label className="text-sm font-medium text-muted-foreground">نوع الشحن</label>
              <p>{order.shippingRate?.name || "-"}</p>
            </div>
            <div className="text-right">
              <label className="text-sm font-medium text-muted-foreground">تكلفة الشحن</label>
              <p>{order.shippingCost ? `$${order.shippingCost}` : "-"}</p>
            </div>
            <div className="text-right">
              <label className="text-sm font-medium text-muted-foreground">الوزن</label>
              <p>{order.weight ? `${order.weight} كجم` : "-"}</p>
            </div>
          </div>

          <Separator />

          {/* Additional Info */}
          <div className="space-y-4">
            <div className="text-right">
              <label className="text-sm font-medium text-muted-foreground">رابط المنتج</label>
              <p>
                {order.productUrl ? (
                  <a
                    href={order.productUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {order.productUrl}
                  </a>
                ) : (
                  "-"
                )}
              </p>
            </div>
            <div className="text-right">
              <label className="text-sm font-medium text-muted-foreground">ملاحظات</label>
              <p className="whitespace-pre-wrap">{order.notes || "-"}</p>
            </div>
            <div className="text-right">
              <label className="text-sm font-medium text-muted-foreground">تاريخ الإنشاء</label>
              <p>{format(new Date(order.createdAt), "dd MMMM yyyy", { locale: ar })}</p>
            </div>
            <div className="text-right">
              <label className="text-sm font-medium text-muted-foreground">آخر تحديث</label>
              <p>{format(new Date(order.updatedAt), "dd MMMM yyyy", { locale: ar })}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}