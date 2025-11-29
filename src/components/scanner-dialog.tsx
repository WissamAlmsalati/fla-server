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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Loader2, Camera } from "lucide-react"
import { OrderDetailsDrawer } from "@/features/orders/components/OrderDetailsDrawer"
import type { Order } from "@/features/orders/slices/orderSlice"

interface ScannerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onScan: (result: string) => void
}

const statusMap: Record<string, string> = {
  purchased: "تم الشراء",
  arrived_to_china: "وصل إلى الصين",
  shipping_to_libya: "جاري الشحن إلى ليبيا",
  arrived_libya: "وصل إلى ليبيا",
  ready_for_pickup: "جاهز للاستلام",
  delivered: "تم التسليم",
};

const countryMap: Record<string, string> = {
  CHINA: "الصين",
  DUBAI: "دبي",
  USA: "أمريكا",
  TURKEY: "تركيا",
};

export function ScannerDialog({ open, onOpenChange, onScan }: ScannerDialogProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [scannedOrder, setScannedOrder] = useState<Order | null>(null)
  const [isLoadingOrder, setIsLoadingOrder] = useState(false)
  const [isScanningFile, setIsScanningFile] = useState(false)

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

  const fetchOrderByTracking = async (trackingNumber: string) => {
    setIsLoadingOrder(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/orders?search=${trackingNumber}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json()
      if (data.data && data.data.length > 0) {
        setScannedOrder(data.data[0])
      } else {
        setError("لم يتم العثور على طلب بهذا الرقم")
      }
    } catch (err) {
      console.error("Error fetching order:", err)
      setError("فشل في تحميل بيانات الطلب")
    } finally {
      setIsLoadingOrder(false)
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsScanningFile(true)
    setError(null)

    try {
      const html5QrCode = new Html5Qrcode("reader")
      const result = await html5QrCode.scanFile(file, true)
      
      onScan(result)
      fetchOrderByTracking(result)
      
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (err) {
      console.error("Error scanning file:", err)
      setError("فشل في قراءة الباركود من الصورة. تأكد من وضوح الصورة.")
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } finally {
      setIsScanningFile(false)
    }
  }

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
          fps: 30, // Increased from 10 to 30 for faster scanning
          qrbox: { width: 500, height: 150 }, // Horizontal rectangle for barcodes
          aspectRatio: 1.777778, // 16:9 aspect ratio
          disableFlip: true, // Disable image flipping for better performance
        },
        (decodedText) => {
          onScan(decodedText)
          fetchOrderByTracking(decodedText)
          stopScanner()
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

  const handleClose = () => {
    setScannedOrder(null)
    setError(null)
    onOpenChange(false)
  }

  const handleOrderUpdate = () => {
    setScannedOrder(null)
    onOpenChange(false)
  }

  return (
    <>
      <Dialog open={open && !scannedOrder} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[90vw] max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-center">مسح الباركود</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center gap-4 py-4">
            <div className="relative w-full">
              <div id="reader" className="w-full overflow-hidden rounded-lg bg-muted min-h-[500px]" />
              
              {/* Barcode Frame Overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="relative" style={{ width: '500px', height: '150px' }}>
                  {/* Corner brackets */}
                  <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-primary"></div>
                  <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-primary"></div>
                  <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-primary"></div>
                  <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-primary"></div>
                  
                  {/* Scanning line animation */}
                  <div className="absolute inset-0 overflow-hidden">
                    <div 
                      className="absolute w-full h-0.5 bg-primary shadow-lg animate-scan"
                      style={{
                        animation: 'scan 2s ease-in-out infinite',
                        boxShadow: '0 0 10px rgba(var(--primary), 0.8)'
                      }}
                    ></div>
                  </div>
                  
                  {/* Helper text */}
                  <div className="absolute -bottom-12 left-0 right-0 text-center">
                    <p className="text-sm font-medium text-primary bg-background/80 px-4 py-2 rounded-full inline-block">
                      ضع الباركود داخل الإطار
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {isLoadingOrder && (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>جاري تحميل بيانات الطلب...</span>
              </div>
            )}
            {isScanningFile && (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>جاري قراءة الباركود من الصورة...</span>
              </div>
            )}
            {error && <p className="text-sm text-red-500">{error}</p>}
            
            <div className="flex gap-2 w-full">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleFileSelect}
              />
              <Button 
                variant="secondary" 
                className="flex-1"
                onClick={() => fileInputRef.current?.click()}
                disabled={isScanningFile || isLoadingOrder}
              >
                <Camera className="h-4 w-4 mr-2" />
                التقاط صورة
              </Button>
              <Button variant="outline" className="flex-1" onClick={handleClose}>
                إلغاء
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <OrderDetailsDrawer 
        order={scannedOrder} 
        open={!!scannedOrder} 
        onOpenChange={(open) => !open && setScannedOrder(null)} 
        onUpdate={handleOrderUpdate}
      />
      
      <style jsx global>{`
        @keyframes scan {
          0% {
            top: 0%;
          }
          50% {
            top: 100%;
          }
          100% {
            top: 0%;
          }
        }
        
        .animate-scan {
          animation: scan 2s ease-in-out infinite;
        }
      `}</style>
    </>
  )
}
