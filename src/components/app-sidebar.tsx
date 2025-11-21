"use client"

import * as React from "react"
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
  Command
} from "lucide-react"

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
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "لوحة التحكم",
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
      name: "مخزن الصين",
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

}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <a href="#">
                <Command className="size-5!" />
                <span className="text-base font-semibold">Alwala Shipping</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments items={data.shipmentManagement} title="إدارة الشحنات" />
        <NavDocuments items={data.userManagement} title="إدارة المستخدمين" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
