"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Order } from "../slices/orderSlice";
import { fetchOrder } from "../api/ordersService";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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
  Truck,
  Edit,
  CheckCircle,
  Clock,
  MapPin,
  AlertCircle,
  ExternalLink,
  MessageSquare
} from "lucide-react";
import { OrderDetailsDrawer } from "./OrderDetailsDrawer";
import { OrderChat } from "./OrderChat";
import { generateInvoicePDF } from "@/lib/generateInvoicePDF";
import { generateStickerLabel } from "@/lib/generateStickerLabel";
import { getStatusLabel, getCountryName } from "@/lib/orderStatus";

interface OrderDetailProps {
  orderId: number;
}

const STATUS_ORDER = [
  "purchased",
  "arrived_to_china",
  "shipping_to_libya",
  "arrived_libya",
  "ready_for_pickup",
  "delivered",
];

const statusConfig: Record<string, { icon: any; color: string; bgColor: string }> = {
  purchased: { icon: CheckCircle, color: "text-blue-600", bgColor: "bg-blue-50" },
  arrived_to_china: { icon: MapPin, color: "text-green-600", bgColor: "bg-green-50" },
  shipping_to_libya: { icon: Truck, color: "text-orange-600", bgColor: "bg-orange-50" },
  arrived_libya: { icon: MapPin, color: "text-purple-600", bgColor: "bg-purple-50" },
  ready_for_pickup: { icon: Package, color: "text-yellow-600", bgColor: "bg-yellow-50" },
  delivered: { icon: CheckCircle, color: "text-green-600", bgColor: "bg-green-50" },
};

