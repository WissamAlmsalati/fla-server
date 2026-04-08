import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { AuthHydrator } from "@/components/auth-hydrator"
import { PageLoadingOverlay } from "@/components/page-loading-overlay"
import { FirebaseNotifications } from "@/components/firebase-notifications"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AuthHydrator />
      <FirebaseNotifications />
      <AppSidebar variant="inset" />
      <SidebarInset className="relative">
        <PageLoadingOverlay />
        <SiteHeader />
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
