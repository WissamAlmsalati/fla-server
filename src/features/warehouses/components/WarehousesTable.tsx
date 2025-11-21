"use client";

import { useEffect } from "react";
import { useReduxDispatch, useReduxSelector } from "@/redux/provider";
import { loadWarehouses } from "../slices/warehouseSlice";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Warehouse, Download } from "lucide-react";
import { exportToCSV } from "@/lib/exportToCSV";

const exportWarehouses = (warehouses: any[]) => {
  const columnMappings = {
    name: "اسم المخزن",
    country: "الدولة",
    id: "المعرف"
  };
  
  exportToCSV(warehouses, columnMappings, "warehouses");
};

export function WarehousesTable() {
  const dispatch = useReduxDispatch();
  const { list: warehouses, status, error } = useReduxSelector((state) => state.warehouses);

  useEffect(() => {
    if (status === "idle") {
      dispatch(loadWarehouses());
    }
  }, [dispatch, status]);

  if (status === "loading") {
    return <div className="text-center p-4">جاري التحميل...</div>;
  }

  if (status === "failed") {
    return <div className="text-center text-red-500 p-4">خطأ: {error}</div>;
  }

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button onClick={() => exportWarehouses(warehouses)} variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          تصدير CSV
        </Button>
      </div>
      <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-right">اسم المخزن</TableHead>
            <TableHead className="text-right">الدولة</TableHead>
            <TableHead className="text-right">المعرف</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {warehouses.map((warehouse) => (
            <TableRow key={warehouse.id}>
              <TableCell className="font-medium flex items-center gap-2">
                <Warehouse className="h-4 w-4 text-muted-foreground" />
                {warehouse.name}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  {warehouse.country}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="font-mono">
                  #{warehouse.id}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
          {warehouses.length === 0 && (
            <TableRow>
              <TableCell colSpan={3} className="text-center h-24">
                لا يوجد مخازن
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
    </>
  );
}
