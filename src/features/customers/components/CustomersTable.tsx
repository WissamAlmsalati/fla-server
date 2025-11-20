"use client";

import { useEffect } from "react";
import { useReduxDispatch, useReduxSelector } from "@/redux/provider";
import { fetchCustomers } from "../slices/customerSlice";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export function CustomersTable() {
  const dispatch = useReduxDispatch();
  const { list: customers, status, error } = useReduxSelector((state) => state.customers);

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchCustomers());
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
            <TableHead className="text-right">المستخدم المرتبط</TableHead>
            <TableHead className="text-right">عدد الطلبات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.map((customer) => (
            <TableRow key={customer.id}>
              <TableCell className="font-medium">{customer.name}</TableCell>
              <TableCell>{customer.user?.email || "-"}</TableCell>
              <TableCell>
                <Badge variant="secondary">
                  {customer._count?.orders || 0}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
          {customers.length === 0 && (
            <TableRow>
              <TableCell colSpan={3} className="text-center h-24">
                لا يوجد عملاء
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
