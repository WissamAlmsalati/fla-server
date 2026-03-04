"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, FileUp, UploadCloud, Users, CheckCircle2, AlertCircle } from "lucide-react";
import * as XLSX from "xlsx";
import { useRouter } from "next/navigation";

interface ImportedUser {
  name: string;
  mobile: string;
  email?: string;
  location?: string;
  error?: string;
}

export function BulkImportDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [parsedUsers, setParsedUsers] = useState<ImportedUser[]>([]);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setFile(selected);
    parseFile(selected);
  };

  const parseFile = (file: File) => {
    setLoading(true);

    const isCsv = file.name.toLowerCase().endsWith(".csv");
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        let json: any[] = [];
        const data = e.target?.result;

        if (isCsv) {
          // Parse CSV manually or let XLSX parse the UTF-8 string
          const workbook = XLSX.read(data, { type: "string" });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          json = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
        } else {
          // Parse Excel binary files
          const workbook = XLSX.read(new Uint8Array(data as ArrayBuffer), { type: "array" });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          json = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
        }

        const users: ImportedUser[] = json.map((row, index) => {
          // Normalize keys to lowercase and trim spaces for easier matching
          const normalizedRow: Record<string, any> = {};
          Object.keys(row).forEach((key) => {
            normalizedRow[key.trim().toLowerCase()] = row[key];
          });

          // Match Name
          const nameMatch = normalizedRow["اسم العميل"] || normalizedRow["الاسم"] || normalizedRow["name"] || Object.values(row)[0] || "";
          const name = nameMatch.toString();
          
          // Match Mobile (check standard keys, then fallback to looking for 'phone', 'mobile', or 'password' in any key)
          let mobileMatch = normalizedRow["رقم الهاتف"] || normalizedRow["الموبايل"] || normalizedRow["الهاتف"] || normalizedRow["mobile"] || normalizedRow["phone"] || normalizedRow["phone/password"] || "";
          
          // If not found in standard keys, search through all keys for keywords
          if (!mobileMatch) {
            const possibleMobileKey = Object.keys(normalizedRow).find(
              k => k.includes("phone") || k.includes("mobile") || k.includes("هاتف") || k.includes("موبايل") || k.includes("password")
            );
            if (possibleMobileKey) mobileMatch = normalizedRow[possibleMobileKey];
          }

          let mobile = mobileMatch.toString();
          // Basic clean up of phone numbers (remove spaces, dashes)
          mobile = mobile.replace(/[^0-9+]/g, '');

          // Match Email
          const emailMatch = normalizedRow["البريد الإلكتروني"] || normalizedRow["الايميل"] || normalizedRow["email"] || "";
          const email = emailMatch.toString();

          // Match Location
          const locationMatch = normalizedRow["المنطقة"] || normalizedRow["المدينة"] || normalizedRow["المكان"] || normalizedRow["location"] || normalizedRow["city"] || "";
          const location = locationMatch.toString();

          const user: ImportedUser = { name: name.trim(), mobile: mobile.trim() };
          if (email) user.email = email.trim();
          if (location) user.location = location.trim();

          // Basic validation
          if (!user.name || !user.mobile) {
            user.error = "يجب توفر الاسم ورقم الهاتف";
          }

          return user;
        });

        setParsedUsers(users);
      } catch (err) {
        toast.error("حدث خطأ أثناء قراءة الملف. تأكد من أنه ملف إكسل أو CSV صحيح.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (isCsv) {
      reader.readAsText(file, "UTF-8");
    } else {
      reader.readAsArrayBuffer(file);
    }
  };

  const handleImport = async () => {
    const validUsers = parsedUsers.filter((u) => !u.error);
    
    if (validUsers.length === 0) {
      toast.error("لا يوجد مستخدمين صالحين للاستيراد");
      return;
    }

    setImporting(true);
    try {
      const response = await fetch("/api/users/bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(validUsers.map(u => ({ name: u.name, mobile: u.mobile, email: u.email, location: u.location }))),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to import");
      }

      toast.success(data.message || `تم استيراد ${data.count} مستخدم بنجاح`);
      setOpen(false);
      
      // Reset state
      setFile(null);
      setParsedUsers([]);
      
      // Refresh the page data
      router.refresh();
      // Add a slight delay then reload to ensure table sees new data
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (err: any) {
      toast.error(err.message || "حدث خطأ أثناء الاستيراد");
    } finally {
      setImporting(false);
    }
  };

  const resetUpload = () => {
    setFile(null);
    setParsedUsers([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const validCount = parsedUsers.filter(u => !u.error).length;
  const invalidCount = parsedUsers.filter(u => u.error).length;

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      if (!newOpen && importing) return; // Prevent closing while importing
      setOpen(newOpen);
      if (!newOpen) resetUpload();
    }}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <FileUp className="h-4 w-4" />
          استيراد من Excel
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] border-primary/20" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <FileUp className="h-5 w-5 text-primary" />
            استيراد المستخدمين
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            قم برفع ملف Excel (.xlsx, .xls) أو CSV يحتوي على عمودي "الاسم" و "رقم الهاتف". سيتم استخدام رقم الهاتف ككلمة مرور افتراضية.
          </p>
        </DialogHeader>

        <div className="py-2">
          {!file ? (
            <div 
              className="border-2 border-dashed border-primary/30 rounded-xl p-10 flex flex-col items-center justify-center gap-4 bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="p-4 bg-background rounded-full shadow-sm border">
                <UploadCloud className="h-8 w-8 text-primary" />
              </div>
              <div className="text-center space-y-1">
                <h3 className="font-semibold text-lg text-foreground">انقر هنا لاختيار ملف</h3>
                <p className="text-sm text-muted-foreground">صيغ مدعومة: .xlsx, .xls, .csv</p>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept=".xlsx, .xls, .csv" 
                onChange={handleFileChange}
              />
            </div>
          ) : (
            <div className="space-y-6">
              {/* File Info */}
              <div className="flex items-center justify-between p-3 bg-muted/40 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded text-primary">
                    <FileUp className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={resetUpload} disabled={importing}>
                  تغيير الملف
                </Button>
              </div>

              {/* Parsing Results */}
              {loading ? (
                <div className="flex flex-col items-center justify-center py-8 gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">جاري قراءة الملف...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-green-50/50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                      <CheckCircle2 className="h-8 w-8 text-green-500" />
                      <div>
                        <p className="text-2xl font-bold text-green-700">{validCount}</p>
                        <p className="text-xs font-medium text-green-600">صفوف صحيحة</p>
                      </div>
                    </div>
                    <div className="bg-red-50/50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                      <AlertCircle className="h-8 w-8 text-red-500" />
                      <div>
                        <p className="text-2xl font-bold text-red-700">{invalidCount}</p>
                        <p className="text-xs font-medium text-red-600">صفوف غير صالحة</p>
                      </div>
                    </div>
                  </div>

                  {/* Sample Data Table */}
                  {parsedUsers.length > 0 && (
                     <div className="border rounded-lg overflow-hidden">
                       <div className="bg-muted px-4 py-2 text-xs font-semibold text-muted-foreground border-b flex items-center justify-between">
                         <span>معاينة للبيانات (أول 5 صفوف)</span>
                         <span className="flex items-center gap-1"><Users className="h-3 w-3" /> إجمالي: {parsedUsers.length}</span>
                       </div>
                       <div className="max-h-[160px] overflow-y-auto">
                         <table className="w-full text-sm">
                           <thead className="bg-background sticky top-0 border-b">
                             <tr>
                               <th className="text-right py-2 px-4 font-medium text-muted-foreground">الاسم</th>
                               <th className="text-right py-2 px-4 font-medium text-muted-foreground">رقم الهاتف</th>
                               <th className="text-center py-2 px-4 font-medium text-muted-foreground">الحالة</th>
                             </tr>
                           </thead>
                           <tbody className="divide-y">
                             {parsedUsers.slice(0, 5).map((u, i) => (
                               <tr key={i} className={u.error ? "bg-red-50/30" : ""}>
                                 <td className="py-2 px-4">{u.name || <span className="text-red-400 text-xs">فارغ</span>}</td>
                                 <td className="py-2 px-4 font-mono text-xs" dir="ltr">{u.mobile || <span className="text-red-400 text-xs text-right">فارغ</span>}</td>
                                 <td className="py-2 px-4 text-center">
                                   {u.error ? (
                                     <span className="inline-block px-2 py-0.5 rounded bg-red-100 text-red-700 text-[10px] font-medium" title={u.error}>خطأ</span>
                                   ) : (
                                     <span className="inline-block px-2 py-0.5 rounded bg-green-100 text-green-700 text-[10px] font-medium">سليم</span>
                                   )}
                                 </td>
                               </tr>
                             ))}
                           </tbody>
                         </table>
                       </div>
                     </div>
                  )}

                  {invalidCount > 0 && (
                    <div className="text-xs text-red-600 bg-red-50 p-2 rounded border border-red-100 flex gap-2">
                       <AlertCircle className="h-4 w-4 shrink-0" />
                       <p>سيتم تجاهل الصفوف غير الصالحة (التي تفتقر إلى الاسم أو رقم الهاتف) أثناء الاستيراد.</p>
                    </div>
                  )}

                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t mt-2">
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={importing}>
            إلغاء
          </Button>
          <Button 
            onClick={handleImport} 
            disabled={!file || validCount === 0 || importing || loading}
            className="gap-2 min-w-[120px]"
          >
            {importing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                جاري الاستيراد...
              </>
            ) : (
              <>
                استيراد {validCount} مستخدم
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
