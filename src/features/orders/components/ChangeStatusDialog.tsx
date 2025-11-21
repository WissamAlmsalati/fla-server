"use client";

import { useState, useEffect } from "react";
import { useReduxDispatch, useReduxSelector } from "@/redux/provider";
import { updateOrder, Order } from "../slices/orderSlice";
import { loadRates } from "../../shipping/slices/shippingSlice";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// ...other imports...

export default function ChangeStatusDialog(props) {
  // Props: expects an 'order' object and optional 'onSuccess' callback
  const { order, onSuccess } = props;
  const dispatch = useReduxDispatch();
  const { rates, status: ratesStatus } = useReduxSelector((state) => state.shipping);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shippingType, setShippingType] = useState(order?.shippingType || "");
  const [shippingRateId, setShippingRateId] = useState(order?.shippingRateId ? order.shippingRateId.toString() : "");
  const [weight, setWeight] = useState(order?.weight ? order.weight.toString() : "");
  // Filter rates by type
  const filteredRates = rates.filter((rate) => rate.type === shippingType);
  // Calculate cost (example logic, adjust as needed)
  const calculatedCost = (() => {
    if (!shippingType || !shippingRateId || !weight) return 0;
    const rate = rates.find((r) => r.id.toString() === shippingRateId);
    if (!rate) return 0;
    const w = parseFloat(weight);
    return shippingType === "AIR" ? w * rate.price : w * rate.price;
  })();
  // Save handler
  const handleSave = async () => {
    setLoading(true);
    try {
      await dispatch(updateOrder({
        id: order.id,
        data: {
          shippingRateId: shippingRateId ? parseInt(shippingRateId) : undefined,
          weight: weight ? parseFloat(weight) : undefined,
        },
      })).unwrap();
      setOpen(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      // Handle error (toast, etc.)
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogContent>
        <div className="overflow-x-auto pb-2">
          <div className="flex flex-row gap-2 min-w-[600px]">
            {/* Shipping Type */}
            <div className="flex flex-col min-w-[140px]">
              <Label htmlFor="shippingType" className="text-right">
                طريقة الشحن
              </Label>
              <Select 
                value={shippingType} 
                onValueChange={(val) => {
                  setShippingType(val);
                  setShippingRateId(""); // Reset rate when type changes
                }} 
                dir="rtl"
                disabled={!!order.shippingRateId}
              >
                <SelectTrigger className="min-w-[140px]" >
                  <SelectValue placeholder="اختر طريقة الشحن" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AIR">شحن جوي</SelectItem>
                  <SelectItem value="SEA">شحن بحري</SelectItem>
                </SelectContent>
              </Select>
              {!!order.shippingRateId && (
                <p className="text-xs text-muted-foreground text-right">لا يمكن تغيير طريقة الشحن بعد تحديدها</p>
              )}
            </div>
            {/* Shipping Rate */}
            {shippingType && (
              <div className="flex flex-col min-w-[180px]">
                <Label htmlFor="shippingRate" className="text-right">
                  نوع الشحن
                </Label>
                <Select value={shippingRateId} onValueChange={setShippingRateId} dir="rtl">
                  <SelectTrigger className="min-w-[140px]" >
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
            {/* Weight/Volume */}
            {shippingType && (
              <div className="flex flex-col min-w-[140px]">
                <Label htmlFor="weight" className="text-right">
                  {shippingType === 'AIR' ? 'الوزن (كجم)' : 'الحجم (CBM)'}
                </Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.01"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder={shippingType === 'AIR' ? 'أدخل الوزن بالكيلوجرام' : 'أدخل الحجم بالمتر المكعب'}
                  className="text-right min-w-[100px]"
                />
              </div>
            )}
            {/* Calculated Cost */}
            {calculatedCost > 0 && (
              <div className="bg-muted p-3 rounded-md text-center min-w-[140px]">
                <span className="text-sm text-muted-foreground">تكلفة الشحن المقدرة:</span>
                <div className="text-lg font-bold text-primary">${calculatedCost.toFixed(2)}</div>
                <div className="text-xs text-muted-foreground mt-1">سيتم خصمها من رصيد العميل</div>
              </div>
            )}
          </div>
        </div>
        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
          <Button variant="outline" className="w-full sm:w-auto" onClick={() => setOpen(false)}>
            إلغاء
          </Button>
          <Button className="w-full sm:w-auto" onClick={handleSave} disabled={loading}>
            {loading ? "جاري الحفظ..." : "حفظ التغييرات"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ...existing code...
