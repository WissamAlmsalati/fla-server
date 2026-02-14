"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, X, Eye } from "lucide-react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Customer {
  id: number;
  name: string;
  code: string;
  dubaiCode: string | null;
  usaCode: string | null;
  turkeyCode: string | null;
}

interface AccountRequest {
  id: number;
  name: string;
  email: string;
  mobile: string | null;
  role: string;
  approved: boolean;
  suspended: boolean;
  createdAt: string;
  customer: Customer | null;
}

export function AccountRequestsTable() {
  const [accounts, setAccounts] = useState<AccountRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAccount, setSelectedAccount] = useState<AccountRequest | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/account-requests");
      if (!response.ok) throw new Error("Failed to fetch accounts");
      const data = await response.json();
      setAccounts(data.accounts);
    } catch (error) {
      toast.error("فشل تحميل طلبات الحسابات");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleApprove = async (id: number) => {
    try {
      const response = await fetch(`/api/account-requests/${id}`, {
        method: "PATCH",
      });

      if (!response.ok) throw new Error("Failed to approve account");

      toast.success("تم قبول الحساب بنجاح");
      fetchAccounts(); // Refresh the list
    } catch (error) {
      toast.error("فشل قبول الحساب");
      console.error(error);
    }
  };

  const handleReject = async (id: number) => {
    if (!confirm("هل أنت متأكد من رفض هذا الطلب؟ سيتم حذف الحساب نهائياً.")) {
      return;
    }

    try {
      const response = await fetch(`/api/account-requests/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to reject account");

      toast.success("تم رفض الطلب وحذف الحساب");
      fetchAccounts(); // Refresh the list
    } catch (error) {
      toast.error("فشل رفض الطلب");
      console.error(error);
    }
  };

  const showDetails = (account: AccountRequest) => {
    setSelectedAccount(account);
    setDetailsOpen(true);
  };

  if (loading) {
    return <div className="text-center p-4">جاري التحميل...</div>;
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">الاسم</TableHead>
              <TableHead className="text-right">البريد الإلكتروني</TableHead>
              <TableHead className="text-right">رقم الهاتف</TableHead>
              <TableHead className="text-right">كود الشحن</TableHead>
              <TableHead className="text-right">تاريخ التسجيل</TableHead>
              <TableHead className="text-right">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {accounts.map((account) => (
              <TableRow key={account.id}>
                <TableCell className="font-medium">{account.name}</TableCell>
                <TableCell>{account.email}</TableCell>
                <TableCell>{account.mobile || "-"}</TableCell>
                <TableCell>
                  {account.customer?.code ? (
                    <Badge variant="outline" className="font-mono">
                      {account.customer.code}
                    </Badge>
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell>
                  {format(new Date(account.createdAt), "dd MMMM yyyy", {
                    locale: ar,
                  })}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => showDetails(account)}
                      title="عرض التفاصيل"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-green-600 hover:text-green-700 hover:bg-green-50"
                      onClick={() => handleApprove(account.id)}
                      title="قبول"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive/90"
                      onClick={() => handleReject(account.id)}
                      title="رفض"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {accounts.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24">
                  لا توجد طلبات معلقة
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>تفاصيل طلب الحساب</DialogTitle>
            <DialogDescription>
              معلومات كاملة عن طلب إنشاء الحساب
            </DialogDescription>
          </DialogHeader>
          {selectedAccount && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    الاسم
                  </p>
                  <p className="text-base">{selectedAccount.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    البريد الإلكتروني
                  </p>
                  <p className="text-base">{selectedAccount.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    رقم الهاتف
                  </p>
                  <p className="text-base">{selectedAccount.mobile || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    تاريخ التسجيل
                  </p>
                  <p className="text-base">
                    {format(
                      new Date(selectedAccount.createdAt),
                      "dd MMMM yyyy - HH:mm",
                      { locale: ar }
                    )}
                  </p>
                </div>
              </div>

              {selectedAccount.customer && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-3">أكواد الشحن</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        كود الصين
                      </p>
                      <Badge variant="outline" className="font-mono mt-1">
                        {selectedAccount.customer.code}
                      </Badge>
                    </div>
                    {selectedAccount.customer.dubaiCode && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          كود دبي
                        </p>
                        <Badge variant="outline" className="font-mono mt-1">
                          {selectedAccount.customer.dubaiCode}
                        </Badge>
                      </div>
                    )}
                    {selectedAccount.customer.usaCode && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          كود أمريكا
                        </p>
                        <Badge variant="outline" className="font-mono mt-1">
                          {selectedAccount.customer.usaCode}
                        </Badge>
                      </div>
                    )}
                    {selectedAccount.customer.turkeyCode && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          كود تركيا
                        </p>
                        <Badge variant="outline" className="font-mono mt-1">
                          {selectedAccount.customer.turkeyCode}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 border-t pt-4">
                <Button
                  variant="outline"
                  onClick={() => setDetailsOpen(false)}
                >
                  إغلاق
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    handleReject(selectedAccount.id);
                    setDetailsOpen(false);
                  }}
                >
                  <X className="h-4 w-4 mr-2" />
                  رفض
                </Button>
                <Button
                  onClick={() => {
                    handleApprove(selectedAccount.id);
                    setDetailsOpen(false);
                  }}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Check className="h-4 w-4 mr-2" />
                  قبول
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
