"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useReduxDispatch, useReduxSelector } from "@/redux/provider";
import { fetchAnnouncements } from "../slices/announcementSlice";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import Image from "next/image";

export function AnnouncementsTable() {
  const router = useRouter();
  const dispatch = useReduxDispatch();
  const { list: announcements, status, error } = useReduxSelector((state) => state.announcements);

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchAnnouncements());
    }
  }, [dispatch, status]);



  if (status === "loading") {
    return <div className="text-center p-4">جاري التحميل...</div>;
  }

  if (status === "failed") {
    return <div className="text-center text-red-500 p-4">خطأ: {error}</div>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-right">الصورة</TableHead>
            <TableHead className="text-right">العنوان</TableHead>
            <TableHead className="text-right">الحالة</TableHead>
            <TableHead className="text-right">تاريخ الإنشاء</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {announcements.map((announcement) => (
            <TableRow
              key={announcement.id}
              onClick={() => router.push(`/announcements/${announcement.id}`)}
              className="cursor-pointer hover:bg-muted/50"
            >
              <TableCell>
                <div className="relative w-20 h-20">
                  <Image
                    src={announcement.imageUrl}
                    alt={announcement.title}
                    fill
                    className="object-cover rounded"
                  />
                </div>
              </TableCell>
              <TableCell className="font-medium">{announcement.title}</TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                <Badge variant={announcement.isActive ? "default" : "secondary"}>
                  {announcement.isActive ? "نشط" : "معطل"}
                </Badge>
              </TableCell>
              <TableCell>
                {new Date(announcement.createdAt).toISOString().split('T')[0]}
              </TableCell>
            </TableRow>
          ))}
          {announcements.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-center h-24">
                لا يوجد إعلانات
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
