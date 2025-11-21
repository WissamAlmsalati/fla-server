"use client";

import { useState } from "react";
import { useReduxDispatch } from "@/redux/provider";
import { createUser, Role } from "../slices/userSlice";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileUpload } from "@/components/ui/file-upload";
import { toast } from "sonner";
import { Plus } from "lucide-react";

export function AddUserDialog() {
  const dispatch = useReduxDispatch();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "CUSTOMER" as Role,
    mobile: "",
    photoUrl: "",
    passportUrl: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await dispatch(createUser(formData)).unwrap();
      toast.success("تم إنشاء المستخدم بنجاح");
      setOpen(false);
      setFormData({ name: "", email: "", password: "", role: "CUSTOMER", mobile: "", photoUrl: "", passportUrl: "" });
    } catch (error: any) {
      toast.error(error.message || "فشل إنشاء المستخدم");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          إضافة مستخدم
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>إضافة مستخدم جديد</DialogTitle>
          <DialogDescription>
            أدخل بيانات المستخدم الجديد هنا. انقر على حفظ عند الانتهاء.
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
                  البريد الإلكتروني
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password" className="text-right">
                  كلمة المرور
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={6}
                />
              </div>
            </div>

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

            <div className="grid gap-2">
              <Label htmlFor="role" className="text-right">
                الدور
              </Label>
              <Select
                value={formData.role}
                onValueChange={(value: Role) => setFormData({ ...formData, role: value })}
              >
                <SelectTrigger className="col-span-3" dir="rtl">
                  <SelectValue placeholder="اختر الدور" />
                </SelectTrigger>
                <SelectContent dir="rtl">
                  <SelectItem value="ADMIN">مدير النظام</SelectItem>
                  <SelectItem value="PURCHASE_OFFICER">مسؤول مشتريات</SelectItem>
                  <SelectItem value="CHINA_WAREHOUSE">مخزن الصين</SelectItem>
                  <SelectItem value="LIBYA_WAREHOUSE">مخزن ليبيا</SelectItem>
                  <SelectItem value="CUSTOMER">عميل</SelectItem>
                </SelectContent>
              </Select>
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
