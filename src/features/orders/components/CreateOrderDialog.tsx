"use client";

import { useState, useEffect, useRef } from "react";
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
import { useReduxDispatch, useReduxSelector } from "@/redux/provider";
import { addOrder } from "../slices/orderSlice";
import { fetchCustomers } from "@/features/customers/slices/customerSlice";
import { toast } from "sonner";
import { Plus, Scan, Check, ChevronsUpDown, Upload, Loader2 } from "lucide-react";
import { ScannerDialog } from "@/components/scanner-dialog";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

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
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scanningImage, setScanningImage] = useState(false);
  const [customerOpen, setCustomerOpen] = useState(false);
  const dispatch = useReduxDispatch();
  const { list: customers } = useReduxSelector((state) => state.customers);
  const qrInputRef = useRef<HTMLInputElement | null>(null);

  // Filter to only show valid customers (exclude system users if they have customer records)
  const filteredCustomers = customers.filter(
    (c) => !c.user || c.user.role === "CUSTOMER"
  );

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
                    <div className="flex gap-2">
                    <FormControl>
                      <Input placeholder="Tracking Number" dir="ltr" {...field} />
                    </FormControl>
                    <div className="flex items-center gap-2">
                      <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setScannerOpen(true)}
                      title="Scan Barcode"
                    >
                      <Scan className="h-4 w-4" />
                    </Button>
                      <input
                        type="file"
                        accept="image/*"
                        ref={(el) => { qrInputRef.current = el }}
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          setScanningImage(true);
                          try {
                            const module = await import("html5-qrcode");
                            // Prefer named export, then default, then fallback
                            const exportsToCheck: any[] = [module, module?.default];
                            let rawResult: any = null;
                            // Try static methods on the exports first
                            for (const exp of exportsToCheck) {
                              if (!exp) continue;
                              if (typeof exp.scanFileV2 === "function") {
                                rawResult = await exp.scanFileV2(file, true);
                                break;
                              } else if (typeof exp.scanFile === "function") {
                                rawResult = await exp.scanFile(file, true);
                                break;
                              } else if (typeof exp.scanImage === "function") {
                                rawResult = await exp.scanImage(file, true);
                                break;
                              }
                            }
                            // If static methods weren't found, try to find a constructor for instance methods
                            if (!rawResult) {
                              let Constructor: any = null;
                              // Possible constructor locations
                              const constructorCandidates = [module?.Html5Qrcode, module?.default?.Html5Qrcode, module?.default, module];
                              for (const c of constructorCandidates) {
                                if (typeof c === "function") {
                                  Constructor = c;
                                  break;
                                }
                              }
                              if (!Constructor) {
                                // As a last resort check if module itself is a function
                                if (typeof module === "function") Constructor = module;
                              }
                              if (!Constructor) {
                                throw new Error("Unsupported html5-qrcode API: no static or instance constructor found");
                              }
                              // Create a temporary hidden container for the instance
                              const tempId = `html5qr-temp-${Date.now()}`;
                              const tempDiv = document.createElement("div");
                              tempDiv.id = tempId;
                              tempDiv.style.display = "none";
                              document.body.appendChild(tempDiv);
                              const instance = new Constructor(tempId);
                              try {
                                if (typeof instance.scanFileV2 === "function") {
                                  rawResult = await instance.scanFileV2(file, true);
                                } else if (typeof instance.scanFile === "function") {
                                  rawResult = await instance.scanFile(file, true);
                                } else if (typeof instance.scanImage === "function") {
                                  rawResult = await instance.scanImage(file, true);
                                } else {
                                  throw new Error("Unsupported html5-qrcode instance API: no scan method found");
                                }
                              } finally {
                                try {
                                  if (instance && typeof instance.stop === "function") {
                                    await instance.stop();
                                  }
                                } catch (err2) {
                                  console.warn("Error stopping html5-qrcode instance", err2);
                                }
                                try {
                                  if (instance && typeof instance.clear === "function") {
                                    instance.clear();
                                  }
                                } catch (err3) {
                                  console.warn("Error clearing html5-qrcode instance", err3);
                                }
                                tempDiv.remove();
                              }
                            }
                            // Depending on the version, the method may return a string or an object
                            let resultText: string | null = null;
                            if (!rawResult) {
                              resultText = null;
                            } else if (typeof rawResult === "string") {
                              resultText = rawResult;
                            } else if (rawResult.decodedText) {
                              resultText = rawResult.decodedText;
                            } else if (Array.isArray(rawResult) && rawResult[0]?.decodedText) {
                              resultText = rawResult[0].decodedText;
                            }
                            if (resultText) {
                              // If the QR contains a longer string, but we prefer a numeric ID,
                              // try to extract a numeric substring of length 6+ as a tracking number; otherwise use full string
                              const numericMatch = resultText.match(/\d{6,}/);
                              const finalValue = numericMatch ? numericMatch[0] : resultText;
                              form.setValue("tracking_number", finalValue);
                              toast.success("تم استخراج رقم التتبع من صورة QR");
                            } else {
                              toast.error("لم يتم العثور على رمز QR في الصورة");
                            }
                          } catch (err: any) {
                            console.error("QR image scan error", err);
                            toast.error(err?.message || "فشل قراءة رمز QR من الصورة");
                          } finally {
                            setScanningImage(false);
                            // Reset input value so same file can be selected again if needed
                            (e.target as HTMLInputElement).value = "";
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        disabled={scanningImage}
                        onClick={() => qrInputRef.current?.click()}
                        title="Upload QR Image"
                      >
                        {scanningImage ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Upload className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="customer_id"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>العميل</FormLabel>
                  <Popover open={customerOpen} onOpenChange={setCustomerOpen} modal={true}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={customerOpen}
                          className={cn(
                            "w-full justify-between",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value
                            ? (() => {
                                  const customer = filteredCustomers.find(
                                  (c) => c.id.toString() === field.value
                                );
                                return customer
                                  ? `${customer.user?.name || customer.name} (${customer.code})`
                                  : "اختر العميل";
                              })()
                            : "اختر العميل"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-0" align="start">
                      <Command>
                        <CommandInput placeholder="بحث عن عميل..." />
                        <CommandList>
                          <CommandEmpty>لم يتم العثور على عميل.</CommandEmpty>
                          <CommandGroup>
                            {filteredCustomers.map((customer) => (
                              <CommandItem
                                value={`${customer.name || customer.user?.name} ${customer.code}`}
                                key={customer.id}
                                onSelect={() => {
                                  form.setValue("customer_id", customer.id.toString());
                                  setCustomerOpen(false);
                                }}
                                className="cursor-pointer"
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    customer.id.toString() === field.value
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {customer.user?.name || customer.name} ({customer.code})
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
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

      <ScannerDialog
        open={scannerOpen}
        onOpenChange={setScannerOpen}
        onScan={(result) => {
          form.setValue("tracking_number", result);
          setScannerOpen(false);
          toast.success("تم مسح الباركود بنجاح");
        }}
      />
    </Dialog>
  );
}