const StatusTimeline = ({ currentStatus, country, logs }: { currentStatus: string; country?: string | null; logs?: { status: string; createdAt: string }[] }) => {
  const currentIndex = STATUS_ORDER.indexOf(currentStatus);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          حالة الطلب
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {STATUS_ORDER.map((status, index) => {
            const config = statusConfig[status];
            const Icon = config.icon;
            const isCompleted = index <= currentIndex;
            const isCurrent = index === currentIndex;
            // Find the most recent log for this status by searching backwards (since they are ordered ascending typically)
            // fallback to any log if findLast isn't available
            const log = logs?.slice().reverse().find((l) => l.status === status) || logs?.find((l) => l.status === status);

            return (
              <div key={status} className="flex items-center gap-3">
                <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  isCompleted ? config.bgColor : 'bg-gray-100'
                } ${isCompleted ? config.color : 'text-gray-400'}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 px-2">
                  <div className={`font-medium ${isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {getStatusLabel(status, country)}
                  </div>
                  {isCurrent && (
                    <div className="text-sm text-muted-foreground font-semibold">الحالة الحالية</div>
                  )}
                  {log && (
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {format(new Date(log.createdAt), "dd MMM yyyy, HH:mm", { locale: ar })}
                    </div>
                  )}
                </div>
                {isCompleted && (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export function OrderDetail({ orderId }: OrderDetailProps) {
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditDrawer, setShowEditDrawer] = useState(false);

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
      {/* Header Section */}
      <div className="flex items-center justify-between gap-4 p-6 bg-linear-to-r from-primary/5 to-primary/10 rounded-lg border">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowRight className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Package className="h-8 w-8 text-primary" />
              {order.name}
            </h1>
            <div className="text-sm text-muted-foreground font-mono mt-2 flex items-center gap-2">
              <span>رقم التتبع:</span>
              <Badge variant="secondary" className="font-mono">
                {order.trackingNumber}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-xs px-4 py-2 capitalize border-2">
            {getStatusLabel(order.status, order.country)}
          </Badge>
          <Button
            onClick={() => generateStickerLabel(order)}
            variant="outline"
            className="gap-2"
          >
            <Truck className="h-4 w-4" />
            طباعة ملصق
          </Button>
          {order.status === "delivered" && (
            <Button
              onClick={() => generateInvoicePDF(order)}
              variant="outline"
              className="gap-2"
            >
              <FileText className="h-4 w-4" />
              تحميل الفاتورة
            </Button>
          )}
          <Button onClick={() => setShowEditDrawer(true)} className="gap-2">
            <Edit className="h-4 w-4" />
            تعديل
          </Button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Order Details & Customer Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Details Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                تفاصيل الطلب
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      السعر (USD)
                    </span>
                    <span className="font-bold text-lg">${order.usdPrice}</span>
                  </div>
                  {order.cnyPrice && (
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <span className="text-muted-foreground">السعر (CNY)</span>
                      <span className="font-bold">¥{order.cnyPrice}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Scale className="h-4 w-4" />
                      الوزن
                    </span>
                    <span className="font-bold">{order.weight ? `${order.weight} كجم` : "-"}</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      بلد الشحن
                    </span>
                    <Badge variant="outline" className="font-bold">
                      {getCountryName(order.country)}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Truck className="h-4 w-4" />
                      نوع الشحن
                    </span>
                    <span className="font-bold">{order.shippingRate?.name || "-"}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-muted-foreground">تكلفة الشحن</span>
                    <span className="font-bold text-green-600">
                      {order.shippingCost ? `$${order.shippingCost}` : "-"}
                    </span>
                  </div>
                  {order.flightNumber && (
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <Truck className="h-4 w-4" />
                        رقم الرحلة
                      </span>
                      <span className="font-bold font-mono text-primary">
                        {order.flightNumber}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      تاريخ الإنشاء
                    </span>
                    <span className="font-bold text-sm">
                      {format(new Date(order.createdAt), "dd MMMM yyyy", { locale: ar })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      آخر تحديث
                    </span>
                    <span className="font-bold text-sm">
                      {format(new Date(order.updatedAt), "dd MMMM yyyy", { locale: ar })}
                    </span>
                  </div>
                </div>
              </div>

              {order.productUrl && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <LinkIcon className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-blue-900">رابط المنتج</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(order.productUrl, '_blank')}
                      className="gap-2"
                    >
                      <ExternalLink className="h-3 w-3" />
                      فتح الرابط
                    </Button>
                  </div>
                  <p className="text-sm text-blue-700 mt-2 truncate">{order.productUrl}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Customer Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                معلومات العميل
              </CardTitle>
            </CardHeader>
            <CardContent>
              {order.customer ? (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-muted-foreground">الاسم</span>
                    <span className="font-bold cursor-pointer hover:text-primary transition-colors">
                      {order.customer.user?.name || `عميل #${order.customer.id}`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-muted-foreground">كود العميل</span>
                    <Badge variant="secondary" className="font-mono">
                      {(() => {
                        if (!order.customer) return "-";
                        switch (order.country) {
                          case "DUBAI": return order.customer.dubaiCode || order.customer.code;
                          case "USA": return order.customer.usaCode || order.customer.code;
                          case "TURKEY": return order.customer.turkeyCode || order.customer.code;
                          default: return order.customer.code;
                        }
                      })()}
                    </Badge>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  لا يوجد عميل مرتبط بهذا الطلب
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes Card */}
          {order.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  ملاحظات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">
                    {order.notes}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Chat Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                المحادثة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <OrderChat orderId={order.id} />
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Status Timeline */}
        <div className="lg:col-span-1">
          <StatusTimeline currentStatus={order.status} country={order.country} logs={order.logs} />
        </div>
      </div>

      {/* Edit Drawer */}
      <OrderDetailsDrawer
        order={order}
        open={showEditDrawer}
        onOpenChange={setShowEditDrawer}
        onUpdate={() => {
          // Reload order data
          const load = async () => {
            try {
              const data = await fetchOrder(orderId);
              setOrder(data as Order);
            } catch (err: any) {
              setError(err.message);
            }
          };
          load();
        }}
      />
    </div>
  );
}
