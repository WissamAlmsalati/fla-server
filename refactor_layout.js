const fs = require('fs');
const path = require('path');

const srcAppPath = path.join(__dirname, 'src', 'app');
const dashboardGroupId = '(dashboard)';
const dashboardGroupPath = path.join(srcAppPath, dashboardGroupId);

const foldersToMove = [
  'account-requests',
  'announcements',
  'customers',
  'dashboard',
  'flights',
  'orders',
  'shipping',
  'users',
  'warehouses'
];

if (!fs.existsSync(dashboardGroupPath)) {
  fs.mkdirSync(dashboardGroupPath);
}

// 1. Create layout.tsx
const layoutContent = `import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

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
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
`;
fs.writeFileSync(path.join(dashboardGroupPath, 'layout.tsx'), layoutContent);

// Function to clean page.tsx
function cleanPage(pagePath) {
  if (!fs.existsSync(pagePath)) return;
  let content = fs.readFileSync(pagePath, 'utf8');

  // Remove SidebarProvider imports
  content = content.replace(/import\s*\{\s*SidebarInset,\s*SidebarProvider,?\s*\}\s*from\s*["']@\/components\/ui\/sidebar["'];?/g, '');
  content = content.replace(/import\s*\{\s*AppSidebar\s*\}\s*from\s*["']@\/components\/app-sidebar["'];?/g, '');
  content = content.replace(/import\s*\{\s*SiteHeader\s*\}\s*from\s*["']@\/components\/site-header["'];?/g, '');

  let returnMatch = content.match(/return\s*\(\s*<SidebarProvider[^>]*>/);
  if (!returnMatch) return;
  
  // Replace opening structure
  const openRegex = /return\s*\(\s*<SidebarProvider[^>]*>\s*<AppSidebar[^>]*>\s*<SidebarInset>\s*<SiteHeader\s*\/>/;
  content = content.replace(openRegex, 'return (\n    <>');

  // Replace closing structure
  const closeRegex = /<\/SidebarInset>\s*<\/SidebarProvider>\s*\)/;
  content = content.replace(closeRegex, '  </>\n  )');

  fs.writeFileSync(pagePath, content);
}

// Move folders and clean
foldersToMove.forEach(folder => {
  const fromPath = path.join(srcAppPath, folder);
  const toPath = path.join(dashboardGroupPath, folder);
  
  if (fs.existsSync(fromPath)) {
    fs.renameSync(fromPath, toPath);
    console.log(`Moved ${folder} to (dashboard)`);
    
    // Clean top-level page.tsx
    cleanPage(path.join(toPath, 'page.tsx'));
    
    // Check if there are nested [id]/page.tsx
    const subDirs = fs.readdirSync(toPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
      
    subDirs.forEach(sub => {
      cleanPage(path.join(toPath, sub, 'page.tsx'));
    });
  }
});

console.log("Refactoring complete");
