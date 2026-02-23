const fs = require('fs');
const path = require('path');

const dashboardPath = path.join(__dirname, 'src', 'app', '(dashboard)');

function walkAndClean(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walkAndClean(fullPath);
    } else if (file === 'page.tsx') {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Remove any </SidebarInset> and </SidebarProvider> remaining
      content = content.replace(/<\/SidebarInset>/g, '');
      content = content.replace(/<\/SidebarProvider>/g, '');
      
      fs.writeFileSync(fullPath, content);
      console.log(`Cleaned closing tags in ${fullPath}`);
    }
  }
}

walkAndClean(dashboardPath);
console.log('Done');
