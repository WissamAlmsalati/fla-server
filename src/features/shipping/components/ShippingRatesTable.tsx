"use client";

import { useEffect } from "react";
import { useReduxDispatch, useReduxSelector } from "@/redux/provider";
import { loadRates, deleteRate, ShippingType } from "../slices/shippingSlice";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, Download } from "lucide-react";
import { EditRateDialog } from "./EditRateDialog";
import { toast } from "sonner";
import { exportToCSV } from "@/lib/exportToCSV";

interface ShippingRatesTableProps {
  type: ShippingType;
  filters?: Record<string, string | number>;
}

export function ShippingRatesTable({ type, filters }: ShippingRatesTableProps) {
  const dispatch = useReduxDispatch();
  const { rates, status, error } = useReduxSelector((state) => state.shipping);

  const exportRates = (rates: any[], type: string) => {
    const columnMappings = {
      name: "التصنيف",
      price: type === "AIR" ? "السعر (USD / kg)" : "السعر (USD / cbm)"
    };
    
    exportToCSV(rates, columnMappings, `shipping-${type.toLowerCase()}`);
  };

  useEffect(() => {
    dispatch(loadRates(filters));
  }, [dispatch, JSON.stringify(filters)]);

  const handleDelete = async (id: number) => {
    if (confirm("هل أنت متأكد من حذف هذا التصنيف؟")) {
      try {
        await dispatch(deleteRate(id)).unwrap();
        toast.success("تم حذف التصنيف بنجاح");
      } catch (error: any) {
        toast.error(error.message || "فشل حذف التصنيف");
      }
    }
  };

  const filteredRates = rates.filter((rate) => rate.type === type);

  if (status === "loading" && rates.length === 0) {
    return <div className="text-center p-4">جاري التحميل...</div>;
  }

  if (status === "failed") {
    return <div className="text-center text-red-500 p-4">خطأ: {error}</div>;
  }


  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button onClick={() => exportRates(filteredRates, type)} variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          تصدير CSV
        </Button>
      </div>
      <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-right">التصنيف</TableHead>
            <TableHead className="text-right">البلد</TableHead>
            <TableHead className="text-right">
              {type === "AIR" ? "السعر (USD / 1 kg)" : "السعر (USD / 1 cbm)"}
            </TableHead>
            <TableHead className="text-right">إجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredRates.map((rate) => (
            <TableRow key={rate.id}>
              <TableCell className="font-medium">{rate.name}</TableCell>
              <TableCell>
                {(() => {
                  switch (rate.country) {
                    case "DUBAI": return "دبي (Dubai)";
                    case "USA": return "أمريكا (USA)";
                    case "TURKEY": return "تركيا (Turkey)";
                    default: return "الصين (China)";
                  }
                })()}
              </TableCell>
              <TableCell>
                ${rate.price} <span className="text-muted-foreground text-xs">/ {rate.type === "AIR" ? "kg" : "cbm"}</span>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <EditRateDialog rate={rate} />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDelete(rate.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {filteredRates.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-center h-24">
                لا يوجد تصنيفات
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
    </>
  );
}
