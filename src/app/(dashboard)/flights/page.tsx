"use client";

import { useState, useEffect, Suspense } from "react";



import { FlightsTable } from "@/features/flights/components/FlightsTable";
import { AddFlightDialog } from "@/features/flights/components/AddFlightDialog";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useReduxSelector } from "@/redux/provider";

export default function FlightsPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const { user } = useReduxSelector((state) => state.auth);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Only Admin and Warehouse roles can manage flights (assumed config from API)
  const canAdd = user?.role === "ADMIN" || user?.role === "CHINA_WAREHOUSE" || user?.role === "LIBYA_WAREHOUSE";

  return (
    <>
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">إدارة الرحلات</h1>
                {canAdd && <AddFlightDialog />}
              </div>

              <div className="flex gap-2">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="بحث برقم الرحلة..."
                    className="pr-8"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>

              <Suspense fallback={null}><FlightsTable filters={{ search: debouncedSearch }} /></Suspense>
            </div>
          </div>
        </div>
        </>
  );
}
