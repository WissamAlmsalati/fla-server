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
      url: "/orders",
      icon: LayoutDashboard,
    },
    {
      title: "الطلبات",
      url: "/orders",
      icon: Package,
    },
    {
      title: "الشحنات",
      url: "/shipments",
      icon: Truck,
    },
  ],
  management: [
    {
      name: "المخازن",
      url: "/warehouses",
      icon: Warehouse,
    },
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
  ],
  navSecondary: [
    {
      title: "الإعدادات",
      url: "#",
      icon: Settings,
    },
    {
      title: "المساعدة",
      url: "#",
      icon: LifeBuoy,
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
        <NavDocuments items={data.management} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
