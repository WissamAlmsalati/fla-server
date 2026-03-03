"use client";

import { useState } from "react";
import { useReduxDispatch } from "@/redux/provider";
import { fetchCustomers } from "../slices/customerSlice";
import { createUser, Role } from "../../users/slices/userSlice";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileUpload } from "@/components/ui/file-upload";
import { toast } from "sonner";
import { Plus } from "lucide-react";

export function AddCustomerDialog() {
  const dispatch = useReduxDispatch();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    photoUrl: "",
    passportUrl: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Create user with role CUSTOMER
      await dispatch(createUser({
        ...formData,
        role: "CUSTOMER" as Role,
      })).unwrap();
      
      // Refresh customers list
      dispatch(fetchCustomers());
      
      toast.success("تم إنشاء العميل بنجاح. كلمة المرور الافتراضية هي رقم الهاتف.");
      setOpen(false);
      setFormData({
        name: "",
        email: "",
        mobile: "",
        photoUrl: "",
        passportUrl: "",
      });
    } catch (error: any) {
      toast.error(error.message || "فشل إنشاء العميل");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          إضافة عميل
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>إضافة عميل جديد</DialogTitle>
          <DialogDescription>
            أدخل بيانات العميل الجديد هنا. سيتم إنشاء حساب مستخدم له تلقائياً.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name" className="text-right">
                  الاسم
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="mobile" className="text-right">
                  رقم الهاتف
                </Label>
                <Input
                  id="mobile"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-right">
                  البريد الإلكتروني (اختياري)
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="اختياري"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>
            <p className="text-sm text-muted-foreground text-right">
              💡 ستكون كلمة المرور الافتراضية هي رقم الهاتف. يمكن للعميل تغييرها لاحقاً.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <FileUpload
                label="الصورة الشخصية (اختياري)"
                value={formData.photoUrl}
                onChange={(url) => setFormData({ ...formData, photoUrl: url })}
              />
              <FileUpload
                label="صورة الجواز (اختياري)"
                value={formData.passportUrl}
                onChange={(url) => setFormData({ ...formData, passportUrl: url })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? "جاري الحفظ..." : "حفظ التغييرات"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
