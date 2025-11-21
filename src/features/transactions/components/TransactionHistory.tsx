"use client";

import { useEffect, useState } from "react";
import { useReduxDispatch, useReduxSelector } from "@/redux/provider";
import { fetchTransactions } from "../slices/transactionSlice";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download, TrendingUp, TrendingDown, Filter, Search, ChevronLeft, ChevronRight } from "lucide-react";
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
import { Input } from "@/components/ui/input";

interface TransactionHistoryProps {
  customerId: number;
}

export function TransactionHistory({ customerId }: TransactionHistoryProps) {
  const dispatch = useReduxDispatch();
  const transactions = useReduxSelector((state) => state.transactions.list);
  const status = useReduxSelector((state) => state.transactions.status);
  
  const [currencyFilter, setCurrencyFilter] = useState<Currency | "ALL">("ALL");
  const [typeFilter, setTypeFilter] = useState<TransactionType | "ALL">("ALL");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

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

  const filteredTransactions = transactions.filter(transaction => {
    if (!debouncedSearch) return true;
    return transaction.notes?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
           transaction.amount.toString().includes(debouncedSearch) ||
           transaction.type.toLowerCase().includes(debouncedSearch.toLowerCase());
  });

  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="space-y-4" dir="rtl">
      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="بحث في المعاملات..."
              className="pr-8 w-[200px]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <Select value={currencyFilter} onValueChange={(v) => setCurrencyFilter(v as Currency | "ALL")}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="جميع العملات" />
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
              <SelectValue placeholder="جميع الأنواع" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">جميع الأنواع</SelectItem>
              <SelectItem value="DEPOSIT">إيداع</SelectItem>
              <SelectItem value="WITHDRAWAL">سحب</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={handleExport} variant="outline" size="sm" className="shrink-0">
          <Download className="h-4 w-4 ml-2" />
          تصدير CSV
        </Button>
      </div>

      {transactions.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          لا توجد معاملات مالية
        </div>
      ) : (
        <>
          <div className="rounded-md border pr-4 pl-4" dir="rtl">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="text-right font-semibold">التاريخ</TableHead>
                  <TableHead className="text-right font-semibold">النوع</TableHead>
                  <TableHead className="text-right font-semibold">المبلغ</TableHead>
                  <TableHead className="text-right font-semibold">العملة</TableHead>
                  <TableHead className="text-right font-semibold">الرصيد قبل</TableHead>
                  <TableHead className="text-right font-semibold">الرصيد بعد</TableHead>
                  <TableHead className="text-right font-semibold">ملاحظات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedTransactions.map((transaction) => (
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
                      <span className={transaction.type === "DEPOSIT" ? "text-green-600" : "text-red-600"}>
                        {transaction.type === "DEPOSIT" ? "+" : "-"}{transaction.amount.toFixed(2)} {getCurrencySymbol(transaction.currency)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {transaction.currency}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground font-mono">
                      {transaction.balanceBefore.toFixed(2)} {getCurrencySymbol(transaction.currency)}
                    </TableCell>
                    <TableCell className="text-right font-semibold font-mono">
                      {transaction.balanceAfter.toFixed(2)} {getCurrencySymbol(transaction.currency)}
                    </TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">
                      {transaction.notes || "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronLeft className="h-4 w-4 ml-1" />
                  التالي
                </Button>
                <span className="text-sm">
                  الصفحة {currentPage} من {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  السابق
                  <ChevronRight className="h-4 w-4 mr-1" />
                </Button>
              </div>
              <div className="text-sm text-muted-foreground">
                عرض {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filteredTransactions.length)} إلى {Math.min(currentPage * ITEMS_PER_PAGE, filteredTransactions.length)} من {filteredTransactions.length} معاملة
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
