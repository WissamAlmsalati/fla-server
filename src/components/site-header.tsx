import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import Image from "next/image"

export function SiteHeader() {
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <div className="flex items-center gap-2">
          <Image
            src="/photos/logo-without-bg.png"
            alt="Logo"
            width={32}
            height={32}
            className="object-contain"
          />
          <h1 className="text-base font-medium">لوحة التحكم</h1>
        </div>
        <div className="ml-auto flex items-center gap-2">
        </div>
      </div>
    </header>
  )
}
