"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Button } from "@/components/ui/button";
import { useReduxDispatch } from "@/redux/provider";
import { updateFlight, fetchFlights, Flight } from "../slices/flightSlice";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const formSchema = z.object({
  flightNumber: z.string().min(1, "رقم الرحلة مطلوب"),
  country: z.string().min(1, "الدولة مطلوبة"),
  type: z.enum(["AIR", "SEA"]),
  status: z.string().min(1, "الحالة مطلوبة"),
  departureDate: z.string().optional(),
  arrivalDate: z.string().optional(),
});

interface EditFlightDialogProps {
  flight: Flight | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters?: Record<string, string | number>;
}

export function EditFlightDialog({ flight, open, onOpenChange, filters }: EditFlightDialogProps) {
  const dispatch = useReduxDispatch();
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      flightNumber: "",
      country: "CHINA",
      type: "AIR",
      status: "pending",
      departureDate: "",
      arrivalDate: "",
    },
  });

  useEffect(() => {
    if (flight && open) {
      form.reset({
        flightNumber: flight.flightNumber,
        country: flight.country || "CHINA",
        type: flight.type || "AIR",
        status: flight.status || "pending",
        departureDate: flight.departureDate ? new Date(flight.departureDate).toISOString().split('T')[0] : "",
        arrivalDate: flight.arrivalDate ? new Date(flight.arrivalDate).toISOString().split('T')[0] : "",
      });
    }
  }, [flight, open, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!flight) return;
    
    try {
      setLoading(true);
      await dispatch(
        updateFlight({
          id: flight.id,
          data: {
            flightNumber: values.flightNumber,
            country: values.country,
            type: values.type,
            status: values.status,
            departureDate: values.departureDate ? new Date(values.departureDate).toISOString() : null,
            arrivalDate: values.arrivalDate ? new Date(values.arrivalDate).toISOString() : null,
          },
        })
      ).unwrap();
      
      toast.success("تم تحديث بيانات الرحلة بنجاح");
      dispatch(fetchFlights(filters?.search as string | undefined));
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "فشل تحديث بيانات الرحلة");
      console.error("Edit flight error:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-right">تعديل تفاصيل الرحلة</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" dir="rtl">
            <FormField
              control={form.control}
              name="flightNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>رقم الرحلة</FormLabel>
                  <FormControl>
                    <Input {...field} dir="ltr" className="text-right" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الدولة</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر الدولة" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="CHINA">الصين</SelectItem>
                        <SelectItem value="DUBAI">دبي</SelectItem>
                        <SelectItem value="USA">أمريكا</SelectItem>
                        <SelectItem value="TURKEY">تركيا</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>نوع الشحن</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر نوع الشحن" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="AIR">جوي</SelectItem>
                        <SelectItem value="SEA">بحري</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>حالة الرحلة</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الحالة" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="pending">قيد الانتظار</SelectItem>
                      <SelectItem value="departed">غادرت</SelectItem>
                      <SelectItem value="arrived">وصلت</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="departureDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>تاريخ الإقلاع</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="arrivalDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>تاريخ الوصول</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" className="w-full mt-6" disabled={loading}>
              {loading ? "جاري الحفظ..." : "حفظ التعديلات"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
