"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useReduxDispatch } from "@/redux/provider";
import { updateCustomer } from "../slices/customerSlice";
import { toast } from "sonner";
import { Pencil } from "lucide-react";

interface ManageShipmentCodesDialogProps {
  customer: {
    id: number;
    code: string;
    dubaiCode?: string;
    usaCode?: string;
    turkeyCode?: string;
  };
  onSuccess?: () => void;
}

export function ManageShipmentCodesDialog({ customer, onSuccess }: ManageShipmentCodesDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dispatch = useReduxDispatch();

  const [formData, setFormData] = useState({
    code: customer.code || "",
    dubaiCode: customer.dubaiCode || "",
    usaCode: customer.usaCode || "",
    turkeyCode: customer.turkeyCode || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await dispatch(updateCustomer({
        id: customer.id,
        ...formData,
      })).unwrap();

      toast.success("تم تحديث أكواد الشحن بنجاح");
      setOpen(false);
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast.error(error.message || "فشل تحديث أكواد الشحن");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>إدارة أكواد الشحن</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="code">كود الصين</Label>
            <Input
              id="code"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              placeholder="KO219-FLL..."
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="dubaiCode">كود دبي</Label>
            <Input
              id="dubaiCode"
              value={formData.dubaiCode}
              onChange={(e) => setFormData({ ...formData, dubaiCode: e.target.value })}
              placeholder="BSB FLL D..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="usaCode">كود أمريكا</Label>
            <Input
              id="usaCode"
              value={formData.usaCode}
              onChange={(e) => setFormData({ ...formData, usaCode: e.target.value })}
              placeholder="Global FLL ..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="turkeyCode">كود تركيا</Label>
            <Input
              id="turkeyCode"
              value={formData.turkeyCode}
              onChange={(e) => setFormData({ ...formData, turkeyCode: e.target.value })}
              placeholder="ABUHAJ FLL..."
            />
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              إلغاء
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "جاري الحفظ..." : "حفظ التغييرات"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
