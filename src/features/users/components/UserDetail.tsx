"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User } from "../slices/userSlice";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import Image from "next/image";
import { ArrowRight, Pencil, Trash2, Package, User as UserIcon, Mail, Phone, Shield, Calendar, Box, FileText, Image as ImageIcon } from "lucide-react";
import { EditUserDialog } from "./EditUserDialog";
import { useReduxDispatch } from "@/redux/provider";
import { deleteUser } from "../slices/userSlice";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface UserDetailProps {
  userId: number;
}

const roleMap: Record<string, string> = {
  ADMIN: "مدير النظام",
  PURCHASE_OFFICER: "مسؤول مشتريات",
  CHINA_WAREHOUSE: "مخزن الصين",
  LIBYA_WAREHOUSE: "مخزن ليبيا",
  CUSTOMER: "عميل",
};

export function UserDetail({ userId }: UserDetailProps) {
  const router = useRouter();
  const dispatch = useReduxDispatch();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch user");
      }
      
      const data = await response.json();
      setUser(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [userId]);

  const handleDelete = async () => {
    if (confirm("هل أنت متأكد من حذف هذا المستخدم؟")) {
      try {
        await dispatch(deleteUser(userId)).unwrap();
        toast.success("تم حذف المستخدم بنجاح");
        router.push("/users");
      } catch (error: any) {
        toast.error(error.message || "فشل حذف المستخدم");
      }
    }
  };

  if (loading) return <div className="p-8 text-center">جاري التحميل...</div>;
  if (error || !user) return <div className="p-8 text-center text-red-500">خطأ: {error || "المستخدم غير موجود"}</div>;

  return (
    <div className="space-y-6 text-right" dir="rtl">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowRight className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-3">
            {user.photoUrl && (
              <div className="relative h-10 w-10 overflow-hidden rounded-full border">
                <Image
                  src={user.photoUrl}
                  alt={user.name}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold">{user.name}</h1>
              <div className="text-sm text-muted-foreground">
                {roleMap[user.role] || user.role}
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <EditUserDialog user={user} onSuccess={fetchUser} />
          <Button variant="destructive" size="icon" onClick={handleDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="details" className="w-full">
        <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
          <TabsTrigger 
            value="details" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2"
          >
            التفاصيل
          </TabsTrigger>
          <TabsTrigger 
            value="orders" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2"
          >
            الطلبات
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserIcon className="h-5 w-5 text-primary" />
                  المعلومات الأساسية
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="flex items-center gap-4 rounded-lg border p-3 shadow-sm">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <UserIcon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="grid gap-1 text-right">
                    <span className="text-sm font-medium text-muted-foreground">الاسم</span>
                    <span className="font-semibold">{user.name}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 rounded-lg border p-3 shadow-sm">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Mail className="h-4 w-4 text-primary" />
                  </div>
                  <div className="grid gap-1 text-right">
                    <span className="text-sm font-medium text-muted-foreground">البريد الإلكتروني</span>
                    <span className="font-semibold" dir="ltr">{user.email}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 rounded-lg border p-3 shadow-sm">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Phone className="h-4 w-4 text-primary" />
                  </div>
                  <div className="grid gap-1 text-right">
                    <span className="text-sm font-medium text-muted-foreground">رقم الهاتف</span>
                    <span className="font-semibold" dir="ltr">{user.mobile || "-"}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 rounded-lg border p-3 shadow-sm">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Shield className="h-4 w-4 text-primary" />
                  </div>
                  <div className="grid gap-1 text-right">
                    <span className="text-sm font-medium text-muted-foreground">الدور</span>
                    <Badge variant="outline" className="w-fit">{roleMap[user.role] || user.role}</Badge>
                  </div>
                </div>

                <div className="flex items-center gap-4 rounded-lg border p-3 shadow-sm">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Calendar className="h-4 w-4 text-primary" />
                  </div>
                  <div className="grid gap-1 text-right">
                    <span className="text-sm font-medium text-muted-foreground">تاريخ التسجيل</span>
                    <span className="font-semibold">{format(new Date(user.createdAt), "dd MMMM yyyy", { locale: ar })}</span>
                  </div>
                </div>

                {user.role === "CUSTOMER" && user.customer?.code && (
                  <div className="flex items-center gap-4 rounded-lg border p-3 shadow-sm bg-secondary/20">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <Box className="h-4 w-4 text-primary" />
                    </div>
                    <div className="grid gap-1 text-right">
                      <span className="text-sm font-medium text-muted-foreground">كود الشحن</span>
                      <span className="font-mono text-lg font-bold text-primary">{user.customer.code}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  المستندات والصور
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-6">
                <div className="rounded-lg border p-4 shadow-sm">
                  <div className="mb-4 flex items-center gap-2">
                    <ImageIcon className="h-4 w-4 text-muted-foreground" />
                    <h4 className="font-medium">الصورة الشخصية</h4>
                  </div>
                  {user.photoUrl ? (
                    <div className="relative aspect-square w-full overflow-hidden rounded-md border bg-muted">
                      <Image
                        src={user.photoUrl}
                        alt="الصورة الشخصية"
                        fill
                        className="object-cover transition-transform hover:scale-105"
                      />
                    </div>
                  ) : (
                    <div className="flex aspect-square w-full flex-col items-center justify-center gap-2 rounded-md border border-dashed bg-muted/50 text-muted-foreground">
                      <ImageIcon className="h-8 w-8 opacity-50" />
                      <span className="text-sm">لا توجد صورة</span>
                    </div>
                  )}
                </div>

                <div className="rounded-lg border p-4 shadow-sm">
                  <div className="mb-4 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <h4 className="font-medium">صورة الجواز</h4>
                  </div>
                  {user.passportUrl ? (
                    <div className="relative aspect-video w-full overflow-hidden rounded-md border bg-muted">
                      <Image
                        src={user.passportUrl}
                        alt="صورة الجواز"
                        fill
                        className="object-cover transition-transform hover:scale-105"
                      />
                    </div>
                  ) : (
                    <div className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-md border border-dashed bg-muted/50 text-muted-foreground">
                      <FileText className="h-8 w-8 opacity-50" />
                      <span className="text-sm">لا توجد صورة</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="orders" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                طلبات المستخدم
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                <Package className="h-12 w-12 mb-4 opacity-20" />
                <p>سيتم عرض قائمة طلبات المستخدم هنا قريباً</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
