"use client";

import { User } from "../slices/userSlice";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import Image from "next/image";

interface UserDetailDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const roleMap: Record<string, string> = {
  ADMIN: "مدير النظام",
  PURCHASE_OFFICER: "مسؤول مشتريات",
  CHINA_WAREHOUSE: "مخزن الصين",
  LIBYA_WAREHOUSE: "مخزن ليبيا",
  CUSTOMER: "عميل",
};

export function UserDetailDialog({ user, open, onOpenChange }: UserDetailDialogProps) {
  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>تفاصيل المستخدم</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">{user.name}</h3>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
            <Badge variant="outline" className="text-base">
              {roleMap[user.role] || user.role}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">رقم الهاتف</label>
              <p>{user.mobile || "-"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">تاريخ التسجيل</label>
              <p>{format(new Date(user.createdAt), "dd MMMM yyyy", { locale: ar })}</p>
            </div>
            {user.role === "CUSTOMER" && user.customer?.code && (
              <div className="col-span-2">
                <label className="text-sm font-medium text-muted-foreground">كود الشحن</label>
                <p className="font-mono text-lg font-bold">{user.customer.code}</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">الصورة الشخصية</label>
              {user.photoUrl ? (
                <div className="relative aspect-square w-full max-w-[200px] overflow-hidden rounded-md border">
                  <Image
                    src={user.photoUrl}
                    alt="الصورة الشخصية"
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">لا توجد صورة</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">صورة الجواز</label>
              {user.passportUrl ? (
                <div className="relative aspect-video w-full overflow-hidden rounded-md border">
                  <Image
                    src={user.passportUrl}
                    alt="صورة الجواز"
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">لا توجد صورة</p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
