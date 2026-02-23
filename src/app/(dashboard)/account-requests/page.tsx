"use client";




import { AccountRequestsTable } from "@/features/account-requests/components/AccountRequestsTable";

export default function AccountRequestsPage() {
  return (
    <>
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">
                    طلبات إنشاء حساب
                  </h1>
                  <p className="text-sm text-muted-foreground mt-1">
                    إدارة طلبات إنشاء الحسابات من التطبيق
                  </p>
                </div>
              </div>

              <AccountRequestsTable />
            </div>
          </div>
        </div>
        </>
  );
}
