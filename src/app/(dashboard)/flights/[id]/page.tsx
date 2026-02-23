"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useReactToPrint } from "react-to-print";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Printer, Users, Package, Calendar, Plane, Ship } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function FlightReportPage() {
  const params = useParams();
  const router = useRouter();
  const flightId = params.id as string;
  const printRef = useRef<HTMLDivElement>(null);

  const [flight, setFlight] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Group orders by customer
  const [customersMap, setCustomersMap] = useState<Record<number, any>>({});
  
  useEffect(() => {
    const fetchFlight = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`/api/flights/${flightId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!response.ok) throw new Error("فشل تحميل بيانات الرحلة / الشحنة");
        
        const data = await response.json();
        setFlight(data);

        // Group users linked to this flight
        const cMap: Record<number, any> = {};
        if (data.orders) {
          data.orders.forEach((order: any) => {
            if (order.customer) {
              if (!cMap[order.customer.id]) {
                cMap[order.customer.id] = {
                  ...order.customer,
                  totalOrders: 0,
                  totalWeight: 0,
                };
              }
              cMap[order.customer.id].totalOrders += 1;
              cMap[order.customer.id].totalWeight += (order.weight || 0);
            }
          });
        }
        setCustomersMap(cMap);

      } catch (err: any) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (flightId) fetchFlight();
  }, [flightId]);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `تقرير شحنة - ${flight?.flightNumber || 'غير معروف'}`,
  });

  if (loading) return <div className="p-8 text-center text-muted-foreground">جاري تحميل التقرير...</div>;
  if (!flight) return <div className="p-8 text-center text-red-500">الرحلة غير موجودة</div>;

  const totalOrders = flight.orders?.length || 0;
  const totalWeight = flight.orders?.reduce((sum: number, o: any) => sum + (o.weight || 0), 0) || 0;
  const totalUSD = flight.orders?.reduce((sum: number, o: any) => sum + (Number(o.usdPrice) || 0), 0) || 0;
  const totalCNY = flight.orders?.reduce((sum: number, o: any) => sum + (Number(o.cnyPrice) || 0), 0) || 0;
  const uniqueUsers = Object.values(customersMap);

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-8" dir="rtl">
      
      {/* Custom Styles for Printing */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page { size: A4 portrait; margin: 15mm; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          table { page-break-inside: auto; width: 100%; border-collapse: collapse; }
          tr { page-break-inside: avoid; page-break-after: auto; }
          td, th { padding: 8px !important; }
        }
      `}} />

      {/* Header Actions (Not Printed) */}
      <div className="flex items-center justify-between no-print">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowRight className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">تقرير الرحلة / الشحنة</h1>
        </div>
        <Button onClick={() => handlePrint()} className="gap-2">
          <Printer className="h-4 w-4" />
          طباعة PDF
        </Button>
      </div>

      {/* Printable Area */}
      <div ref={printRef} className="print-container bg-white rounded-lg p-6 md:p-8 space-y-8 print:p-0 print:shadow-none">
        
        {/* Report Header Logo & Title */}
        <div className="flex justify-between items-start border-b pb-6 print:border-b-2">
          <div>
            <div className="hidden print:block mb-8 border-b-2 border-gray-200 pb-4">
              <img
                src="/photos/logo-with-title.png"
                alt="Alwala Logo"
                className="w-[200px] h-auto object-contain mx-0"
              />
            </div>
            <h2 className="text-3xl font-bold tracking-tight mb-2 print:text-2xl">رقم الشحنة: <span className="text-primary font-mono print:text-black">{flight.flightNumber}</span></h2>
            <div className="flex flex-col gap-2 text-muted-foreground mt-4 print:text-black">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>تاريخ الإقلاع: {flight.departureDate ? format(new Date(flight.departureDate), 'yyyy-MM-dd') : 'غير محدد'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>تاريخ الوصول: {flight.arrivalDate ? format(new Date(flight.arrivalDate), 'yyyy-MM-dd') : 'غير محدد'}</span>
              </div>
            </div>
          </div>
          <div className="text-left print:mt-32">
            <div className="flex justify-end gap-2 mb-2">
              <Badge variant="outline" className={`text-lg px-4 py-1.5 print:border-gray-300 print:text-black print:bg-transparent ${flight.type === 'SEA' ? 'bg-cyan-50 text-cyan-700' : 'bg-indigo-50 text-indigo-700'}`}>
                {flight.type === 'SEA' ? <Ship className="h-4 w-4 ml-2 print:text-black" /> : <Plane className="h-4 w-4 ml-2 print:text-black" />}
                {flight.type === 'SEA' ? 'شحن بحري' : 'شحن جوي'}
              </Badge>
              <Badge variant="outline" className="text-lg px-4 py-1.5 print:border-gray-300 print:text-black">{flight.country}</Badge>
            </div>
            <p className="text-sm font-medium print:text-black mt-2">حالة الشحنة: {flight.status === 'pending' ? 'قيد الانتظار' : flight.status === 'departed' ? 'غادرت' : 'وصلت'}</p>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 print:gap-4 print:border-b-2 print:border-gray-200 print:pb-8">
          <Card className="shadow-none border bg-slate-50 print:bg-transparent print:border-gray-200 print:shadow-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 print:pb-1">
              <CardTitle className="text-sm font-medium print:text-xs">إجمالي الطلبات</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground print:hidden" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold print:text-lg print:text-black">{totalOrders}</div>
            </CardContent>
          </Card>
          
          <Card className="shadow-none border bg-slate-50 print:bg-transparent print:border-gray-200 print:shadow-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 print:pb-1">
              <CardTitle className="text-sm font-medium print:text-xs">إجمالي الوزن</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground print:hidden" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold print:text-lg print:text-black">{totalWeight.toFixed(2)} KG/CBM</div>
            </CardContent>
          </Card>

          <Card className="shadow-none border bg-slate-50 print:bg-transparent print:border-gray-200 print:shadow-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 print:pb-1">
              <CardTitle className="text-sm font-medium print:text-xs">القيمة الإجمالية</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground print:hidden" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-green-700 print:text-base print:text-black">${totalUSD.toFixed(2)}</div>
              {totalCNY > 0 && <div className="text-sm font-medium text-red-600 print:text-xs print:text-black">¥{totalCNY.toFixed(2)}</div>}
            </CardContent>
          </Card>

          <Card className="shadow-none border bg-slate-50 print:bg-transparent print:border-gray-200 print:shadow-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 print:pb-1">
              <CardTitle className="text-sm font-medium print:text-xs">العملاء المشاركين</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground print:hidden" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold print:text-lg print:text-black">{uniqueUsers.length}</div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Customers Table */}
          <div>
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2 border-b pb-2">
              <Users className="h-5 w-5" /> العملاء (المستلمون)
            </h3>
            <Table className="print:mb-8">
              <TableHeader>
                <TableRow className="print:border-b print:border-gray-300">
                  <TableHead className="text-right print:text-xs print:font-bold">كود العميل</TableHead>
                  <TableHead className="text-right print:text-xs print:font-bold">اسم العميل</TableHead>
                  <TableHead className="text-right print:text-xs print:font-bold">عدد الطلبات</TableHead>
                  <TableHead className="text-right print:text-xs print:font-bold">مجموع الأوزان</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {uniqueUsers.map((user: any) => (
                  <TableRow key={user.id} className="print:border-b print:border-gray-200">
                    <TableCell className="font-medium font-mono text-left print:text-xs print:text-black" dir="ltr">{user.code}</TableCell>
                    <TableCell className="print:text-xs print:text-black">{user.name}</TableCell>
                    <TableCell className="print:text-xs print:text-black">{user.totalOrders}</TableCell>
                    <TableCell className="print:text-xs print:text-black">{user.totalWeight.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
                {uniqueUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">لا يوجد عملاء</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="print:break-before-page"></div>

          {/* Orders Table */}
          <div className="pt-8">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2 border-b pb-2">
              <Package className="h-5 w-5" /> تفاصيل الطلبات
            </h3>
            <Table>
              <TableHeader>
                <TableRow className="print:border-b print:border-gray-300">
                  <TableHead className="text-right print:text-xs print:font-bold">رقم التتبع</TableHead>
                  <TableHead className="text-right print:text-xs print:font-bold">العميل</TableHead>
                  <TableHead className="text-right print:text-xs print:font-bold">اسم الطلب</TableHead>
                  <TableHead className="text-right print:text-xs print:font-bold">الوزن</TableHead>
                  <TableHead className="text-right print:text-xs print:font-bold text-green-700 print:text-black">السعر ($USD)</TableHead>
                  <TableHead className="text-right print:text-xs print:font-bold text-red-600 print:text-black">السعر (¥CNY)</TableHead>
                  <TableHead className="text-right print:text-xs print:font-bold">الملاحظات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {flight.orders?.map((order: any) => (
                  <TableRow key={order.id} className="print:border-b print:border-gray-200">
                    <TableCell className="font-medium font-mono max-w-[150px] truncate print:text-xs print:text-black print:max-w-none print:whitespace-normal" dir="ltr" title={order.trackingNumber}>
                      {order.trackingNumber}
                    </TableCell>
                    <TableCell className="print:text-xs print:text-black">{order.customer?.name || 'غير معروف'}</TableCell>
                    <TableCell className="max-w-[200px] truncate print:text-xs print:text-black print:max-w-none print:whitespace-normal">{order.name || '-'}</TableCell>
                    <TableCell className="print:text-xs print:text-black">{order.weight ? order.weight.toFixed(2) : '-'}</TableCell>
                    <TableCell className="text-green-700 font-medium font-mono print:text-xs print:text-black" dir="ltr">{order.usdPrice ? `$${order.usdPrice}` : '-'}</TableCell>
                    <TableCell className="text-red-600 font-medium font-mono print:text-xs print:text-black" dir="ltr">{order.cnyPrice ? `¥${order.cnyPrice}` : '-'}</TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate print:max-w-none print:text-black print:whitespace-normal">{order.notes || '-'}</TableCell>
                  </TableRow>
                ))}
                {(!flight.orders || flight.orders.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground print:text-xs">لا يوجد طلبات</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

      </div>

    </div>
  );
}
