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
import { ArrowRight, Pencil, Trash2, Package, User as UserIcon, Mail, Phone, Shield, Calendar, Box, FileText, Image as ImageIcon, Wallet, TrendingUp, DollarSign, UserX, UserCheck, Copy, Check, Bell, MapPin } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EditUserDialog } from "./EditUserDialog";
import { ManageWalletDialog } from "@/features/customers/components/ManageWalletDialog";
import { ManageShipmentCodesDialog } from "@/features/customers/components/ManageShipmentCodesDialog";
import { CustomerOrders } from "./CustomerOrders";
import { TransactionHistory } from "@/features/transactions/components/TransactionHistory";
import { TransactionReports } from "@/features/transactions/components/TransactionReports";
import { useReduxDispatch } from "@/redux/provider";
import { deleteUser, suspendUser } from "../slices/userSlice";
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
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifTotal, setNotifTotal] = useState(0);

  const handleCopyCode = async (code: string, label: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      toast.success(`تم نسخ كود ${label}`);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      toast.error("فشل نسخ الكود");
    }
  };

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
    fetchNotifications();
  }, [userId]);

  const fetchNotifications = async () => {
    setNotifLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/notifications/user/${userId}?limit=50`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setNotifTotal(data.total || 0);
      }
    } catch (e) {
      console.error("Failed to fetch user notifications", e);
    } finally {
      setNotifLoading(false);
    }
  };

  const handleDelete = async () => {
    if (confirm("هل أنت متأكد من حذف هذا المستخدم؟ لا يمكن التراجع عن هذا الإجراء.")) {
      try {
        await dispatch(deleteUser(userId)).unwrap();
        toast.success("تم حذف المستخدم بنجاح");
        router.push("/users");
      } catch (error: any) {
        toast.error(error.message || "فشل حذف المستخدم");
      }
    }
  };

  const handleSuspendToggle = async () => {
    if (!user) return;
    const action = user.suspended ? "إلغاء تعليق" : "تعليق";
    if (confirm(`هل أنت متأكد من ${action} حساب هذا المستخدم؟`)) {
      try {
        await dispatch(suspendUser({ id: userId, suspended: !user.suspended })).unwrap();
        toast.success(`تم ${action} الحساب بنجاح`);
        fetchUser(); // Refresh user data
      } catch (error: any) {
        toast.error(error.message || `فشل ${action} الحساب`);
      }
    }
  };

  if (loading) return <div className="p-8 text-center">جاري التحميل...</div>;
  if (error || !user) return <div className="p-8 text-center text-red-500">خطأ: {error || "المستخدم غير موجود"}</div>;

  return (
    <div className="space-y-6 text-right" dir="rtl">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-center md:items-center justify-between gap-4 bg-card p-4 md:p-6 rounded-xl border shadow-sm">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 w-full">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => router.back()}
            className="hover:bg-muted self-start sm:self-auto shrink-0"
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
          
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-right w-full">
            <div className="relative h-20 w-20 sm:h-16 sm:w-16 shrink-0 overflow-hidden rounded-full border-2 border-border bg-muted mx-auto sm:mx-0">
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

            <div className="min-w-0 flex-1">
              <h1 className="text-xl md:text-2xl font-bold truncate">{user.name}</h1>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2">
                <Badge variant="secondary" className="font-normal shrink-0">
                  {roleMap[user.role] || user.role}
                </Badge>
                {user.suspended && (
                  <Badge variant="destructive" className="font-normal shrink-0">
                    حساب معلق
                  </Badge>
                )}
                <span className="text-xs sm:text-sm text-muted-foreground truncate max-w-[200px] sm:max-w-none block" dir="ltr">{user.email || "لا يوجد بريد إلكتروني"}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap justify-center sm:justify-end gap-2 w-full md:w-auto mt-2 md:mt-0">
          <EditUserDialog user={user} onSuccess={fetchUser} />
          <Button 
            variant={user.suspended ? "default" : "outline"} 
            size="sm"
            onClick={handleSuspendToggle}
            className={`flex-1 sm:flex-none ${user.suspended ? "bg-orange-600 hover:bg-orange-700" : ""}`}
          >
            {user.suspended ? <UserCheck className="h-4 w-4 ml-2" /> : <UserX className="h-4 w-4 ml-2" />}
            {user.suspended ? "إلغاء التعليق" : "تعليق الحساب"}
          </Button>
          <Button 
            variant="destructive" 
            size="sm"
            onClick={handleDelete}
            className="flex-1 sm:flex-none"
          >
            <Trash2 className="h-4 w-4 ml-2" />
            حذف
          </Button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <Tabs defaultValue="details" className="w-full" dir="rtl">
        <div className="py-2 -mx-4 px-4 sm:mx-0 sm:px-0">
          <TabsList className="bg-white rounded-lg p-1 shadow-sm border h-auto w-full flex justify-start sm:justify-center overflow-x-auto hide-scrollbar">
            <TabsTrigger 
              value="details" 
              className="rounded-md px-4 sm:px-6 py-2 font-medium transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm whitespace-nowrap"
            >
              <UserIcon className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">التفاصيل</span>
            </TabsTrigger>
            <TabsTrigger 
              value="orders" 
              className="rounded-md px-4 sm:px-6 py-2 font-medium transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm whitespace-nowrap"
            >
              <Package className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">الطلبات</span>
            </TabsTrigger>
            {user.role === "CUSTOMER" && (
              <>
                <TabsTrigger 
                  value="transactions" 
                  className="rounded-md px-4 sm:px-6 py-2 font-medium transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm whitespace-nowrap"
                >
                  <Wallet className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">المعاملات</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="reports" 
                  className="rounded-md px-4 sm:px-6 py-2 font-medium transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm whitespace-nowrap"
                >
                  <FileText className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">التقارير</span>
                </TabsTrigger>
              </>
            )}
            <TabsTrigger 
              value="notifications" 
              className="rounded-md px-4 sm:px-6 py-2 font-medium transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm whitespace-nowrap"
            >
              <Bell className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">الإشعارات</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="details" className="mt-6 data-[state=inactive]:hidden" forceMount>
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left Column - User Info & Wallet (2/3 width) */}
            <div className="lg:col-span-2 space-y-6">
              {/* Wallet Section - Only for Customers */}
              {user.role === "CUSTOMER" && user.customer && (
                <Card className="shadow-none">
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
                      <div className="rounded-xl border bg-card p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-sm font-medium text-muted-foreground">رصيد الدولار</div>
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="text-2xl font-bold text-foreground font-mono">
                          ${user.customer.balanceUSD?.toFixed(2) || "0.00"}
                        </div>
                      </div>

                      {/* LYD Balance */}
                      <div className="rounded-xl border bg-card p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-sm font-medium text-muted-foreground">رصيد الدينار</div>
                          <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="text-2xl font-bold text-foreground font-mono">
                          {user.customer.balanceLYD?.toFixed(2) || "0.00"} د.ل
                        </div>
                      </div>

                      {/* CNY Balance */}
                      <div className="rounded-xl border bg-card p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-sm font-medium text-muted-foreground">رصيد اليوان</div>
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="text-2xl font-bold text-foreground font-mono">
                          ¥{user.customer.balanceCNY?.toFixed(2) || "0.00"}
                        </div>
                      </div>
                    </div>

                    {/* Shipping Codes Grid */}
                    <div className="mt-6 space-y-3">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Box className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium text-muted-foreground">أكواد الشحن:</span>
                        </div>
                        <ManageShipmentCodesDialog
                          customer={{
                            ...user.customer,
                            name: user.name,
                            userId: user.id
                          } as any}
                          onSuccess={fetchUser}
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {/* China Code */}
                        {user.customer.code && (
                          <div className="flex items-center justify-between gap-2 p-3 rounded-lg bg-muted/50 border border-dashed group hover:border-primary/50 transition-colors">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">الصين:</span>
                              <span className="font-mono font-medium text-sm">{user.customer.code}</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => handleCopyCode(user.customer!.code, "الصين")}
                            >
                              {copiedCode === user.customer.code ? (
                                <Check className="h-3.5 w-3.5 text-green-500" />
                              ) : (
                                <Copy className="h-3.5 w-3.5" />
                              )}
                            </Button>
                          </div>
                        )}
                        
                        {/* Dubai Code */}
                        {user.customer.dubaiCode && (
                          <div className="flex items-center justify-between gap-2 p-3 rounded-lg bg-muted/50 border border-dashed group hover:border-primary/50 transition-colors">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">دبي:</span>
                              <span className="font-mono font-medium text-sm">{user.customer.dubaiCode}</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => handleCopyCode(user.customer!.dubaiCode!, "دبي")}
                            >
                              {copiedCode === user.customer.dubaiCode ? (
                                <Check className="h-3.5 w-3.5 text-green-500" />
                              ) : (
                                <Copy className="h-3.5 w-3.5" />
                              )}
                            </Button>
                          </div>
                        )}
                        
                        {/* USA Code */}
                        {user.customer.usaCode && (
                          <div className="flex items-center justify-between gap-2 p-3 rounded-lg bg-muted/50 border border-dashed group hover:border-primary/50 transition-colors">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">أمريكا:</span>
                              <span className="font-mono font-medium text-sm">{user.customer.usaCode}</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => handleCopyCode(user.customer!.usaCode!, "أمريكا")}
                            >
                              {copiedCode === user.customer.usaCode ? (
                                <Check className="h-3.5 w-3.5 text-green-500" />
                              ) : (
                                <Copy className="h-3.5 w-3.5" />
                              )}
                            </Button>
                          </div>
                        )}
                        
                        {/* Turkey Code */}
                        {user.customer.turkeyCode && (
                          <div className="flex items-center justify-between gap-2 p-3 rounded-lg bg-muted/50 border border-dashed group hover:border-primary/50 transition-colors">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">تركيا:</span>
                              <span className="font-mono font-medium text-sm">{user.customer.turkeyCode}</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => handleCopyCode(user.customer!.turkeyCode!, "تركيا")}
                            >
                              {copiedCode === user.customer.turkeyCode ? (
                                <Check className="h-3.5 w-3.5 text-green-500" />
                              ) : (
                                <Copy className="h-3.5 w-3.5" />
                              )}
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Basic Information Card */}
              <Card className="shadow-none">
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
                      <div className="font-medium" dir="ltr">{user.email || "-"}</div>                    </div>

                    <div className="space-y-1">
                      <span className="text-sm text-muted-foreground flex items-center gap-2">
                        <Phone className="h-3 w-3" /> رقم الهاتف
                      </span>
                      <div className="font-medium" dir="ltr">{user.mobile || "-"}</div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-sm text-muted-foreground flex items-center gap-2">
                        <MapPin className="h-3 w-3" /> المكان
                      </span>
                      <div className="font-medium">{user.location || "-"}</div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-sm text-muted-foreground flex items-center gap-2">
                        <MapPin className="h-3 w-3" /> المكان
                      </span>
                      <div className="font-medium">{user.location || "-"}</div>
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

                    <div className="space-y-1 col-span-1 md:col-span-2">
                      <span className="text-sm text-muted-foreground flex items-center gap-2">
                        <Phone className="h-3 w-3" /> رموز الإشعارات (FCM Tokens)
                      </span>
                      <div className="font-medium font-mono text-sm break-all bg-muted/50 p-2 rounded-md border border-dashed">
                        {user.fcmTokens && user.fcmTokens.length > 0 ? (
                           <div className="flex flex-col gap-2">
                             {user.fcmTokens.map((token, index) => (
                               <div key={index} className="flex items-center justify-between gap-2 p-2 bg-white rounded border relative group">
                                 <span className="truncate flex-1 max-w-[200px] sm:max-w-[300px] md:max-w-full text-xs" title={token}>{token}</span>
                                 <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                                  onClick={() => handleCopyCode(token, `FCM ${index + 1}`)}
                                >
                                  {copiedCode === token ? (
                                    <Check className="h-3 w-3 text-green-500" />
                                  ) : (
                                    <Copy className="h-3 w-3" />
                                  )}
                                </Button>
                               </div>
                             ))}
                           </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">لا يوجد رموز مسجلة</span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Documents (1/3 width) */}
            <div className="space-y-6">
              <Card className="shadow-none">
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

        <TabsContent value="orders" className="mt-6 data-[state=inactive]:hidden" forceMount>
          <Card className="shadow-none">
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
            <TabsContent value="transactions" className="mt-6 data-[state=inactive]:hidden" forceMount>
              <Card className="shadow-none">
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

            <TabsContent value="reports" className="mt-6 data-[state=inactive]:hidden" forceMount>
              <TransactionReports customerId={user.customer.id} />
            </TabsContent>
          </>
        )}
        {/* Notifications Tab */}
        <TabsContent value="notifications" className="mt-6 data-[state=inactive]:hidden" forceMount>
          <Card className="shadow-none">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Bell className="h-5 w-5 text-primary" />
                سجل الإشعارات ({notifTotal})
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="rounded-md border mt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">العنوان</TableHead>
                      <TableHead className="text-right">النص</TableHead>
                      <TableHead className="text-right">النوع</TableHead>
                      <TableHead className="text-right">الحالة</TableHead>
                      <TableHead className="text-right">التاريخ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {notifLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">جاري التحميل...</TableCell>
                      </TableRow>
                    ) : notifications.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center h-24">
                          <div className="flex flex-col items-center gap-2 text-muted-foreground">
                            <Bell className="h-10 w-10 opacity-20" />
                            <p>لا توجد إشعارات لهذا المستخدم</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      notifications.map((notif) => (
                        <TableRow key={notif.id}>
                          <TableCell className="font-medium">{notif.title}</TableCell>
                          <TableCell className="max-w-xs truncate text-muted-foreground">{notif.body}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{notif.type}</Badge>
                          </TableCell>
                          <TableCell>
                            {notif.read ? (
                              <Badge variant="secondary">مقروءة</Badge>
                            ) : (
                              <Badge className="bg-blue-500 hover:bg-blue-600">جديدة</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {format(new Date(notif.createdAt), "dd MMM yyyy, HH:mm", { locale: ar })}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}
