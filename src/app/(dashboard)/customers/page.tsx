"use client";

import { useState, useEffect, Suspense } from "react";



import { CustomersTable } from "@/features/customers/components/CustomersTable"
import { AddCustomerDialog } from "@/features/customers/components/AddCustomerDialog"
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

import { BulkImportDialog } from "@/features/users/components/BulkImportDialog";

export default function CustomersPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <>
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <h1 className="text-xl md:text-2xl font-bold tracking-tight">إدارة العملاء</h1>
                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                  <div className="flex-1 sm:flex-none"><BulkImportDialog /></div>
                  <div className="flex-1 sm:flex-none"><AddCustomerDialog /></div>
                </div>
              </div>

              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="بحث بالاسم، البريد الإلكتروني، رقم الهاتف، كود الشحن..."
                    className="pr-8"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>

              <Suspense fallback={null}><CustomersTable filters={{ search: debouncedSearch }} /></Suspense>
            </div>
          </div>
        </div>
        </>
  )
}
