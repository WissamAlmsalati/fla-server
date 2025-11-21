"use client";

import { useState } from "react";
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
import { useReduxDispatch } from "@/redux/provider";
import { updateOrder, Order } from "../slices/orderSlice";
import { toast } from "sonner";
import { PackageCheck } from "lucide-react";

const updateOrderSchema = z.object({
  weight: z.coerce.number().min(0.1, "الوزن مطلوب"),
});

type UpdateOrderFormValues = z.infer<typeof updateOrderSchema>;

interface ChinaWarehouseUpdateDialogProps {
  order: Order;
}

export function ChinaWarehouseUpdateDialog({ order }: ChinaWarehouseUpdateDialogProps) {
  const [open, setOpen] = useState(false);
  const dispatch = useReduxDispatch();

  const form = useForm<UpdateOrderFormValues>({
    resolver: zodResolver(updateOrderSchema),
    defaultValues: {
      weight: order.weight || 0,
    },
  });

  const onSubmit = async (data: UpdateOrderFormValues) => {
    try {
      await dispatch(
        updateOrder({
          id: order.id,
          data: {
            weight: data.weight,
            status: "arrived_to_china",
          },
        })
      ).unwrap();
      toast.success("تم تحديث الطلب بنجاح");
      setOpen(false);
    } catch (error: any) {
      toast.error(error.message || "فشل تحديث الطلب");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <PackageCheck className="h-4 w-4" />
          استلام في الصين
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>تحديث حالة الطلب - وصول للصين</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="text-sm text-muted-foreground mb-4">
              سيتم تغيير حالة الطلب <strong>{order.trackingNumber}</strong> إلى "وصل لمخزن الصين".
            </div>
            <FormField
              control={form.control}
              name="weight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الوزن (كجم)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                إلغاء
              </Button>
              <Button type="submit">تحديث الحالة</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
