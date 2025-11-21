"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useReduxDispatch, useReduxSelector } from "@/redux/provider";
import { fetchUsers, deleteUser, User } from "../slices/userSlice";
import { EditUserDialog } from "./EditUserDialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
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
import { Download } from "lucide-react";
import { exportToCSV } from "@/lib/exportToCSV";

const roleMap: Record<string, string> = {
  ADMIN: "مدير النظام",
  PURCHASE_OFFICER: "مسؤول مشتريات",
  CHINA_WAREHOUSE: "مخزن الصين",
  LIBYA_WAREHOUSE: "مخزن ليبيا",
  CUSTOMER: "عميل",
};

const roleColorMap: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  ADMIN: "destructive",
  PURCHASE_OFFICER: "default",
  CHINA_WAREHOUSE: "secondary",
  LIBYA_WAREHOUSE: "secondary",
  CUSTOMER: "outline",
};

const exportUsers = (users: User[]) => {
  const columnMappings = {
    name: "الاسم",
    email: "البريد الإلكتروني",
    mobile: "رقم الهاتف",
    "customer.code": "كود الشحن",
    role: "الدور",
    createdAt: "تاريخ التسجيل"
  };
  
  // Transform data for export
  const dataToExport = users.map(user => ({
    ...user,
    role: roleMap[user.role] || user.role,
    createdAt: format(new Date(user.createdAt), "dd MMMM yyyy", { locale: ar }),
    mobile: user.mobile || "-"
  }));
  
  exportToCSV(dataToExport, columnMappings, "users");
};

export function UsersTable() {
  const router = useRouter();
  const dispatch = useReduxDispatch();
  const { list: users, status, error } = useReduxSelector((state) => state.users);

  const handleDelete = async (id: number) => {
    if (confirm("هل أنت متأكد من حذف هذا المستخدم؟")) {
      try {
        await dispatch(deleteUser(id)).unwrap();
        toast.success("تم حذف المستخدم بنجاح");
      } catch (error: any) {
        toast.error(error.message || "فشل حذف المستخدم");
      }
    }
  };

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchUsers());
    }
  }, [dispatch, status]);

  if (status === "loading") {
    return <div className="text-center p-4">جاري التحميل...</div>;
  }

  if (status === "failed") {
    return <div className="text-center text-red-500 p-4">خطأ: {error}</div>;
  }

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button onClick={() => exportUsers(users)} variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          تصدير CSV
        </Button>
      </div>
      <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-right">الاسم</TableHead>
            <TableHead className="text-right">البريد الإلكتروني</TableHead>
            <TableHead className="text-right">رقم الهاتف</TableHead>
            <TableHead className="text-right">كود الشحن</TableHead>
            <TableHead className="text-right">الدور</TableHead>
            <TableHead className="text-right">تاريخ التسجيل</TableHead>
            <TableHead className="text-right">إجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow 
              key={user.id} 
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => router.push(`/users/${user.id}`)}
            >
              <TableCell className="font-medium">{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.mobile || "-"}</TableCell>
              <TableCell>
                {user.role === "CUSTOMER" && user.customer?.code ? (
                  <Badge variant="outline" className="font-mono">
                    {user.customer.code}
                  </Badge>
                ) : (
                  "-"
                )}
              </TableCell>
              <TableCell>
                <Badge variant={roleColorMap[user.role] || "outline"}>
                  {roleMap[user.role] || user.role}
                </Badge>
              </TableCell>
              <TableCell>
                {format(new Date(user.createdAt), "dd MMMM yyyy", { locale: ar })}
              </TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-2">
                  <EditUserDialog user={user} />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive/90"
                    onClick={() => handleDelete(user.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {users.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center h-24">
                لا يوجد مستخدمين
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
    </>
  );
}
