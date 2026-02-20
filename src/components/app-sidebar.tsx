"use client"

import {
  LayoutDashboard,
  Package,
  Truck,
  Warehouse,
  Users,
  Settings,
  MessageSquare,
  LifeBuoy,
  Search,
  Command,
  ChevronRight,
  ChevronLeft
} from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation";
import { useReduxDispatch, useReduxSelector } from "@/redux/provider";

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "Admin User",
    email: "admin@example.com",
    avatar: "",
  },
  navMain: [
    {
      title: "نظرة عامة",
      url: "/dashboard",
      icon: LayoutDashboard,
    },


  ],
  shipmentManagement: [
    {
      name: "الطلبات",
      url: "/orders",
      icon: Package,
    },
    {
      name: "تم الشراء",
      url: "/warehouses/purchased",
      icon: Package,
    },
    {
      name: "المخزن الخارجي",
      url: "/warehouses/china",
      icon: Warehouse,
    },
    {
      name: "جاري الشحن لليبيا",
      url: "/warehouses/shipping",
      icon: Truck,
    },
    {
      name: "مخزن ليبيا",
      url: "/warehouses/libya",
      icon: Warehouse,
    },
    {
      name: "جاهز للاستلام",
      url: "/warehouses/ready",
      icon: Package,
    },
    {
      name: "تم التسليم",
      url: "/warehouses/delivered",
      icon: Package,
    },
  ],
  userManagement: [
    {
      name: "العملاء",
      url: "/customers",
      icon: Users,
    },
    {
      name: "المستخدمين",
      url: "/users",
      icon: Settings,
    },
    {
      name: "إدارة الشحن",
      url: "/shipping",
      icon: Truck,
    },
  ],
  mobileManagement: [
    {
      name: "طلبات إنشاء حساب",
      url: "/account-requests",
      icon: Users,
    },
    {
      name: "الإعلانات",
      url: "/announcements",
      icon: MessageSquare,
    },
  ],

}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useReduxSelector((state) => state.auth);
  const role = user?.role || "CUSTOMER";

  // Filter navigation items based on role
  const filteredNavMain = data.navMain.filter(() => {
    if (role === "ADMIN") return true;
    return false; // Only admin sees the main dashboard overview for now
  });

  const filteredShipmentManagement = data.shipmentManagement.filter((item) => {
    if (role === "ADMIN") return true;
    if (role === "PURCHASE_OFFICER") return item.url === "/orders";
    if (role === "CHINA_WAREHOUSE") return item.url === "/orders" || item.url === "/warehouses/china";
    if (role === "LIBYA_WAREHOUSE") return item.url === "/orders" || item.url === "/warehouses/libya" || item.url === "/warehouses/ready";
    return false;
  });

  const filteredUserManagement = data.userManagement.filter(() => {
    if (role === "ADMIN") return true;
    return false;
  });

  const filteredMobileManagement = data.mobileManagement.filter(() => {
    if (role === "ADMIN") return true;
    return false;
  });

  const userData = {
    name: user?.name || "User",
    email: user?.email || "",
    avatar: "",
  };

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <a href="#" className="flex items-center gap-2">
                <Image
                  src="/photos/logo-without-bg.png"
                  alt="Logo"
                  width={24}
                  height={24}
                  className="object-contain"
                />
                <span className="text-base font-semibold">شركة الولاء الدائم</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {filteredNavMain.length > 0 && <NavMain items={filteredNavMain} />}
        {filteredShipmentManagement.length > 0 && (
          <NavDocuments items={filteredShipmentManagement} title="إدارة الشحنات" />
        )}
        {filteredUserManagement.length > 0 && (
          <NavDocuments items={filteredUserManagement} title="إدارة المستخدمين" />
        )}
        {filteredMobileManagement.length > 0 && (
          <NavDocuments items={filteredMobileManagement} title="إدارة التطبيق" />
        )}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  )
}
