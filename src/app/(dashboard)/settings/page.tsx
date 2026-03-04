"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Shield, Save, Loader2, Plus, Trash2, History,
  ChevronDown, ChevronUp, Clock, User, FileText,
  AlertCircle, CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface Clause {
  title: string;
  body: string;
}

interface ChangeLog {
  id: number;
  changedByName: string;
  note: string | null;
  diffSummary: string | null;
  snapshot: string | null;
  createdAt: string;
}

function LogEntry({
  log,
  snapshotClauses,
}: {
  log: ChangeLog;
  snapshotClauses: { title: string; body: string }[];
}) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="rounded-lg bg-background border text-sm overflow-hidden">
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 p-3">
        <div className="flex items-start gap-2.5 flex-1 min-w-0">
          <div className="mt-0.5 p-1.5 rounded-full bg-primary/10 flex-shrink-0">
            <User className="h-3 w-3 text-primary" />
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <div className="font-semibold text-foreground">{log.changedByName}</div>
            {log.diffSummary && (
              <div className="text-xs text-teal-700 bg-teal-50 border border-teal-100 rounded px-2 py-0.5 inline-block">
                {log.diffSummary}
              </div>
            )}
            {log.note && (
              <div className="text-muted-foreground text-xs italic">"{log.note}"</div>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          <div className="flex items-center gap-1 text-muted-foreground text-xs whitespace-nowrap">
            <Clock className="h-3 w-3" />
            {format(new Date(log.createdAt), "dd MMM، HH:mm", { locale: ar })}
          </div>
          {snapshotClauses.length > 0 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-xs text-primary hover:underline flex items-center gap-0.5"
            >
              {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              {expanded ? "إخفاء" : `عرض ${snapshotClauses.length} بند`}
            </button>
          )}
        </div>
      </div>

      {/* Expandable snapshot */}
      {expanded && snapshotClauses.length > 0 && (
        <div className="border-t bg-muted/30 px-4 py-3 space-y-3">
          {snapshotClauses.map((c, i) => (
            <div key={i}>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                  {i + 1}
                </span>
                <span className="text-xs font-semibold text-foreground">{c.title}</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed mr-7">{c.body}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function PrivacyPolicySettingsPage() {
  const [clauses, setClauses] = useState<Clause[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [note, setNote] = useState("");
  const [logs, setLogs] = useState<ChangeLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => { fetchPolicy(); }, []);

  const fetchPolicy = async () => {
    try {
      const res = await fetch("/api/settings/privacy-policy");
      const data = await res.json();
      setClauses(data.clauses || []);
    } catch {
      toast.error("فشل تحميل سياسة الخصوصية");
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    if (logsLoading) return;
    setLogsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/settings/privacy-policy", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setLogs(data.logs || []);
    } catch {
      toast.error("فشل تحميل السجلات");
    } finally {
      setLogsLoading(false);
    }
  };

  const handleToggleLogs = () => {
    const next = !showLogs;
    setShowLogs(next);
    if (next && logs.length === 0) fetchLogs();
  };

  const handleSave = async () => {
    if (clauses.some(c => !c.title || !c.body)) {
      toast.error("الرجاء ملء عنوان وتوضيح كل بند");
      return;
    }
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/settings/privacy-policy", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ clauses, note: note || undefined }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Failed");
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      toast.success("✅ تم حفظ سياسة الخصوصية");
      setNote("");
      if (showLogs) { setLogs([]); fetchLogs(); }
    } catch (err: any) {
      toast.error(err.message || "فشل الحفظ");
    } finally {
      setSaving(false);
    }
  };

  const addClause = () => setClauses([...clauses, { title: "", body: "" }]);

  const removeClause = (idx: number) => setClauses(clauses.filter((_, i) => i !== idx));

  const updateClause = (idx: number, field: "title" | "body", value: string) =>
    setClauses(clauses.map((c, i) => (i === idx ? { ...c, [field]: value } : c)));

  const moveClause = (idx: number, direction: "up" | "down") => {
    const target = direction === "up" ? idx - 1 : idx + 1;
    if (target < 0 || target >= clauses.length) return;
    const next = [...clauses];
    [next[idx], next[target]] = [next[target], next[idx]];
    setClauses(next);
  };

  return (
    <div className="min-h-screen bg-muted/30" dir="rtl">
      {/* Hero Header */}
      <div className="bg-gradient-to-l from-primary/10 via-background to-background border-b">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20">
                <Shield className="h-7 w-7 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">سياسة الخصوصية</h1>
                <p className="text-muted-foreground text-sm mt-0.5">
                  إدارة بنود السياسة التي يقرأها المستخدمون قبل إضافة بريدهم الإلكتروني
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleToggleLogs}
                className="gap-2 h-9"
              >
                <History className="h-4 w-4" />
                سجل التعديلات
                <Badge variant="secondary" className="text-xs px-1.5 py-0 h-4">
                  {showLogs && logs.length > 0 ? logs.length : "•"}
                </Badge>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {showLogs && (
          <Card className="shadow-none border-primary/20 bg-primary/5">
            <CardHeader className="pb-3 pt-4 px-5">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-primary">
                <History className="h-4 w-4" />
                سجل التعديلات
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-4">
              {logsLoading ? (
                <div className="flex items-center gap-2 text-muted-foreground text-sm py-3 justify-center">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  جاري التحميل...
                </div>
              ) : logs.length === 0 ? (
                <div className="text-center text-muted-foreground text-sm py-4 flex flex-col items-center gap-1">
                  <FileText className="h-8 w-8 opacity-20 mb-1" />
                  لا يوجد سجلات بعد
                </div>
              ) : (
                <div className="space-y-2 max-h-[28rem] overflow-y-auto pr-1">
                  {logs.map((log) => {
                    const snapshotClauses: { title: string; body: string }[] = log.snapshot
                      ? (() => { try { return JSON.parse(log.snapshot); } catch { return []; } })()
                      : [];
                    return (
                      <LogEntry key={log.id} log={log} snapshotClauses={snapshotClauses} />
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Clauses Editor — 2/3 */}
          <div className="lg:col-span-2 space-y-4">
            {loading ? (
              <Card className="shadow-none">
                <CardContent className="flex items-center justify-center h-48 text-muted-foreground gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  جاري التحميل...
                </CardContent>
              </Card>
            ) : (
              <>
                {clauses.map((clause, idx) => (
                  <Card key={idx} className="shadow-none border-2 hover:border-primary/30 transition-colors group">
                    <CardContent className="p-5 space-y-4">
                      {/* Clause bar */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                            {idx + 1}
                          </div>
                          <span className="text-sm font-semibold text-muted-foreground">بند</span>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost" size="icon" className="h-7 w-7"
                            onClick={() => moveClause(idx, "up")} disabled={idx === 0}
                          >
                            <ChevronUp className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost" size="icon" className="h-7 w-7"
                            onClick={() => moveClause(idx, "down")} disabled={idx === clauses.length - 1}
                          >
                            <ChevronDown className="h-3.5 w-3.5" />
                          </Button>
                          <Separator orientation="vertical" className="h-5 mx-1" />
                          <Button
                            variant="ghost" size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => removeClause(idx)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>

                      {/* Title */}
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          عنوان البند
                        </Label>
                        <Input
                          value={clause.title}
                          onChange={(e) => updateClause(idx, "title", e.target.value)}
                          placeholder="مثال: ١. جمع المعلومات"
                          className="font-semibold bg-muted/30 border-muted focus:bg-background"
                          dir="rtl"
                        />
                      </div>

                      {/* Body */}
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          نص التوضيح
                        </Label>
                        <Textarea
                          value={clause.body}
                          onChange={(e) => updateClause(idx, "body", e.target.value)}
                          placeholder="اكتب شرح هذا البند بالتفصيل..."
                          className="min-h-[100px] text-sm leading-relaxed resize-none bg-muted/30 border-muted focus:bg-background"
                          dir="rtl"
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {/* Add clause button */}
                <button
                  onClick={addClause}
                  className="w-full h-14 rounded-xl border-2 border-dashed border-muted-foreground/20 text-muted-foreground hover:border-primary/40 hover:text-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-2 text-sm font-medium"
                >
                  <Plus className="h-4 w-4" />
                  إضافة بند جديد
                </button>
              </>
            )}
          </div>

          {/* Sidebar — 1/3 */}
          <div className="space-y-4">
            {/* Stats */}
            <Card className="shadow-none">
              <CardContent className="p-5 space-y-3">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">ملخص</div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">عدد البنود</span>
                  <Badge variant="secondary" className="font-bold">{clauses.length}</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">التعديلات المسجلة</span>
                  <Badge variant="outline">{logs.length || "—"}</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Save note + button */}
            <Card className="shadow-none">
              <CardContent className="p-5 space-y-4">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  ملاحظة التعديل
                </div>
                <div className="space-y-1.5">
                  <Input
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="مثال: تحديث بند مشاركة البيانات"
                    dir="rtl"
                    className="text-sm bg-muted/30"
                  />
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    ستُحفظ هذه الملاحظة في سجل التعديلات لمراجعتها لاحقاً.
                  </p>
                </div>

                <Button
                  onClick={handleSave}
                  disabled={saving || loading || clauses.length === 0}
                  className="w-full gap-2 h-10"
                  variant={saveSuccess ? "default" : "default"}
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      جاري الحفظ...
                    </>
                  ) : saveSuccess ? (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      تم الحفظ!
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      حفظ السياسة
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Warning note */}
            <div className="flex items-start gap-2.5 p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-800">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0 text-amber-500" />
              <p className="leading-relaxed text-xs">
                يُعرض هذا النص على المستخدمين قبل إضافة بريدهم الإلكتروني. تأكد من دقة المحتوى.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
