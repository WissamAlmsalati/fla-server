"use client"

import { useEffect, useRef, useState } from "react"
import { Html5Qrcode } from "html5-qrcode"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface ScannerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onScan: (result: string) => void
}

export function ScannerDialog({ open, onOpenChange, onScan }: ScannerDialogProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true;

    if (open) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        if (mounted) startScanner()
      }, 100)
      return () => {
        mounted = false;
        clearTimeout(timer)
        stopScanner()
      }
    } else {
      stopScanner()
    }
  }, [open])

  const startScanner = async () => {
    try {
      // Check for secure context/camera support
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError("الكاميرا تتطلب اتصال آمن (HTTPS) أو localhost. لا يمكن تشغيل الكاميرا على HTTP.");
        return;
      }

      // If scanner instance exists, clear it first
      if (scannerRef.current) {
        await stopScanner();
      }

      const scanner = new Html5Qrcode("reader")
      scannerRef.current = scanner
      
      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          onScan(decodedText)
          onOpenChange(false)
        },
        (errorMessage) => {
          // ignore errors for now as they happen on every frame no code is detected
        }
      )
    } catch (err: any) {
      console.error("Error starting scanner", err)
      if (err?.name === "NotAllowedError" || err?.message?.includes("permission")) {
        setError("تم رفض إذن الكاميرا. يرجى السماح بالوصول للكاميرا من إعدادات المتصفح.");
      } else if (err?.name === "NotFoundError") {
        setError("لم يتم العثور على كاميرا.");
      } else {
        setError("فشل تشغيل الكاميرا. تأكد من استخدام HTTPS أو منح الصلاحيات.");
      }
    }
  }

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop()
        }
        scannerRef.current.clear()
      } catch (err) {
        console.error("Error stopping scanner", err)
      }
      scannerRef.current = null
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="text-center">مسح الباركود</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center gap-4 py-4">
          <div id="reader" className="w-full overflow-hidden rounded-lg bg-muted min-h-[300px]" />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            إلغاء
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
