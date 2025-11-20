"use client";

import { useEffect } from "react";
import { useReduxDispatch, useReduxSelector } from "@/redux/provider";
import { fetchUsers, User } from "../slices/userSlice";
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

export function UsersTable() {
  const dispatch = useReduxDispatch();
  const { list: users, status, error } = useReduxSelector((state) => state.users);

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
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-right">الاسم</TableHead>
            <TableHead className="text-right">البريد الإلكتروني</TableHead>
            <TableHead className="text-right">الدور</TableHead>
            <TableHead className="text-right">تاريخ التسجيل</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Badge variant={roleColorMap[user.role] || "outline"}>
                  {roleMap[user.role] || user.role}
                </Badge>
              </TableCell>
              <TableCell>
                {format(new Date(user.createdAt), "dd MMMM yyyy", { locale: ar })}
              </TableCell>
            </TableRow>
          ))}
          {users.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-center h-24">
                لا يوجد مستخدمين
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
