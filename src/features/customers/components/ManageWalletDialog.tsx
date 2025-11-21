"use client";

import { useState } from "react";
import { useReduxDispatch } from "@/redux/provider";
import { createTransaction } from "@/features/transactions/slices/transactionSlice";
import { Customer } from "../slices/customerSlice";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wallet, TrendingUp, TrendingDown } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { TransactionType, Currency } from "@/features/transactions/types";

interface ManageWalletDialogProps {
  customer: Customer;
  onSuccess?: () => void;
}

export function ManageWalletDialog({ customer, onSuccess }: ManageWalletDialogProps) {
  const dispatch = useReduxDispatch();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: "DEPOSIT" as TransactionType,
    currency: "USD" as Currency,
    amount: "",
    notes: "",
  });

  const currentBalance =
    formData.currency === "USD"
      ? customer.balanceUSD
      : formData.currency === "LYD"
      ? customer.balanceLYD
      : customer.balanceCNY;

  const newBalance =
    formData.type === "DEPOSIT"
      ? currentBalance + (parseFloat(formData.amount) || 0)
      : currentBalance - (parseFloat(formData.amount) || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("يرجى إدخال مبلغ صحيح");
      return;
    }

    if (formData.type === "WITHDRAWAL" && amount > currentBalance) {
      toast.error("الرصيد غير كافي");
      return;
    }

    setLoading(true);

    try {
      await dispatch(createTransaction({
        customerId: customer.id,
        type: formData.type,
        amount,
        currency: formData.currency,
        notes: formData.notes || undefined,
      })).unwrap();

      toast.success(`تم ${formData.type === "DEPOSIT" ? "الإيداع" : "السحب"} بنجاح`);
      setOpen(false);
      setFormData({
        type: "DEPOSIT",
        currency: "USD",
        amount: "",
        notes: "",
      });
      onSuccess?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "حدث خطأ أثناء إجراء المعاملة");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" title="إدارة المحفظة">
          <Wallet className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>إضافة معاملة مالية - {customer.name}</DialogTitle>
          <DialogDescription>
            إيداع أو سحب مبلغ من محفظة العميل
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="type" className="text-right">
              نوع المعاملة
            </Label>
            <Select
              value={formData.type}
              onValueChange={(value: TransactionType) =>
                setFormData({ ...formData, type: value })
              }
            >
              <SelectTrigger className="col-span-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DEPOSIT">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    إيداع
                  </div>
                </SelectItem>
                <SelectItem value="WITHDRAWAL">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-red-500" />
                    سحب
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="currency" className="text-right">
              العملة
            </Label>
            <Select
              value={formData.currency}
              onValueChange={(value: Currency) =>
                setFormData({ ...formData, currency: value })
              }
            >
              <SelectTrigger className="col-span-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">$ دولار أمريكي</SelectItem>
                <SelectItem value="LYD">د.ل دينار ليبي</SelectItem>
                <SelectItem value="CNY">¥ يوان صيني</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount" className="text-right">
              المبلغ
            </Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="notes" className="text-right">
              ملاحظات
            </Label>
            <Textarea
              id="notes"
              placeholder="اختياري"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="col-span-3"
              rows={3}
            />
          </div>

          <div className="bg-muted p-4 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">الرصيد الحالي:</span>
              <span className="font-medium">{currentBalance.toFixed(2)}</span>
            </div>
            {formData.amount && (
              <div className="flex justify-between text-sm font-semibold">
                <span>الرصيد الجديد:</span>
                <span className={newBalance < 0 ? "text-red-500" : "text-green-500"}>
                  {newBalance.toFixed(2)}
                </span>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="submit" disabled={loading || newBalance < 0}>
              {loading ? "جار الحفظ..." : formData.type === "DEPOSIT" ? "إيداع" : "سحب"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
