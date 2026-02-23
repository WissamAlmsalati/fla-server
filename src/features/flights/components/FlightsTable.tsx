"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useReduxDispatch, useReduxSelector } from "@/redux/provider";
import { fetchFlights, updateFlight } from "../slices/flightSlice";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface FlightsTableProps {
  filters?: Record<string, string | number>;
}

const statusMap: Record<string, { label: string; color: string }> = {
  pending: { label: "قيد الانتظار", color: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100" },
  departed: { label: "غادرت", color: "bg-blue-100 text-blue-800 hover:bg-blue-100" },
  arrived: { label: "وصلت", color: "bg-green-100 text-green-800 hover:bg-green-100" },
};

const typeMap: Record<string, { label: string; color: string }> = {
  AIR: { label: "جوي", color: "bg-indigo-100 text-indigo-800" },
  SEA: { label: "بحري", color: "bg-cyan-100 text-cyan-800" },
};

const countryMap: Record<string, string> = {
  CHINA: "الصين",
  DUBAI: "دبي",
  USA: "أمريكا",
  TURKEY: "تركيا",
};

export function FlightsTable({ filters }: FlightsTableProps) {
  const router = useRouter();
  const dispatch = useReduxDispatch();
  const { list: flights, status, error } = useReduxSelector((state) => state.flights);
  const { user } = useReduxSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchFlights(filters?.search as string | undefined));
  }, [dispatch, JSON.stringify(filters)]);

  const handleStatusChange = async (flightId: number, newStatus: string) => {
    try {
      await dispatch(updateFlight({ id: flightId, data: { status: newStatus } })).unwrap();
      toast.success("تم تحديث حالة الرحلة");
      dispatch(fetchFlights(filters?.search as string | undefined));
    } catch (err: any) {
      toast.error(err.message || "فشل تحديث الحالة");
    }
  };

  const handleTypeChange = async (flightId: number, newType: string) => {
    try {
      await dispatch(updateFlight({ id: flightId, data: { type: newType as "AIR" | "SEA" } })).unwrap();
      toast.success("تم تحديث نوع الشحن");
      dispatch(fetchFlights(filters?.search as string | undefined));
    } catch (err: any) {
      toast.error(err.message || "فشل تحديث نوع الشحن");
    }
  };

  if (status === "loading") {
    return <div className="text-center p-4">جاري التحميل...</div>;
  }

  if (status === "failed") {
    return <div className="text-center text-red-500 p-4">خطأ: {error}</div>;
  }

  const canEdit = user?.role === "ADMIN" || user?.role === "CHINA_WAREHOUSE" || user?.role === "LIBYA_WAREHOUSE";

  return (
    <div className="rounded-md border bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-right">رقم الرحلة</TableHead>
            <TableHead className="text-right">الدولة</TableHead>
            <TableHead className="text-right">تاريخ الإقلاع</TableHead>
            <TableHead className="text-right">تاريخ الوصول</TableHead>
            <TableHead className="text-right text-center">عدد الطلبات المربوطة</TableHead>
            <TableHead className="text-right">نوع الشحن</TableHead>
            <TableHead className="text-right">الحالة</TableHead>
            <TableHead className="text-right">تقرير</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {flights.map((flight) => (
            <TableRow key={flight.id} className="hover:bg-muted/50">
              <TableCell className="font-bold text-lg font-mono" dir="ltr">
                {flight.flightNumber}
              </TableCell>
              <TableCell>{countryMap[flight.country] || flight.country}</TableCell>
              <TableCell>
                {flight.departureDate ? format(new Date(flight.departureDate), "yyyy-MM-dd") : "-"}
              </TableCell>
              <TableCell>
                {flight.arrivalDate ? format(new Date(flight.arrivalDate), "yyyy-MM-dd") : "-"}
              </TableCell>
              <TableCell className="text-center">
                <Badge variant="outline" className="text-base px-3 py-1 bg-slate-50">
                  {flight._count?.orders || 0}
                </Badge>
              </TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                <Badge className={flight.type && typeMap[flight.type] ? typeMap[flight.type].color : typeMap["AIR"].color}>
                  {flight.type ? typeMap[flight.type]?.label : "جوي"}
                </Badge>
              </TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                {canEdit ? (
                  <Select
                    defaultValue={flight.status}
                    onValueChange={(val) => handleStatusChange(flight.id, val)}
                  >
                    <SelectTrigger className="w-[140px] h-8 text-sm" dir="rtl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent dir="rtl">
                      {Object.entries(statusMap).map(([key, { label }]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge className={statusMap[flight.status]?.color || "bg-gray-100"}>
                    {statusMap[flight.status]?.label || flight.status}
                  </Badge>
                )}
              </TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/flights/${flight.id}`)}
                  disabled={(flight._count?.orders || 0) === 0}
                >
                  عرض التقرير
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {flights.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="text-center h-24">
                لا يوجد رحلات مسجلة
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
