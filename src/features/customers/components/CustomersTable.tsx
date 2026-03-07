"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useReduxDispatch, useReduxSelector } from "@/redux/provider";
import { fetchCustomers, deleteCustomer } from "../slices/customerSlice";
import { EditUserDialog } from "../../users/components/EditUserDialog";
import { User } from "../../users/slices/userSlice";
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
import { Download, Trash2, ChevronLeft, ChevronRight, ArrowUpDown } from "lucide-react";
import { exportToCSV } from "@/lib/exportToCSV";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const exportCustomers = (customers: any[]) => {
  const columnMappings = {
    "user.name": "الاسم",
    "user.email": "البريد الإلكتروني",
    "user.mobile": "رقم الهاتف",
    code: "كود الصين",
    dubaiCode: "كود دبي",
    usaCode: "كود أمريكا",
    turkeyCode: "كود تركيا"
  };
  
  exportToCSV(customers, columnMappings, "customers");
};

const handleDeleteCustomer = async (customerId: number, dispatch: any) => {
  if (window.confirm("هل أنت متأكد من حذف هذا العميل؟")) {
    try {
      await dispatch(deleteCustomer(customerId)).unwrap();
      toast.success("تم حذف العميل بنجاح");
    } catch (error: any) {
      toast.error(error.message || "فشل في حذف العميل");
    }
  }
};

interface CustomersTableProps {
  filters?: Record<string, string | number>;
}

export function CustomersTable({ filters }: CustomersTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const dispatch = useReduxDispatch();
  const { list: customers, status, error } = useReduxSelector((state) => state.customers);

  const pageParam = searchParams.get("page");
  const currentPage = pageParam ? parseInt(pageParam, 10) : 1;
  const sortParam = searchParams.get("sort") || "desc"; // Default desc
  
  const prevFiltersRef = useRef(filters);
  const ITEMS_PER_PAGE = 20;

  useEffect(() => {
    dispatch(fetchCustomers(filters));
    
    // Only reset to page 1 if filters actually change
    if (JSON.stringify(prevFiltersRef.current) !== JSON.stringify(filters)) {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("page");
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      prevFiltersRef.current = filters;
    }
  }, [dispatch, JSON.stringify(filters), searchParams, pathname, router]);

  if (status === "loading") {
    return <div className="text-center p-4">جاري التحميل...</div>;
  }

  if (status === "failed") {
    return <div className="text-center text-red-500 p-4">خطأ: {error}</div>;
  }

  // Sort customers
  const sortedCustomers = [...customers].sort((a, b) => {
    const dateA = a.user?.createdAt ? new Date(a.user.createdAt).getTime() : 0;
    const dateB = b.user?.createdAt ? new Date(b.user.createdAt).getTime() : 0;
    
    if (dateA !== dateB) {
      return sortParam === "asc" ? dateA - dateB : dateB - dateA;
    }
    
    // If dates are exactly the same (common in seeded data), sort by ID
    return sortParam === "asc" ? a.id - b.id : b.id - a.id;
  });

  const totalPages = Math.ceil(sortedCustomers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedCustomers = sortedCustomers.slice(startIndex, endIndex);

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

  return (
    <>
      <div className="mb-4 flex flex-col sm:flex-row justify-between items-center gap-4">
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

        <Button onClick={() => exportCustomers(sortedCustomers)} variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          تصدير CSV
        </Button>
      </div>
      {/* ─── Mobile Cards (< md) ─── */}
      <div className="md:hidden flex flex-col gap-3">
        {paginatedCustomers.map((customer) => {
          if (!customer.user) return null;
          return (
            <div
              key={customer.id}
              className="rounded-xl border bg-card p-4 shadow-sm flex flex-col gap-3 cursor-pointer active:scale-[0.98] transition-transform"
              onClick={() => router.push(`/users/${customer.user!.id}`)}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                  <span className="font-semibold truncate text-base">{customer.user.name}</span>
                  <span className="text-sm text-muted-foreground truncate">{customer.user.email}</span>
                </div>
              </div>
              
              <div className="text-sm">
                <p className="text-muted-foreground text-xs">رقم الهاتف</p>
                <p className="font-medium text-left" dir="ltr">{customer.user.mobile || "—"}</p>
              </div>

              <div className="flex justify-end gap-2 mt-2" onClick={(e) => e.stopPropagation()}>
                <EditUserDialog user={customer.user as unknown as User} />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteCustomer(customer.id, dispatch)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          );
        })}
        {customers.length === 0 && (
          <p className="text-center text-muted-foreground py-10">لا يوجد عملاء</p>
        )}
      </div>

      {/* ─── Desktop Table (≥ md) ─── */}
      <div className="hidden md:block rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">الاسم</TableHead>
              <TableHead className="text-right">البريد الإلكتروني</TableHead>
              <TableHead className="text-right">رقم الهاتف</TableHead>
              <TableHead className="text-right">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedCustomers.map((customer) => {
              if (!customer.user) return null;
              return (
                <TableRow
                  key={customer.id}
                  onClick={() => router.push(`/users/${customer.user!.id}`)}
                  className="cursor-pointer hover:bg-muted/50"
                >
                  <TableCell className="font-medium">
                    {customer.user.name}
                  </TableCell>
                  <TableCell>{customer.user.email}</TableCell>
                  <TableCell dir="ltr" className="text-right">{customer.user.mobile || "-"}</TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex gap-2 justify-end">
                      <EditUserDialog user={customer.user as unknown as User} />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteCustomer(customer.id, dispatch)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {customers.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center h-24">
                  لا يوجد عملاء
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {sortedCustomers.length > 0 && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-muted-foreground">
            عرض {startIndex + 1} - {Math.min(endIndex, sortedCustomers.length)} من {sortedCustomers.length} عميل
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
    </>
  );
}
