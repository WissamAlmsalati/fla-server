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
import { ArrowRight, Pencil, Trash2, Package, User as UserIcon, Mail, Phone, Shield, Calendar, Box, FileText, Image as ImageIcon, Wallet, TrendingUp, DollarSign } from "lucide-react";
import { EditUserDialog } from "./EditUserDialog";
import { ManageWalletDialog } from "@/features/customers/components/ManageWalletDialog";
import { CustomerOrders } from "./CustomerOrders";
import { TransactionHistory } from "@/features/transactions/components/TransactionHistory";
import { TransactionReports } from "@/features/transactions/components/TransactionReports";
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
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-card p-6 rounded-xl border shadow-sm">
        <div className="flex items-center gap-6">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => router.back()}
            className="hover:bg-muted"
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
          
          <div className="flex items-center gap-4">
            <div className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-border bg-muted">
              {user.photoUrl ? (
                <Image
                  src={user.photoUrl}
                  alt={user.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-muted">
                  <UserIcon className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
            </div>

            <div>
              <h1 className="text-2xl font-bold">{user.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="font-normal">
                  {roleMap[user.role] || user.role}
                </Badge>
                <span className="text-sm text-muted-foreground" dir="ltr">{user.email}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <EditUserDialog user={user} onSuccess={fetchUser} />
          <Button 
            variant="destructive" 
            size="icon" 
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <Tabs defaultValue="details" className="w-full">
        <TabsList className="w-full justify-start border-b h-auto p-0 bg-transparent gap-6">
          <TabsTrigger 
            value="details" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none px-2 py-3 bg-transparent font-medium transition-colors hover:text-primary/80"
          >
            <UserIcon className="h-4 w-4 ml-2" />
            التفاصيل
          </TabsTrigger>
          <TabsTrigger 
            value="orders" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none px-2 py-3 bg-transparent font-medium transition-colors hover:text-primary/80"
          >
            <Package className="h-4 w-4 ml-2" />
            الطلبات
          </TabsTrigger>
          {user.role === "CUSTOMER" && (
            <>
              <TabsTrigger 
                value="transactions" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none px-2 py-3 bg-transparent font-medium transition-colors hover:text-primary/80"
              >
                <Wallet className="h-4 w-4 ml-2" />
                المعاملات المالية
              </TabsTrigger>
              <TabsTrigger 
                value="reports" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none px-2 py-3 bg-transparent font-medium transition-colors hover:text-primary/80"
              >
                <FileText className="h-4 w-4 ml-2" />
                التقارير
              </TabsTrigger>
            </>
          )}
        </TabsList>

        <TabsContent value="details" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left Column - User Info & Wallet (2/3 width) */}
            <div className="lg:col-span-2 space-y-6">
              {/* Wallet Section - Only for Customers */}
              {user.role === "CUSTOMER" && user.customer && (
                <Card>
                  <CardHeader className="pb-4 border-b">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Wallet className="h-5 w-5 text-primary" />
                        المحفظة
                      </CardTitle>
                      <ManageWalletDialog 
                        customer={{
                          ...user.customer,
                          name: user.name,
                          userId: user.id
                        } as any} 
                        onSuccess={fetchUser}
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* USD Balance */}
                      <div className="rounded-xl border bg-card p-4 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-sm font-medium text-muted-foreground">رصيد الدولار</div>
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="text-2xl font-bold text-foreground font-mono">
                          ${user.customer.balanceUSD?.toFixed(2) || "0.00"}
                        </div>
                      </div>

                      {/* LYD Balance */}
                      <div className="rounded-xl border bg-card p-4 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-sm font-medium text-muted-foreground">رصيد الدينار</div>
                          <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="text-2xl font-bold text-foreground font-mono">
                          {user.customer.balanceLYD?.toFixed(2) || "0.00"} د.ل
                        </div>
                      </div>

                      {/* CNY Balance */}
                      <div className="rounded-xl border bg-card p-4 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-sm font-medium text-muted-foreground">رصيد اليوان</div>
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="text-2xl font-bold text-foreground font-mono">
                          ¥{user.customer.balanceCNY?.toFixed(2) || "0.00"}
                        </div>
                      </div>
                    </div>

                    {/* Shipping Code Badge */}
                    {user.customer.code && (
                      <div className="mt-6 flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-dashed">
                        <Box className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">كود الشحن:</span>
                        <span className="font-mono font-medium">{user.customer.code}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Basic Information Card */}
              <Card>
                <CardHeader className="border-b">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <UserIcon className="h-5 w-5 text-primary" />
                    المعلومات الأساسية
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <span className="text-sm text-muted-foreground flex items-center gap-2">
                        <UserIcon className="h-3 w-3" /> الاسم
                      </span>
                      <div className="font-medium">{user.name}</div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-sm text-muted-foreground flex items-center gap-2">
                        <Mail className="h-3 w-3" /> البريد الإلكتروني
                      </span>
                      <div className="font-medium" dir="ltr">{user.email}</div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-sm text-muted-foreground flex items-center gap-2">
                        <Phone className="h-3 w-3" /> رقم الهاتف
                      </span>
                      <div className="font-medium" dir="ltr">{user.mobile || "-"}</div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-sm text-muted-foreground flex items-center gap-2">
                        <Shield className="h-3 w-3" /> الدور
                      </span>
                      <div>
                        <Badge variant="outline">{roleMap[user.role] || user.role}</Badge>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-sm text-muted-foreground flex items-center gap-2">
                        <Calendar className="h-3 w-3" /> تاريخ التسجيل
                      </span>
                      <div className="font-medium">
                        {format(new Date(user.createdAt), "dd MMMM yyyy", { locale: ar })}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Documents (1/3 width) */}
            <div className="space-y-6">
              <Card>
                <CardHeader className="border-b">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <FileText className="h-5 w-5 text-primary" />
                    المستندات والصور
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-6 pt-6">
                  <div>
                    <div className="mb-3 flex items-center gap-2">
                      <ImageIcon className="h-4 w-4 text-muted-foreground" />
                      <h4 className="font-medium text-sm">الصورة الشخصية</h4>
                    </div>
                    {user.photoUrl ? (
                      <div className="relative aspect-square w-full overflow-hidden rounded-lg border bg-muted">
                        <Image
                          src={user.photoUrl}
                          alt="الصورة الشخصية"
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex aspect-square w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed bg-muted/30 text-muted-foreground">
                        <ImageIcon className="h-8 w-8 opacity-20" />
                        <span className="text-xs">لا توجد صورة</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="mb-3 flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <h4 className="font-medium text-sm">صورة الجواز</h4>
                    </div>
                    {user.passportUrl ? (
                      <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-muted">
                        <Image
                          src={user.passportUrl}
                          alt="صورة الجواز"
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed bg-muted/30 text-muted-foreground">
                        <FileText className="h-8 w-8 opacity-20" />
                        <span className="text-xs">لا توجد صورة</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="orders" className="mt-6">
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Package className="h-5 w-5 text-primary" />
                طلبات المستخدم
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {user.role === "CUSTOMER" && user.customer?.id ? (
                <CustomerOrders customerId={user.customer.id} />
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                  <div className="mb-4 p-4 rounded-full bg-muted/30">
                    <Package className="h-10 w-10 opacity-20" />
                  </div>
                  <p>هذا المستخدم ليس عميلاً أو ليس لديه حساب عميل مرتبط</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {user.role === "CUSTOMER" && user.customer?.id && (
          <>
            <TabsContent value="transactions" className="mt-6">
              <Card>
                <CardHeader className="border-b">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Wallet className="h-5 w-5 text-primary" />
                    المعاملات المالية
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <TransactionHistory customerId={user.customer.id} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reports" className="mt-6">
              <TransactionReports customerId={user.customer.id} />
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}
