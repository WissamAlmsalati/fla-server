"use client";

import { useState, useEffect } from "react";
import { useReduxDispatch, useReduxSelector } from "@/redux/provider";
import { updateOrder, Order } from "../slices/orderSlice";
import { loadRates } from "../../shipping/slices/shippingSlice";
import { fetchFlights } from "@/features/flights/slices/flightSlice";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Copy, ExternalLink, Printer, Check, ChevronsUpDown } from "lucide-react";
import { getStatusLabel, getCountryName } from "@/lib/orderStatus";
import { cn } from "@/lib/utils";
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
  const { list: flights } = useReduxSelector((state) => state.flights);
  const [status, setStatus] = useState(order?.status || "");
  const [weight, setWeight] = useState<string>("");
  const [shippingType, setShippingType] = useState<string>("");
  const [shippingRateId, setShippingRateId] = useState<string>("");
  const [flightId, setFlightId] = useState<string>("");
  const [flightOpen, setFlightOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // New states for admin editing
  const [name, setName] = useState<string>("");
  const [trackingNumber, setTrackingNumber] = useState<string>("");
  const [usdPrice, setUsdPrice] = useState<string>("");
  const [cnyPrice, setCnyPrice] = useState<string>("");
  const [productUrl, setProductUrl] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [alertOpen, setAlertOpen] = useState(false);

  useEffect(() => {
    if (order) {
      setStatus(order.status);
      setWeight(order.weight?.toString() || "");
      setName(order.name || "");
      setTrackingNumber(order.trackingNumber || "");
      setUsdPrice(order.usdPrice?.toString() || "");
      setCnyPrice(order.cnyPrice?.toString() || "");
      setProductUrl(order.productUrl || "");
      
      // Pre-fill shipping info if available
      if (order.shippingRateId) {
        setShippingRateId(order.shippingRateId.toString());
      } else {
        setShippingRateId("");
      }
      setShippingType(""); 
      setFlightId(order.flightId?.toString() || "");
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
      dispatch(fetchFlights());
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
        flightId === (order.flightId?.toString() || "") &&
        name === (order.name || "") &&
        trackingNumber === (order.trackingNumber || "") &&
        usdPrice === (order.usdPrice?.toString() || "") &&
        cnyPrice === (order.cnyPrice?.toString() || "") &&
        productUrl === (order.productUrl || "")) {
      return;
    }

    // Validate status progression - prevent skipping statuses has been disabled per user request
    // Allow canceling from any status

    if (status === "shipping_to_libya" && (!shippingType || !weight || !shippingRateId) && status !== order.status) {
      toast.error("يرجى اختيار طريقة الشحن ونوع الشحن وإدخال الوزن عند الشحن إلى ليبيا");
      return;
    }

    // Validation for Admin edits
    if (role === "ADMIN") {
      const newErrors: Record<string, string> = {};
      if (!name.trim()) newErrors.name = "اسم الطلب مطلوب";
      if (!trackingNumber.trim()) newErrors.trackingNumber = "رقم التتبع مطلوب";
      if (!usdPrice || isNaN(parseFloat(usdPrice)) || parseFloat(usdPrice) < 0) {
        newErrors.usdPrice = "السعر بالدولار غير صالح";
      }
      if (cnyPrice && (isNaN(parseFloat(cnyPrice)) || parseFloat(cnyPrice) < 0)) {
        newErrors.cnyPrice = "السعر باليوان غير صالح";
      }
      if (productUrl && !productUrl.startsWith("http")) {
        newErrors.productUrl = "يجب أن يبدأ الرابط بـ http أو https";
      }

      setErrors(newErrors);
      if (Object.keys(newErrors).length > 0) {
        toast.error("يرجى تصحيح الأخطاء قبل الحفظ");
        return;
      }
      
      // Use AlertDialog instead of native confirm to avoid strict-mode bubbling issues
      setAlertOpen(true);
      return;
    }

    // Direct save for non-admins
    await executeSave();
  };

  const executeSave = async () => {
    try {
      setLoading(true);
      await dispatch(updateOrder({ 
        id: order.id, 
        data: { 
          status,
          weight: weight ? parseFloat(weight) : undefined,
          shippingRateId: shippingRateId ? parseInt(shippingRateId) : undefined,
          flightId: flightId ? parseInt(flightId) : undefined,
          name: role === "ADMIN" ? name : undefined,
          tracking_number: role === "ADMIN" ? trackingNumber : undefined,
          usd_price: role === "ADMIN" && usdPrice !== "" ? parseFloat(usdPrice) : undefined,
          cny_price: role === "ADMIN" && cnyPrice !== "" ? parseFloat(cnyPrice) : undefined,
          product_url: role === "ADMIN" && productUrl !== "" ? productUrl : undefined,
        } 
      })).unwrap();
      toast.success("تم تحديث حالة الطلب بنجاح");
      onOpenChange(false);
      onUpdate?.();
    } catch (error: any) {
      toast.error(error.message || "فشل تحديث حالة الطلب");
    } finally {
      setLoading(false);
      setAlertOpen(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("تم النسخ");
  };

  return (
    <>
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
            {/* Admin Base Info Edits */}
            {role === "ADMIN" && (
              <div className="space-y-4 p-3 bg-muted/30 rounded-lg border">
                <div className="space-y-2">
                  <Label className={errors.name ? "text-destructive" : ""}>اسم الطلب <span className="text-destructive">*</span></Label>
                  <Input 
                    value={name} 
                    onChange={e => { setName(e.target.value); setErrors(prev => ({...prev, name: ""})) }} 
                    dir="rtl" 
                    className={errors.name ? "border-destructive focus-visible:ring-destructive" : ""}
                  />
                  {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                </div>
                <div className="space-y-2">
                  <Label className={errors.trackingNumber ? "text-destructive" : ""}>رقم التتبع <span className="text-destructive">*</span></Label>
                  <div className="flex gap-2 items-start">
                    <div className="flex-1 space-y-1">
                      <Input 
                        value={trackingNumber} 
                        onChange={e => { setTrackingNumber(e.target.value); setErrors(prev => ({...prev, trackingNumber: ""})) }} 
                        dir="ltr" 
                        className={`text-right ${errors.trackingNumber ? "border-destructive focus-visible:ring-destructive" : ""}`}
                      />
                      {errors.trackingNumber && <p className="text-xs text-destructive">{errors.trackingNumber}</p>}
                    </div>
                    <Button variant="outline" size="icon" onClick={() => copyToClipboard(trackingNumber)} type="button">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className={errors.usdPrice ? "text-destructive" : ""}>السعر (USD) <span className="text-destructive">*</span></Label>
                    <Input 
                      type="number" 
                      step="0.01" 
                      value={usdPrice} 
                      onChange={e => { setUsdPrice(e.target.value); setErrors(prev => ({...prev, usdPrice: ""})) }} 
                      dir="ltr" 
                      className={`text-right ${errors.usdPrice ? "border-destructive focus-visible:ring-destructive" : ""}`}
                    />
                    {errors.usdPrice && <p className="text-xs text-destructive">{errors.usdPrice}</p>}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className={errors.productUrl ? "text-destructive" : ""}>رابط المنتج</Label>
                  <Input 
                    value={productUrl} 
                    onChange={e => { setProductUrl(e.target.value); setErrors(prev => ({...prev, productUrl: ""})) }} 
                    dir="ltr" 
                    className={`text-right ${errors.productUrl ? "border-destructive focus-visible:ring-destructive" : ""}`}
                    placeholder="https://" 
                  />
                  {errors.productUrl && <p className="text-xs text-destructive">{errors.productUrl}</p>}
                </div>
              </div>
            )}

            {/* Order Details Cards (For Non-Admins or Display context) */}
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
              
              {role !== "ADMIN" && (
                <div className="flex flex-col gap-1 p-3 bg-muted/50 rounded-lg">
                  <span className="text-xs text-muted-foreground">السعر</span>
                  <span className="font-medium text-sm">${order.usdPrice}</span>
                  {order.cnyPrice && (
                    <span className="text-xs text-muted-foreground">¥{order.cnyPrice}</span>
                  )}
                </div>
              )}
            </div>

            {/* Tracking Number Display (For Non-Admins) */}
            {role !== "ADMIN" && (
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-2 md:p-3 border rounded-lg gap-2">
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">رقم التتبع</span>
                  <span className="font-mono font-medium">{order.trackingNumber}</span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => copyToClipboard(order.trackingNumber)}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            )}

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
                      
                      // China warehouse can only move to arrived_to_china or shipping_to_libya
                      if (role === "CHINA_WAREHOUSE" && !["purchased", "arrived_to_china", "shipping_to_libya"].includes(key)) return null;
                      
                      // Libya warehouse can only move to arrived_libya or ready_for_pickup
                      if (role === "LIBYA_WAREHOUSE" && !["shipping_to_libya", "arrived_libya", "ready_for_pickup", "delivered"].includes(key)) return null;
                    }
                    
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
                  <Label>الرحلة (اختياري)</Label>
                  <Popover open={flightOpen} onOpenChange={setFlightOpen} modal={false}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={flightOpen}
                        className={cn(
                          "w-full justify-between",
                          !flightId && "text-muted-foreground"
                        )}
                        disabled={role === "PURCHASE_OFFICER"}
                      >
                        {flightId
                          ? flights.find((f) => f.id.toString() === flightId)?.flightNumber
                          : "اختر الرحلة"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-0 pointer-events-auto" align="start">
                      <Command>
                        <CommandInput placeholder="بحث برقم الرحلة..." />
                        <CommandList>
                          <CommandEmpty>لم يتم العثور على رحلة.</CommandEmpty>
                          <CommandGroup>
                            <CommandItem
                              value="none"
                              onSelect={() => {
                                setFlightId("");
                                setFlightOpen(false);
                              }}
                              className="cursor-pointer font-bold text-red-500"
                              style={{ pointerEvents: 'auto' }}
                            >
                              إلغاء التحديد
                            </CommandItem>
                            {flights.filter(f => f.status !== "delivered").map((flight) => (
                              <CommandItem
                                value={flight.flightNumber}
                                key={flight.id}
                                onSelect={() => {
                                  setFlightId(flight.id.toString());
                                  setFlightOpen(false);
                                }}
                                className="cursor-pointer"
                                style={{ pointerEvents: 'auto' }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    flight.id.toString() === flightId
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {flight.flightNumber} ({flight.country === 'CHINA' ? 'الصين' : flight.country === 'DUBAI' ? 'دبي' : flight.country === 'USA' ? 'أمريكا' : 'تركيا'})
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
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

            {/* Product Link (For Non-Admins since Admins have an input for it) */}
            {role !== "ADMIN" && order.productUrl && (
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
                 flightId === (order.flightId?.toString() || "") &&
                 name === (order.name || "") &&
                 trackingNumber === (order.trackingNumber || "") &&
                 usdPrice === (order.usdPrice?.toString() || "") &&
                 cnyPrice === (order.cnyPrice?.toString() || "") &&
                 productUrl === (order.productUrl || ""))
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

    {/* Confirmation Alert Dialog for Admin */}
    <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
      <AlertDialogContent dir="rtl">
        <AlertDialogHeader>
          <AlertDialogTitle>تأكيد التعديلات</AlertDialogTitle>
          <AlertDialogDescription>
            هل أنت متأكد من حفظ التغييرات على هذا الطلب؟ قد يؤثر ذلك على سعر القطعة وحالتها لدى العميل.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 sm:gap-0 mt-4">
          <AlertDialogCancel disabled={loading}>إلغاء</AlertDialogCancel>
          <AlertDialogAction onClick={(e) => {
            e.preventDefault(); // Prevent closing until save finishes
            executeSave();
          }} disabled={loading}>
            {loading ? "جاري الحفظ..." : "تأكيد الحفظ"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
