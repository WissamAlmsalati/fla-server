"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useReduxDispatch, useReduxSelector } from "@/redux/provider";
import { addOrder } from "../slices/orderSlice";
import { fetchCustomers } from "@/features/customers/slices/customerSlice";
import { toast } from "sonner";
import { Plus } from "lucide-react";

const createOrderSchema = z.object({
  name: z.string().min(1, "اسم الطلب مطلوب"),
  tracking_number: z.string().min(1, "رقم التتبع مطلوب"),
  customer_id: z.string().min(1, "العميل مطلوب"),
  product_url: z.string().url("رابط غير صالح").optional().or(z.literal("")),
  usd_price: z.coerce.number().min(0, "السعر يجب أن يكون 0 أو أكثر"),
  notes: z.string().optional(),
});

type CreateOrderFormValues = z.infer<typeof createOrderSchema>;

export function CreateOrderDialog() {
  const [open, setOpen] = useState(false);
  const dispatch = useReduxDispatch();
  const { list: customers } = useReduxSelector((state) => state.customers);

  const form = useForm<CreateOrderFormValues>({
    resolver: zodResolver(createOrderSchema),
    defaultValues: {
      name: "",
      tracking_number: "",
      customer_id: "",
      product_url: "",
      usd_price: 0,
      notes: "",
    },
  });

  useEffect(() => {
    if (open) {
      dispatch(fetchCustomers());
    }
  }, [open, dispatch]);

  const onSubmit = async (data: CreateOrderFormValues) => {
    try {
      await dispatch(
        addOrder({
          ...data,
          customer_id: parseInt(data.customer_id),
          product_url: data.product_url || undefined,
        })
      ).unwrap();
      toast.success("تم إنشاء الطلب بنجاح");
      setOpen(false);
      form.reset();
    } catch (error: any) {
      toast.error(error.message || "فشل إنشاء الطلب");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          إضافة طلب
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>إضافة طلب جديد</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>اسم الطلب</FormLabel>
                  <FormControl>
                    <Input placeholder="مثال: ملابس أطفال" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tracking_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>رقم التتبع</FormLabel>
                  <FormControl>
                    <Input placeholder="Tracking Number" dir="ltr" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="customer_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>العميل</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر العميل" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id.toString()}>
                          {customer.user?.name || customer.name} ({customer.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="product_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>رابط المنتج (اختياري)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." dir="ltr" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="usd_price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>السعر (USD)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ملاحظات</FormLabel>
                  <FormControl>
                    <Textarea placeholder="أي ملاحظات إضافية..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                إلغاء
              </Button>
              <Button type="submit">حفظ</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
