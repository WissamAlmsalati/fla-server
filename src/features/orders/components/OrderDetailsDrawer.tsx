"use client";

import { useState, useEffect } from "react";
import { useReduxDispatch, useReduxSelector } from "@/redux/provider";
import { updateOrder, Order } from "../slices/orderSlice";
import { loadRates } from "../../shipping/slices/shippingSlice";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Copy, ExternalLink, Printer } from "lucide-react";
import { getStatusLabel, getCountryName } from "@/lib/orderStatus";
import { generateStickerLabel } from "@/lib/generateStickerLabel";

interface OrderDetailsDrawerProps {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate?: () => void;
}

const STATUS_ORDER = [
  "purchased",
  "arrived_to_china",
  "shipping_to_libya",
  "arrived_libya",
  "ready_for_pickup",
  "delivered"
];

export function OrderDetailsDrawer({ order, open, onOpenChange, onUpdate }: OrderDetailsDrawerProps) {
  const dispatch = useReduxDispatch();
  const { user } = useReduxSelector((state) => state.auth);
  const role = user?.role || "CUSTOMER";
  const { rates, status: ratesStatus } = useReduxSelector((state) => state.shipping);
  const [status, setStatus] = useState(order?.status || "");
  const [weight, setWeight] = useState<string>("");
  const [shippingType, setShippingType] = useState<string>("");
  const [shippingRateId, setShippingRateId] = useState<string>("");
  const [flightNumber, setFlightNumber] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (order) {
      setStatus(order.status);
      setWeight(order.weight?.toString() || "");
      
      // Pre-fill shipping info if available
      if (order.shippingRateId) {
        setShippingRateId(order.shippingRateId.toString());
      } else {
        setShippingRateId("");
      }
      setShippingType(""); 
      setFlightNumber(order.flightNumber || "");
    }
  }, [order]);

  // Set shipping type when rates are loaded and we have a shippingRateId
  useEffect(() => {
    if (rates.length > 0 && shippingRateId && !shippingType) {
      const rate = rates.find(r => r.id.toString() === shippingRateId);
      if (rate) {
        setShippingType(rate.type);
      }
    }
  }, [rates, shippingRateId, shippingType]);

  useEffect(() => {
    if (open) {
      dispatch(loadRates());
    }
  }, [open, dispatch]);

  if (!order) return null;

  const showShippingFields = status === "shipping_to_libya";
  const filteredRates = rates.filter(r => 
    (!shippingType || r.type === shippingType) && r.country === (order.country || "CHINA")
  );
  const selectedRate = rates.find(r => r.id.toString() === shippingRateId);
  const calculatedCost = (weight && selectedRate) ? parseFloat(weight) * selectedRate.price : 0;

  const currentStatusIndex = STATUS_ORDER.indexOf(order.status);

  const handleSave = async () => {
    // Prevent saving if nothing changed
    if (status === order.status && 
        weight === (order.weight?.toString() || "") && 
        shippingRateId === (order.shippingRateId?.toString() || "") &&
        flightNumber === (order.flightNumber || "")) {
      return;
    }

    // Validate status progression - prevent skipping statuses
    // Allow canceling from any status
    if (status !== "canceled") {
      const newStatusIndex = STATUS_ORDER.indexOf(status);
      if (newStatusIndex > currentStatusIndex + 1) {
        toast.error(`لا يمكن تجاوز الحالات. يجب إكمال الحالة الحالية "${getStatusLabel(order.status, order.country)}" أولاً`);
        return;
      }
    }

    if (status === "shipping_to_libya" && (!shippingType || !weight || !shippingRateId) && status !== order.status) {
      toast.error("يرجى اختيار طريقة الشحن ونوع الشحن وإدخال الوزن عند الشحن إلى ليبيا");
      return;
    }

    try {
      setLoading(true);
      await dispatch(updateOrder({ 
        id: order.id, 
        data: { 
          status,
          weight: weight ? parseFloat(weight) : undefined,
          shippingRateId: shippingRateId ? parseInt(shippingRateId) : undefined,
          flightNumber: flightNumber || undefined
        } 
      })).unwrap();
      toast.success("تم تحديث حالة الطلب بنجاح");
      onOpenChange(false);
      onUpdate?.();
    } catch (error: any) {
      toast.error(error.message || "فشل تحديث حالة الطلب");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("تم النسخ");
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[90vh] overflow-y-auto" dir="rtl">
        <div className="mx-auto w-full max-w-full md:max-w-sm px-2 md:px-0">
          <SheetHeader>
            <SheetTitle className="text-center text-xl">{order.name}</SheetTitle>
            <SheetDescription className="text-center">
              {order.trackingNumber}
            </SheetDescription>
          </SheetHeader>
          
          <div className="p-4 pb-0 space-y-6">
            {/* Order Details Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
              <div className="flex flex-col gap-1 p-3 bg-muted/50 rounded-lg">
                <span className="text-xs text-muted-foreground">العميل</span>
                <span className="font-medium text-sm truncate">
                  {order.customer?.user?.name || "-"}
                </span>
                <span className="text-xs text-muted-foreground font-mono">
                  {(() => {
                    if (!order.customer) return "-";
                    switch (order.country) {
                      case "DUBAI": return order.customer.dubaiCode || order.customer.code;
                      case "USA": return order.customer.usaCode || order.customer.code;
                      case "TURKEY": return order.customer.turkeyCode || order.customer.code;
                      default: return order.customer.code;
                    }
                  })()}
                </span>
              </div>
              <div className="flex flex-col gap-1 p-3 bg-muted/50 rounded-lg">
                <span className="text-xs text-muted-foreground">السعر</span>
                <span className="font-medium text-sm">${order.usdPrice}</span>
                {order.cnyPrice && (
                  <span className="text-xs text-muted-foreground">¥{order.cnyPrice}</span>
                )}
              </div>
            </div>

            {/* Tracking Number Section */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-2 md:p-3 border rounded-lg gap-2">
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">رقم التتبع</span>
                <span className="font-mono font-medium">{order.trackingNumber}</span>
              </div>
              <Button variant="ghost" size="icon" onClick={() => copyToClipboard(order.trackingNumber)}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>

            {/* Status Change Section */}
            <div className="space-y-3">
              <Label>تحديث الحالة</Label>
              <Select 
                value={status} 
                onValueChange={setStatus} 
                dir="rtl"
                disabled={order.status === "canceled" || role === "PURCHASE_OFFICER"} // Disable if canceled or by role
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_ORDER.map((key) => {
                    const optionIndex = STATUS_ORDER.indexOf(key);
                    
                    // ADMIN can change to any status
                    if (role === "ADMIN") {
                      return (
                        <SelectItem key={key} value={key}>
                          {getStatusLabel(key, order.country)}
                        </SelectItem>
                      );
                    }

                    // Warehouse staff can only see their current status and the next one
                    // NOTE: This logic assumes they are on their respective page/view
                    if (role === "CHINA_WAREHOUSE" || role === "LIBYA_WAREHOUSE") {
                      if (optionIndex < currentStatusIndex || optionIndex > currentStatusIndex + 1) return null;
                      
                      // China warehouse can only move to arrived_to_china or shipping_to_libya
                      if (role === "CHINA_WAREHOUSE" && !["purchased", "arrived_to_china", "shipping_to_libya"].includes(key)) return null;
                      
                      // Libya warehouse can only move to arrived_libya or ready_for_pickup
                      if (role === "LIBYA_WAREHOUSE" && !["shipping_to_libya", "arrived_libya", "ready_for_pickup", "delivered"].includes(key)) return null;
                    }

                    // Default rule: Only show current status and next valid status
                    if (optionIndex < currentStatusIndex || optionIndex > currentStatusIndex + 1) return null;
                    
                    return (
                      <SelectItem key={key} value={key}>
                        {getStatusLabel(key, order.country)}
                      </SelectItem>
                    );
                  })}
                  {/* Always show canceled option for ADMIN */}
                  {role === "ADMIN" && (
                    <SelectItem value="canceled" className="text-destructive">
                      {getStatusLabel("canceled", order.country)}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              {order.status === "canceled" && (
                <p className="text-sm text-destructive">هذا الطلب ملغي ولا يمكن تعديله</p>
              )}
              {role === "PURCHASE_OFFICER" && (
                <p className="text-sm text-muted-foreground">ليس لديك صلاحية لتغيير الحالة</p>
              )}
            </div>

            {/* Shipping Fields */}
            {showShippingFields && (
              <div className="space-y-4 border-t pt-4">
                <div className="space-y-2">
                  <Label htmlFor="shippingType">طريقة الشحن</Label>
                  <Select 
                    value={shippingType} 
                    onValueChange={(val) => {
                      setShippingType(val);
                      setShippingRateId(""); // Reset rate when type changes
                    }} 
                    dir="rtl"
                    disabled={!!order.shippingRateId || role === "PURCHASE_OFFICER"}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر طريقة الشحن" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AIR">شحن جوي</SelectItem>
                      <SelectItem value="SEA">شحن بحري</SelectItem>
                    </SelectContent>
                  </Select>
                  {!!order.shippingRateId && (
                    <p className="text-xs text-muted-foreground">لا يمكن تغيير طريقة الشحن بعد تحديدها</p>
                  )}
                  {role === "PURCHASE_OFFICER" && (
                     <p className="text-xs text-muted-foreground">مسؤول المشتريات لا يمكنه تعديل بيانات الشحن</p>
                  )}
                </div>

                {shippingType && (
                  <div className="space-y-2">
                    <Label htmlFor="shippingRate">نوع الشحن</Label>
                    <Select 
                      value={shippingRateId} 
                      onValueChange={setShippingRateId} 
                      dir="rtl"
                      disabled={!!order.shippingRateId || role === "PURCHASE_OFFICER"}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={ratesStatus === 'loading' ? "جاري التحميل..." : "اختر نوع الشحن"} />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredRates.length === 0 ? (
                          <div className="p-2 text-sm text-muted-foreground text-center">
                            {ratesStatus === 'loading' ? "جاري التحميل..." : "لا توجد أسعار لهذا النوع"}
                          </div>
                        ) : (
                          filteredRates.map((rate) => (
                            <SelectItem key={rate.id} value={rate.id.toString()}>
                              {rate.name} (${rate.price})
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    {filteredRates.length === 0 && ratesStatus !== 'loading' && (
                      <p className="text-xs text-red-500">يجب إضافة أسعار شحن من الإعدادات أولاً</p>
                    )}
                  </div>
                )}

                {shippingType && (
                  <div className="space-y-2">
                    <Label htmlFor="weight">
                      {shippingType === 'AIR' ? 'الوزن (كجم)' : 'الحجم (CBM)'}
                    </Label>
                    <Input
                      id="weight"
                      type="number"
                      step="0.01"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      placeholder={shippingType === 'AIR' ? 'أدخل الوزن بالكيلوجرام' : 'أدخل الحجم بالمتر المكعب'}
                      className="text-right"
                      disabled={!!order.weight || role === "PURCHASE_OFFICER"}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="flightNumber">رقم الرحلة (اختياري)</Label>
                  <Input
                    id="flightNumber"
                    type="text"
                    value={flightNumber}
                    onChange={(e) => setFlightNumber(e.target.value)}
                    placeholder="أدخل رقم الرحلة..."
                    className="text-right font-mono"
                  />
                </div>

                {calculatedCost > 0 && (
                  <div className="bg-muted p-3 rounded-md text-center">
                    <span className="text-sm text-muted-foreground">تكلفة الشحن المقدرة:</span>
                    <div className="text-lg font-bold text-primary">${calculatedCost.toFixed(2)}</div>
                    <div className="text-xs text-muted-foreground mt-1">سيتم خصمها من رصيد العميل</div>
                  </div>
                )}
              </div>
            )}

            {/* Print Sticker Button */}
            <Button 
              variant="secondary" 
              className="w-full gap-2 text-sm md:text-base" 
              onClick={() => generateStickerLabel(order)}
            >
              <Printer className="h-4 w-4" />
              طباعة ملصق
            </Button>

            {/* Product Link */}
            {order.productUrl && (
              <Button variant="outline" className="w-full gap-2 text-sm md:text-base" asChild>
                <a href={order.productUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                  عرض المنتج
                </a>
              </Button>
            )}
          </div>

          <SheetFooter>
            <Button 
              className="w-full text-sm md:text-base"
              onClick={handleSave} 
              disabled={
                loading || 
                (status === order.status && 
                 weight === (order.weight?.toString() || "") && 
                 shippingRateId === (order.shippingRateId?.toString() || "") &&
                 flightNumber === (order.flightNumber || ""))
              }
            >
              {loading ? "جاري الحفظ..." : "حفظ التغييرات"}
            </Button>
            <SheetClose asChild>
              <Button variant="outline" className="w-full text-sm md:text-base">إغلاق</Button>
            </SheetClose>
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  );
}
