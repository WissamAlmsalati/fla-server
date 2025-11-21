"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useReduxDispatch, useReduxSelector } from "@/redux/provider";
import { fetchCustomers } from "../slices/customerSlice";
import { EditUserDialog } from "../../users/components/EditUserDialog";
import { User } from "../../users/slices/userSlice";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { exportToCSV } from "@/lib/exportToCSV";

const exportCustomers = (customers: any[]) => {
  const columnMappings = {
    "user.name": "الاسم",
    "user.email": "البريد الإلكتروني",
    "user.mobile": "رقم الهاتف",
    code: "كود الشحن"
  };
  
  exportToCSV(customers, columnMappings, "customers");
};

export function CustomersTable() {
  // Force refresh
  const router = useRouter();
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
    <>
      <div className="mb-4 flex justify-end">
        <Button onClick={() => exportCustomers(customers)} variant="outline" size="sm">
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
            <TableHead className="text-right">إجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.map((customer) => {
            if (!customer.user) return null;
            return (
              <TableRow
                key={customer.id}
                onClick={() => router.push(`/users/${customer.user!.id}`)}
                className="cursor-pointer hover:bg-muted/50"
              >
                <TableCell className="font-medium">
                  {customer.user.name}
                </TableCell>
                <TableCell>{customer.user.email}</TableCell>
                <TableCell>{customer.user.mobile || "-"}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="font-mono">
                    {customer.code}
                  </Badge>
                </TableCell>
                <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                  <EditUserDialog user={customer.user as unknown as User} />
                </TableCell>
              </TableRow>
            );
          })}
          {customers.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center h-24">
                لا يوجد عملاء
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
    </>
  );
}
