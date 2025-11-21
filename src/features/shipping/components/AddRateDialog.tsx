"use client";

import { useState } from "react";
import { useReduxDispatch } from "@/redux/provider";
import { createRate, ShippingType } from "../slices/shippingSlice";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Plus } from "lucide-react";

export function AddRateDialog() {
  const dispatch = useReduxDispatch();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: "AIR" as ShippingType,
    name: "",
    price: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await dispatch(createRate({
        ...formData,
        price: parseFloat(formData.price),
      })).unwrap();
      toast.success("تم إضافة التصنيف بنجاح");
      setOpen(false);
      setFormData({ type: "AIR", name: "", price: "" });
    } catch (error: any) {
      toast.error(error.message || "فشل إضافة التصنيف");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          إضافة تصنيف
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-right">إضافة تصنيف شحن جديد</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="type" className="text-right">
                نوع الشحن
              </Label>
              <Select
                value={formData.type}
                onValueChange={(value: ShippingType) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger dir="rtl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent dir="rtl">
                  <SelectItem value="AIR">شحن جوي</SelectItem>
                  <SelectItem value="SEA">شحن بحري</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-right">
                اسم التصنيف (مثال: معدات طبية)
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="price" className="text-right">
                {formData.type === "AIR" ? "السعر (USD / 1 kg)" : "السعر (USD / 1 cbm)"}
              </Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? "جاري الإضافة..." : "إضافة"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
