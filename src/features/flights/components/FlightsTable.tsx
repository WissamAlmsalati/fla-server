"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useReduxDispatch, useReduxSelector } from "@/redux/provider";
import { fetchFlights, Flight } from "../slices/flightSlice";
import { EditFlightDialog } from "./EditFlightDialog";
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
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Download, ChevronLeft, ChevronRight, ArrowUpDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { exportToCSV } from "@/lib/exportToCSV";
import { ar } from "date-fns/locale";

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

const exportFlights = (flights: Flight[]) => {
  const columnMappings = {
    flightNumber: "رقم الرحلة",
    country: "الدولة",
    departureDate: "تاريخ الإقلاع",
    arrivalDate: "تاريخ الوصول",
    "_count.orders": "عدد الطلبات",
    type: "نوع الشحن",
    status: "الحالة",
  };
  
  const dataToExport = flights.map(flight => ({
    ...flight,
    country: countryMap[flight.country] || flight.country,
    type: flight.type ? typeMap[flight.type]?.label : "جوي",
    status: statusMap[flight.status]?.label || flight.status,
    departureDate: flight.departureDate ? format(new Date(flight.departureDate), "dd MMMM yyyy", { locale: ar }) : "-",
    arrivalDate: flight.arrivalDate ? format(new Date(flight.arrivalDate), "dd MMMM yyyy", { locale: ar }) : "-",
  }));
  
  exportToCSV(dataToExport, columnMappings, "flights");
};

const ITEMS_PER_PAGE = 20;

export function FlightsTable({ filters }: FlightsTableProps) {
  const router = useRouter();
  const dispatch = useReduxDispatch();
  const { list: flights, status, error } = useReduxSelector((state) => state.flights);
  const { user } = useReduxSelector((state) => state.auth);
  
  const [editingFlight, setEditingFlight] = useState<Flight | null>(null);

  const searchParams = useSearchParams();
  const pathname = usePathname();
  const pageParam = searchParams.get("page");
  const currentPage = pageParam ? parseInt(pageParam, 10) : 1;
  const sortParam = searchParams.get("sort") || "desc"; // Default desc

  useEffect(() => {
    dispatch(fetchFlights(filters?.search as string | undefined));
  }, [dispatch, JSON.stringify(filters), searchParams, pathname, router]);

  if (status === "loading") {
    return <div className="text-center p-4">جاري التحميل...</div>;
  }

  if (status === "failed") {
    return <div className="text-center text-red-500 p-4">خطأ: {error}</div>;
  }

  // Sort flights
  const sortedFlights = [...flights].sort((a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    
    if (dateA !== dateB) {
      return sortParam === "asc" ? dateA - dateB : dateB - dateA;
    }
    
    // If dates are perfectly identical, sort by ID
    return sortParam === "asc" ? a.id - b.id : b.id - a.id;
  });

  // Pagination calculations
  const totalPages = Math.ceil(sortedFlights.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedFlights = sortedFlights.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSortChange = (newSort: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", newSort);
    params.set("page", "1"); // Reset to page 1 on sort change
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const canEdit = user?.role === "ADMIN" || user?.role === "CHINA_WAREHOUSE" || user?.role === "LIBYA_WAREHOUSE";

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowUpDown className="h-4 w-4" />
              {sortParam === "desc" ? "الأحدث أولاً" : "الأقدم أولاً"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleSortChange("desc")}>
              الأحدث أولاً
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSortChange("asc")}>
              الأقدم أولاً
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button onClick={() => exportFlights(sortedFlights)} variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          تصدير CSV
        </Button>
      </div>

      <div className="rounded-md border bg-white overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-right">رقم الرحلة</TableHead>
            <TableHead className="text-right">الدولة</TableHead>
            <TableHead className="text-right">تاريخ الإقلاع</TableHead>
            <TableHead className="text-right">تاريخ الوصول</TableHead>
            <TableHead className="text-center">عدد الطلبات المربوطة</TableHead>
            <TableHead className="text-right">نوع الشحن</TableHead>
            <TableHead className="text-right">الحالة</TableHead>
            <TableHead className="text-right">إجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedFlights.map((flight) => (
            <TableRow 
              key={flight.id} 
              className="hover:bg-muted/50"
            >
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
                <Badge className={statusMap[flight.status]?.color || "bg-gray-100"}>
                  {statusMap[flight.status]?.label || flight.status}
                </Badge>
              </TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                <div className="flex gap-2 justify-end">
                  {canEdit && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingFlight(flight)}
                    >
                      تعديل
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/flights/${flight.id}`)}
                    disabled={(flight._count?.orders || 0) === 0}
                  >
                    عرض التقرير
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {paginatedFlights.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="text-center h-24">
                لا يوجد رحلات مسجلة
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      </div>

      {sortedFlights.length > 0 && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-muted-foreground">
            عرض {startIndex + 1} - {Math.min(endIndex, sortedFlights.length)} من {sortedFlights.length} رحلة
          </div>
        
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronRight className="h-4 w-4" />
                السابق
              </Button>
              
              <div className="flex items-center gap-1">
                {(() => {
                  const pages = [];
                  pages.push(1);

                  if (currentPage > 3) {
                    pages.push('...');
                  }

                  const start = Math.max(2, currentPage - 1);
                  const end = Math.min(totalPages - 1, currentPage + 1);

                  for (let i = start; i <= end; i++) {
                    pages.push(i);
                  }

                  if (currentPage < totalPages - 2) {
                    pages.push('...');
                  }

                  if (totalPages > 1) {
                    pages.push(totalPages);
                  }

                  return pages.map((page, index) => {
                    if (page === '...') {
                      return <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground">...</span>;
                    }

                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(page as number)}
                        className="min-w-[2.5rem]"
                      >
                        {page}
                      </Button>
                    );
                  });
                })()}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                التالي
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      )}
      
      <EditFlightDialog
        flight={editingFlight}
        open={!!editingFlight}
        onOpenChange={(open) => !open && setEditingFlight(null)}
        filters={filters}
      />
    </>
  );
}
