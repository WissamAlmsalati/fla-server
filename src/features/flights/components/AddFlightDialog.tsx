import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useReduxDispatch } from "@/redux/provider";
import { createFlight } from "../slices/flightSlice";
import { toast } from "sonner";
import { Plus } from "lucide-react";

const formSchema = z.object({
  flightNumber: z.string().min(2, "رقم الرحلة / اسم الشحنة مطلوب"),
  status: z.string(),
  country: z.string(),
  type: z.enum(["AIR", "SEA"]),
  departureDate: z.string().optional(),
  arrivalDate: z.string().optional(),
});

export function AddFlightDialog() {
  const [open, setOpen] = useState(false);
  const dispatch = useReduxDispatch();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      flightNumber: "",
      status: "pending",
      country: "CHINA",
      type: "AIR",
      departureDate: "",
      arrivalDate: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await dispatch(createFlight({
        ...values,
        departureDate: values.departureDate || null,
        arrivalDate: values.arrivalDate || null,
      })).unwrap();
      toast.success("تم إضافة الرحلة بنجاح");
      setOpen(false);
      form.reset();
    } catch (error: any) {
      toast.error(error.message || "فشل إضافة الرحلة");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="ml-2 h-4 w-4" />
          إضافة رحلة جديدة
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-right">إضافة رحلة جديدة</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="flightNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-right block">رقم الرحلة / اسم الشحنة</FormLabel>
                  <FormControl>
                    <Input dir="rtl" className="text-right" placeholder="Flight / Shipment Name" {...field} />
                  </FormControl>
                  <FormMessage className="text-right block" />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-right block">دولة الوجهة</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger dir="rtl">
                        <SelectValue placeholder="اختر الدولة" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent dir="rtl">
                      <SelectItem value="CHINA">الصين (China)</SelectItem>
                      <SelectItem value="DUBAI">دبي (Dubai)</SelectItem>
                      <SelectItem value="USA">أمريكا (USA)</SelectItem>
                      <SelectItem value="TURKEY">تركيا (Turkey)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-right block" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-right block">حالة الرحلة</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger dir="rtl">
                        <SelectValue placeholder="اختر الحالة" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent dir="rtl">
                      <SelectItem value="pending">قيد الانتظار</SelectItem>
                      <SelectItem value="departed">غادرت</SelectItem>
                      <SelectItem value="arrived">وصلت</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-right block" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-right block">نوع الشحن</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger dir="rtl">
                        <SelectValue placeholder="اختر نوع الشحن" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent dir="rtl">
                      <SelectItem value="AIR">جوي (Air)</SelectItem>
                      <SelectItem value="SEA">بحري (Sea)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-right block" />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="departureDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-right block">تاريخ الإقلاع</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage className="text-right block" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="arrivalDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-right block">تاريخ الوصول</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage className="text-right block" />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" className="w-full">
              إضافة الرحلة
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
