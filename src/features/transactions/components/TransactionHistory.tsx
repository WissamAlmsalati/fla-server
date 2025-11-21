"use client";

import { useEffect, useState } from "react";
import { useReduxDispatch, useReduxSelector } from "@/redux/provider";
import { fetchTransactions } from "../slices/transactionSlice";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download, TrendingUp, TrendingDown, Filter } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { exportToCSV } from "@/lib/exportToCSV";
import type { Transaction, Currency, TransactionType } from "../types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TransactionHistoryProps {
  customerId: number;
}

export function TransactionHistory({ customerId }: TransactionHistoryProps) {
  const dispatch = useReduxDispatch();
  const transactions = useReduxSelector((state) => state.transactions.list);
  const status = useReduxSelector((state) => state.transactions.status);
  
  const [currencyFilter, setCurrencyFilter] = useState<Currency | "ALL">("ALL");
  const [typeFilter, setTypeFilter] = useState<TransactionType | "ALL">("ALL");

  useEffect(() => {
    dispatch(fetchTransactions({
      customerId,
      currency: currencyFilter !== "ALL" ? currencyFilter : undefined,
      type: typeFilter !== "ALL" ? typeFilter : undefined,
    }));
  }, [customerId, currencyFilter, typeFilter, dispatch]);

  const handleExport = () => {
    if (transactions.length === 0) {
      alert("لا توجد معاملات للتصدير");
      return;
    }

    const columnMappings: Record<string, string> = {
      createdAt: "التاريخ",
      type: "النوع",
      amount: "المبلغ",
      currency: "العملة",
      balanceBefore: "الرصيد قبل",
      balanceAfter: "الرصيد بعد",
      notes: "ملاحظات",
    };

    const exportData = transactions.map((t) => ({
      createdAt: format(new Date(t.createdAt), "yyyy-MM-dd HH:mm", { locale: ar }),
      type: t.type === "DEPOSIT" ? "إيداع" : "سحب",
      amount: t.amount,
      currency: t.currency,
      balanceBefore: t.balanceBefore,
      balanceAfter: t.balanceAfter,
      notes: t.notes || "-",
    }));

    exportToCSV(exportData, columnMappings, "transactions");
  };

  const getCurrencySymbol = (currency: Currency) => {
    switch (currency) {
      case "USD":
        return "$";
      case "LYD":
        return "د.ل";
      case "CNY":
        return "¥";
    }
  };

  if (status === "loading") {
    return <div className="text-center py-8">جاري التحميل...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <Select value={currencyFilter} onValueChange={(v) => setCurrencyFilter(v as Currency | "ALL")}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="العملة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">جميع العملات</SelectItem>
              <SelectItem value="USD">$ دولار</SelectItem>
              <SelectItem value="LYD">د.ل دينار</SelectItem>
              <SelectItem value="CNY">¥ يوان</SelectItem>
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as TransactionType | "ALL")}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="النوع" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">جميع الأنواع</SelectItem>
              <SelectItem value="DEPOSIT">إيداع</SelectItem>
              <SelectItem value="WITHDRAWAL">سحب</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={handleExport} variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          تصدير CSV
        </Button>
      </div>

      {transactions.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          لا توجد معاملات مالية
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">التاريخ</TableHead>
                <TableHead className="text-right">النوع</TableHead>
                <TableHead className="text-right">المبلغ</TableHead>
                <TableHead className="text-right">العملة</TableHead>
                <TableHead className="text-right">الرصيد قبل</TableHead>
                <TableHead className="text-right">الرصيد بعد</TableHead>
                <TableHead className="text-right">ملاحظات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="text-right">
                    {format(new Date(transaction.createdAt), "yyyy-MM-dd HH:mm", {
                      locale: ar,
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    {transaction.type === "DEPOSIT" ? (
                      <div className="flex items-center gap-2 text-green-600">
                        <TrendingUp className="h-4 w-4" />
                        إيداع
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-red-600">
                        <TrendingDown className="h-4 w-4" />
                        سحب
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {transaction.amount.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    {getCurrencySymbol(transaction.currency)}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {transaction.balanceBefore.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {transaction.balanceAfter.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground">
                    {transaction.notes || "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
