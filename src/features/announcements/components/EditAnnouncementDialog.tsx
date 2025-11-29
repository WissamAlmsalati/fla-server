"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil } from "lucide-react";
import { useReduxDispatch } from "@/redux/provider";
import { updateAnnouncement, Announcement } from "../slices/announcementSlice";
import { toast } from "sonner";

interface EditAnnouncementDialogProps {
  announcement: Announcement;
}

export function EditAnnouncementDialog({ announcement }: EditAnnouncementDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(announcement.title);
  const [image, setImage] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useReduxDispatch();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title && !image) {
      toast.error("يرجى تغيير حقل واحد على الأقل");
      return;
    }

    setIsLoading(true);

    const formData = new FormData();
    if (title !== announcement.title) {
      formData.append("title", title);
    }
    if (image) {
      formData.append("image", image);
    }

    try {
      await dispatch(updateAnnouncement({ id: announcement.id, formData })).unwrap();
      toast.success("تم تحديث الإعلان بنجاح");
      setOpen(false);
      setImage(null);
    } catch (error: any) {
      toast.error(error?.message || "فشل في تحديث الإعلان");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>تعديل الإعلان</DialogTitle>
            <DialogDescription>
              قم بتعديل معلومات الإعلان. اترك الحقول فارغة للحفاظ على القيم الحالية.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">العنوان</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="عنوان الإعلان"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="image">الصورة (اختياري)</Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files?.[0] || null)}
              />
              {image && (
                <p className="text-sm text-muted-foreground">
                  تم اختيار: {image.name}
                </p>
              )}
              {!image && (
                <p className="text-sm text-muted-foreground">
                  الصورة الحالية: {announcement.imageUrl}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "جاري التحديث..." : "تحديث"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
