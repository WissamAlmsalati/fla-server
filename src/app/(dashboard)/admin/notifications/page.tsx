"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Bell, Send } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function NotificationsAdminPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    body: "",
    userId: "",
    type: "SYSTEM",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications?limit=50&admin=true");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error("Failed to load notifications", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          body: formData.body,
          type: formData.type,
          userId: formData.userId ? formData.userId : null,
        }),
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      toast.success("تم إرسال الإشعار بنجاح");
      setIsDialogOpen(false);
      setFormData({ title: "", body: "", userId: "", type: "SYSTEM" });
      fetchNotifications();
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ أثناء الإرسال");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Bell className="h-8 w-8 text-primary" />
          إدارة الإشعارات
        </h1>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen} modal={false}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Send className="h-4 w-4" />
              إرسال إشعار جديد
            </Button>
          </DialogTrigger>
          <DialogContent dir="rtl">
            <DialogHeader>
              <DialogTitle>إرسال إشعار</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>عنوان الإشعار</Label>
                <Input
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="مثال: خصم جديد بمناسبة العيد"
                />
              </div>
              <div className="space-y-2">
                <Label>نص الإشعار</Label>
                <Textarea
                  required
                  value={formData.body}
                  onChange={(e) =>
                    setFormData({ ...formData, body: e.target.value })
                  }
                  placeholder="تفاصيل الإشعار..."
                  rows={4}
                />
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "جاري الإرسال..." : "إرسال للجميع الآن"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>سجل الإشعارات المرسلة (آخر 50)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">العنوان</TableHead>
                  <TableHead className="text-right">النص</TableHead>
                  <TableHead className="text-right">النوع</TableHead>
                  <TableHead className="text-right">المستلِم</TableHead>
                  <TableHead className="text-right">التاريخ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center h-24">
                      جاري التحميل...
                    </TableCell>
                  </TableRow>
                ) : notifications.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                      لا توجد إشعارات سابقة
                    </TableCell>
                  </TableRow>
                ) : (
                  notifications.map((notification) => (
                    <TableRow key={notification.id}>
                      <TableCell className="font-medium">
                        {notification.title}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {notification.body}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{notification.type}</Badge>
                      </TableCell>
                      <TableCell>
                        {notification.userId ? (
                          <Badge variant="secondary">عضو #{notification.userId}</Badge>
                        ) : (
                          <Badge variant="default" className="bg-green-600">الجميع</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(notification.createdAt), "dd MMM yyyy, HH:mm", {
                          locale: ar,
                        })}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
