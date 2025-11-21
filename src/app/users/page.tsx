"use client";

import { useState, useEffect } from "react";
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { UsersTable } from "@/features/users/components/UsersTable"
import { AddUserDialog } from "@/features/users/components/AddUserDialog"
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const filters: Record<string, string | number> = {};
  if (debouncedSearch) filters.search = debouncedSearch;
  if (roleFilter && roleFilter !== "all") filters.role = roleFilter;

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">إدارة المستخدمين</h1>
                <AddUserDialog />
              </div>

              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="بحث بالاسم، البريد الإلكتروني، رقم الهاتف..."
                    className="pr-8"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="جميع الأدوار" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الأدوار</SelectItem>
                    <SelectItem value="ADMIN">مدير النظام</SelectItem>
                    <SelectItem value="PURCHASE_OFFICER">مسؤول مشتريات</SelectItem>
                    <SelectItem value="CHINA_WAREHOUSE">مخزن الصين</SelectItem>
                    <SelectItem value="LIBYA_WAREHOUSE">مخزن ليبيا</SelectItem>
                    <SelectItem value="CUSTOMER">عميل</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <UsersTable filters={filters} />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
