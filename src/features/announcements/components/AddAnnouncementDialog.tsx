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
import { Plus } from "lucide-react";
import { useReduxDispatch } from "@/redux/provider";
import { createAnnouncement } from "../slices/announcementSlice";
import { toast } from "sonner";

export function AddAnnouncementDialog() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useReduxDispatch();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !image) {
      toast.error("يرجى ملء جميع الحقول");
      return;
    }

    setIsLoading(true);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("image", image);

    try {
      await dispatch(createAnnouncement(formData)).unwrap();
      toast.success("تم إضافة الإعلان بنجاح");
      setOpen(false);
      setTitle("");
      setImage(null);
    } catch (error: any) {
      toast.error(error?.message || "فشل في إضافة الإعلان");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 ml-2" />
          إضافة إعلان
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>إضافة إعلان جديد</DialogTitle>
            <DialogDescription>
              أضف إعلان جديد للتطبيق. سيظهر للمستخدمين في التطبيق.
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
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="image">الصورة</Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files?.[0] || null)}
                required
              />
              {image && (
                <p className="text-sm text-muted-foreground truncate max-w-[400px]">
                  تم اختيار: {image.name}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "جاري الإضافة..." : "إضافة"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
