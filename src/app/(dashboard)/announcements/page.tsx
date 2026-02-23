"use client";




import { AddAnnouncementDialog } from "@/features/announcements/components/AddAnnouncementDialog";
import { AnnouncementsTable } from "@/features/announcements/components/AnnouncementsTable";

export default function AnnouncementsPage() {
  return (
    <>
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">إدارة الإعلانات</h1>
                <AddAnnouncementDialog />
              </div>

              <AnnouncementsTable />
            </div>
          </div>
        </div>
        </>
  );
}
