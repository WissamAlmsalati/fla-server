"use client";

import { useEffect, useMemo } from "react";
import { useReduxDispatch, useReduxSelector } from "@/redux/provider";
import { fetchTransactions } from "../slices/transactionSlice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { exportToCSV } from "@/lib/exportToCSV";
import type { Currency, TransactionStats } from "../types";

interface TransactionReportsProps {
  customerId: number;
}

export function TransactionReports({ customerId }: TransactionReportsProps) {
  const dispatch = useReduxDispatch();
  const transactions = useReduxSelector((state) => state.transactions.list);
  const status = useReduxSelector((state) => state.transactions.status);

  useEffect(() => {
    dispatch(fetchTransactions({ customerId }));
  }, [customerId, dispatch]);

  const stats: TransactionStats = useMemo(() => {
    const totalDeposits: Record<Currency, number> = { USD: 0, LYD: 0, CNY: 0 };
    const totalWithdrawals: Record<Currency, number> = { USD: 0, LYD: 0, CNY: 0 };
    const netChange: Record<Currency, number> = { USD: 0, LYD: 0, CNY: 0 };

    transactions.forEach((t) => {
      if (t.type === "DEPOSIT") {
        totalDeposits[t.currency] += t.amount;
        netChange[t.currency] += t.amount;
      } else {
        totalWithdrawals[t.currency] += t.amount;
        netChange[t.currency] -= t.amount;
      }
    });

    return {
      totalDeposits,
      totalWithdrawals,
      netChange,
      transactionCount: transactions.length,
    };
  }, [transactions]);

  const handleExportReport = () => {
    if (transactions.length === 0) {
      alert("لا توجد معاملات للتصدير");
      return;
    }

    const reportData = [
      {
        category: "إجمالي الإيداعات بالدولار",
        value: stats.totalDeposits.USD.toFixed(2),
      },
      {
        category: "إجمالي السحوبات بالدولار",
        value: stats.totalWithdrawals.USD.toFixed(2),
      },
      {
        category: "صافي التغيير بالدولار",
        value: stats.netChange.USD.toFixed(2),
      },
      { category: "", value: "" },
      {
        category: "إجمالي الإيداعات بالدينار",
        value: stats.totalDeposits.LYD.toFixed(2),
      },
      {
        category: "إجمالي السحوبات بالدينار",
        value: stats.totalWithdrawals.LYD.toFixed(2),
      },
      {
        category: "صافي التغيير بالدينار",
        value: stats.netChange.LYD.toFixed(2),
      },
      { category: "", value: "" },
      {
        category: "إجمالي الإيداعات باليوان",
        value: stats.totalDeposits.CNY.toFixed(2),
      },
      {
        category: "إجمالي السحوبات باليوان",
        value: stats.totalWithdrawals.CNY.toFixed(2),
      },
      {
        category: "صافي التغيير باليوان",
        value: stats.netChange.CNY.toFixed(2),
      },
      { category: "", value: "" },
      {
        category: "إجمالي عدد المعاملات",
        value: stats.transactionCount.toString(),
      },
    ];

    const columnMappings = {
      category: "الفئة",
      value: "القيمة",
    };

    exportToCSV(reportData, columnMappings, "transactions-report");
  };

  const CurrencyCard = ({ currency, symbol }: { currency: Currency; symbol: string }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {currency === "USD" ? "دولار أمريكي" : currency === "LYD" ? "دينار ليبي" : "يوان صيني"}
        </CardTitle>
        <DollarSign className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-green-600">
            <TrendingUp className="h-4 w-4" />
            <span className="text-xs">إيداعات</span>
          </div>
          <span className="text-sm font-semibold">
            {symbol}{stats.totalDeposits[currency].toFixed(2)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-red-600">
            <TrendingDown className="h-4 w-4" />
            <span className="text-xs">سحوبات</span>
          </div>
          <span className="text-sm font-semibold">
            {symbol}{stats.totalWithdrawals[currency].toFixed(2)}
          </span>
        </div>
        <div className="flex items-center justify-between pt-2 border-t">
          <span className="text-xs text-muted-foreground">صافي التغيير</span>
          <span
            className={`text-sm font-bold ${
              stats.netChange[currency] >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {symbol}{stats.netChange[currency].toFixed(2)}
          </span>
        </div>
      </CardContent>
    </Card>
  );

  if (status === "loading") {
    return <div className="text-center py-8">جاري التحميل...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">تقارير المعاملات المالية</h3>
        <Button onClick={handleExportReport} variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          تصدير التقرير
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <CurrencyCard currency="USD" symbol="$" />
        <CurrencyCard currency="LYD" symbol="د.ل" />
        <CurrencyCard currency="CNY" symbol="¥" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">ملخص إجمالي</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">إجمالي عدد المعاملات</span>
            <span className="text-2xl font-bold">{stats.transactionCount}</span>
          </div>
        </CardContent>
      </Card>

      {transactions.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          لا توجد معاملات لعرض التقارير
        </div>
      )}
    </div>
  );
}
