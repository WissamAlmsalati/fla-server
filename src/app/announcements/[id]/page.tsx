"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { useReduxDispatch, useReduxSelector } from "@/redux/provider";
import { fetchAnnouncements, deleteAnnouncement, toggleAnnouncementStatus } from "@/features/announcements/slices/announcementSlice";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import Image from "next/image";
import { EditAnnouncementDialog } from "@/features/announcements/components/EditAnnouncementDialog";
import { toast } from "sonner";

export default function AnnouncementDetailPage() {
  const router = useRouter();
  const params = useParams();
  const dispatch = useReduxDispatch();
  const { list: announcements, status } = useReduxSelector((state) => state.announcements);
  
  useEffect(() => {
    // Fetch announcements on mount
    dispatch(fetchAnnouncements());
  }, [dispatch]);

  const announcement = announcements.find((a) => a.id === parseInt(params.id as string));

  const handleDelete = async () => {
    if (!announcement) return;
    
    if (confirm("هل أنت متأكد من حذف هذا الإعلان؟")) {
      try {
        await dispatch(deleteAnnouncement(announcement.id)).unwrap();
        toast.success("تم حذف الإعلان بنجاح");
        router.push("/announcements");
      } catch (error: any) {
        toast.error(error?.message || "فشل في حذف الإعلان");
      }
    }
  };

  const handleToggleStatus = async () => {
    if (!announcement) return;
    
    try {
      await dispatch(toggleAnnouncementStatus(announcement.id)).unwrap();
      toast.success("تم تحديث حالة الإعلان بنجاح");
    } catch (error: any) {
      toast.error(error?.message || "فشل في تحديث حالة الإعلان");
    }
  };

  
  // Show loading only when actively fetching and no data yet
  if (status === "loading" && announcements.length === 0) {
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
          <div className="flex flex-1 flex-col items-center justify-center">
            <p className="text-muted-foreground">جاري التحميل...</p>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  // Show not found only after we've successfully loaded data
  if (status === "succeeded" && !announcement) {
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
          <div className="flex flex-1 flex-col items-center justify-center">
            <p className="text-muted-foreground">الإعلان غير موجود</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => router.push("/announcements")}
            >
              العودة إلى الإعلانات
            </Button>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  // If we don't have the announcement yet but we're loading, wait
  if (!announcement) {
    return null;
  }

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
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => router.back()}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <h1 className="text-2xl font-bold tracking-tight">تفاصيل الإعلان</h1>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {announcement.isActive ? "تعطيل" : "تفعيل"}
                    </span>
                    <Switch
                      checked={announcement.isActive}
                      onCheckedChange={handleToggleStatus}
                    />
                  </div>
                  <EditAnnouncementDialog announcement={announcement} />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDelete}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 ml-2" />
                    حذف
                  </Button>
                </div>
              </div>

              <div className="rounded-lg border p-6 space-y-6">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">العنوان</label>
                  <p className="text-lg mt-1">{announcement.title}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">الحالة</label>
                  <div className="mt-1">
                    <Badge variant={announcement.isActive ? "default" : "secondary"}>
                      {announcement.isActive ? "نشط" : "معطل"}
                    </Badge>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">الصورة</label>
                  <div className="relative w-full max-w-2xl h-96 mt-2 rounded-lg overflow-hidden border">
                    <Image
                      src={announcement.imageUrl}
                      alt={announcement.title}
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">تاريخ الإنشاء</label>
                    <p className="mt-1">
                      {new Date(announcement.createdAt).toLocaleDateString("ar-EG", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">آخر تحديث</label>
                    <p className="mt-1">
                      {new Date(announcement.updatedAt).toLocaleDateString("ar-EG", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">رابط الصورة</label>
                  <p className="text-sm mt-1 font-mono bg-muted p-2 rounded">
                    {announcement.imageUrl}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
