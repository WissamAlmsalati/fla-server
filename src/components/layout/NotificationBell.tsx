"use client";

import { useState, useEffect } from "react";
import { Bell, Check, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Notification {
  id: number;
  title: string;
  body: string;
  read: boolean;
  type: string;
  createdAt: string;
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (e) {
      console.error("Failed to fetch notifications", e);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll every minute
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = async (id: number) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: "PUT" });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (e) {
      console.error("Failed to mark as read", e);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch("/api/notifications/read-all", { method: "PUT" });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      toast.success("تم تحديد الكل كمقروء");
    } catch (e) {
      console.error("Failed to mark all as read", e);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    setIsOpen(false);
    if (notification.type === "ORDER_UPDATE") {
      router.push("/orders");
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen} modal={false}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              {unreadCount > 99 ? "+99" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end" dir="rtl">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <span className="font-semibold">الإشعارات</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-auto p-0 text-primary hover:bg-transparent"
              onClick={markAllAsRead}
            >
              تحديد الكل كمقروء <Check className="ml-1 h-3 w-3" />
            </Button>
          )}
        </div>
        <ScrollArea className="h-[350px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center text-muted-foreground">
              <Bell className="h-8 w-8 mb-2 opacity-20" />
              <p className="text-sm">لا توجد إشعارات حالياً</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`flex flex-col gap-1 p-4 cursor-pointer hover:bg-muted/50 transition-colors border-b last:border-0 ${
                    !notification.read ? "bg-primary/5" : ""
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-medium text-sm">
                      {notification.title}
                    </span>
                    {!notification.read && (
                      <span className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {notification.body}
                  </p>
                  <span className="text-[10px] text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(notification.createdAt), {
                      addSuffix: true,
                      locale: ar,
                    })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
