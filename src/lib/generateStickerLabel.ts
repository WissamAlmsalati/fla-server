import jsPDF from 'jspdf';
import JsBarcode from 'jsbarcode';
import { Order } from '@/features/orders/slices/orderSlice';
import { toast } from 'sonner';

/**
 * Generate a professional sticker label for thermal printer (Xprinter XP-420B)
 * Specs: 4 inch (108mm) width, 203 dpi
 * Label dimensions: 100mm x 150mm (common 4x6 inch shipping label)
 *
 * Uses direct jsPDF vector rendering for crisp output.
 * Opens in a new browser tab for preview / print.
 */
export const generateStickerLabel = async (order: Order) => {
  try {
    // ── helpers ────────────────────────────────────────────────
    const getCustomerCode = () => {
      if (!order.customer) return 'N/A';
      switch (order.country) {
        case 'DUBAI': return order.customer.dubaiCode || order.customer.code;
        case 'USA': return order.customer.usaCode || order.customer.code;
        case 'TURKEY': return order.customer.turkeyCode || order.customer.code;
        default: return order.customer.code;
      }
    };

    const getOrigin = () => {
      switch (order.country) {
        case 'CHINA': return 'Guangzhou, China';
        case 'DUBAI': return 'Dubai, UAE';
        case 'USA': return 'Delaware, USA';
        case 'TURKEY': return 'Istanbul, Turkey';
        default: return 'China';
      }
    };

    const getCountryCode = () => {
      switch (order.country) {
        case 'CHINA': return 'CN';
        case 'DUBAI': return 'AE';
        case 'USA': return 'US';
        case 'TURKEY': return 'TR';
        default: return order.country ? order.country.substring(0, 2).toUpperCase() : 'CN';
      }
    };

    const getShippingType = () => {
      if (order.shippingRate?.type === 'SEA') return 'SEA FREIGHT';
      return 'AIR EXPRESS';
    };

    const customerCode = getCustomerCode();
    const customerName = order.customer?.user?.name || 'Customer';
    const origin = getOrigin();
    const countryCode = getCountryCode();
    const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const shippingType = getShippingType();
    const itemName = order.name || 'General Merchandise';

    // ── PDF setup (100 × 150 mm) ──────────────────────────────
    const W = 100; // mm
    const H = 150; // mm
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [W, H] });
    const M = 4; // margin

    // ── colours ───────────────────────────────────────────────
    const BLACK: [number, number, number] = [0, 0, 0];
    const WHITE: [number, number, number] = [255, 255, 255];
    const DARK_GRAY: [number, number, number] = [60, 60, 60];
    const MID_GRAY: [number, number, number] = [120, 120, 120];
    const LIGHT_BG: [number, number, number] = [245, 245, 245];
    const ACCENT: [number, number, number] = [20, 80, 160]; // navy blue

    let y = 0;

    // helper: draw a horizontal rule
    const hRule = (yPos: number, thickness = 0.6) => {
      pdf.setDrawColor(...BLACK);
      pdf.setLineWidth(thickness);
      pdf.line(0, yPos, W, yPos);
    };

    // ── 1. OUTER BORDER ───────────────────────────────────────
    pdf.setDrawColor(...BLACK);
    pdf.setLineWidth(1);
    pdf.rect(0.5, 0.5, W - 1, H - 1);

    // ── 2. HEADER: Logo text + shipping badge ─────────────────
    y = 1;
    const headerH = 12;

    // Logo area – company name as text (always renders, no image loading issues)
    pdf.setFillColor(...WHITE);
    pdf.rect(1, y, W - 2, headerH, 'F');

    // Load and add logo image
    try {
      const logoResponse = await fetch('/photos/logo-with-title.png');
      const logoBlob = await logoResponse.blob();
      const logoBase64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(logoBlob);
      });
      pdf.addImage(logoBase64, 'PNG', M, y + 1.5, 28, 9);
    } catch {
      // Fallback: draw company name as text
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(11);
      pdf.setTextColor(...BLACK);
      pdf.text('ALWALA', M + 2, y + 7.5);
    }

    // Shipping type badge (right side)
    const badgeW = 28;
    const badgeX = W - badgeW - 1;
    pdf.setFillColor(...BLACK);
    pdf.rect(badgeX, y, badgeW, headerH, 'F');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8);
    pdf.setTextColor(...WHITE);
    pdf.text(shippingType, badgeX + badgeW / 2, y + headerH / 2 + 1, { align: 'center' });

    y += headerH;
    hRule(y, 1);

    // ── 3. ROUTE: Origin → Destination ────────────────────────
    const routeH = 16;
    pdf.setFillColor(...WHITE);
    pdf.rect(1, y, W - 2, routeH, 'F');

    const halfW = (W - 2) / 2;

    // Origin (left)
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(6);
    pdf.setTextColor(...MID_GRAY);
    pdf.text('ORIGIN', M, y + 4.5);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(14);
    pdf.setTextColor(...BLACK);
    pdf.text(countryCode, M, y + 10);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7);
    pdf.setTextColor(...DARK_GRAY);
    pdf.text(origin, M, y + 14);

    // Divider
    pdf.setDrawColor(...BLACK);
    pdf.setLineWidth(0.4);
    pdf.line(halfW + 1, y + 2, halfW + 1, y + routeH - 2);

    // Arrow
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12);
    pdf.setTextColor(...MID_GRAY);
    pdf.text('→', halfW - 1, y + 9);

    // Destination (right)
    const rX = halfW + M + 2;
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(6);
    pdf.setTextColor(...MID_GRAY);
    pdf.text('DESTINATION', rX, y + 4.5);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(14);
    pdf.setTextColor(...BLACK);
    pdf.text('LY', rX, y + 10);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7);
    pdf.setTextColor(...DARK_GRAY);
    pdf.text('Tripoli, Libya', rX, y + 14);

    y += routeH;
    hRule(y, 1);

    // ── 4. BIG CUSTOMER CODE ──────────────────────────────────
    const codeH = 22;
    pdf.setFillColor(...BLACK);
    pdf.rect(0.5, y, W - 1, codeH, 'F');

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7);
    pdf.setTextColor(200, 200, 200);
    pdf.text('CUSTOMER CODE', W / 2, y + 5, { align: 'center' });

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(28);
    pdf.setTextColor(...WHITE);
    pdf.text(customerCode, W / 2, y + 17, { align: 'center' });

    y += codeH;

    // ── 5. DETAILS GRID (4 cells) ─────────────────────────────
    const gridH = 14;
    hRule(y, 0.6);
    pdf.setFillColor(...LIGHT_BG);
    pdf.rect(0.5, y, W - 1, gridH, 'F');

    const cols = [
      { label: 'WEIGHT', value: `${order.weight || '0.5'} kg` },
      { label: 'PIECES', value: '1' },
      { label: 'VALUE', value: `$${order.usdPrice || '0'}` },
      { label: 'COUNTRY', value: countryCode },
    ];
    const cellW = (W - 1) / cols.length;

    cols.forEach((col, i) => {
      const cx = 0.5 + i * cellW;
      // vertical divider
      if (i > 0) {
        pdf.setDrawColor(200, 200, 200);
        pdf.setLineWidth(0.3);
        pdf.line(cx, y + 2, cx, y + gridH - 2);
      }
      // label
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(5.5);
      pdf.setTextColor(...MID_GRAY);
      pdf.text(col.label, cx + cellW / 2, y + 4.5, { align: 'center' });
      // value
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      pdf.setTextColor(...BLACK);
      pdf.text(col.value, cx + cellW / 2, y + 10.5, { align: 'center' });
    });

    y += gridH;
    hRule(y, 0.6);

    // ── 6. CONTENTS ───────────────────────────────────────────
    const descH = 11;
    pdf.setFillColor(...WHITE);
    pdf.rect(0.5, y, W - 1, descH, 'F');

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(5.5);
    pdf.setTextColor(...MID_GRAY);
    pdf.text('CONTENTS', M, y + 4);

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9);
    pdf.setTextColor(...BLACK);
    // Truncate long names
    const maxLen = 45;
    const truncatedName = itemName.length > maxLen ? itemName.substring(0, maxLen) + '...' : itemName;
    pdf.text(truncatedName, M, y + 9);

    y += descH;
    hRule(y, 0.6);

    // ── 7. CONSIGNEE ──────────────────────────────────────────
    const consH = 14;
    pdf.setFillColor(...WHITE);
    pdf.rect(0.5, y, W - 1, consH, 'F');

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(5.5);
    pdf.setTextColor(...MID_GRAY);
    pdf.text('CONSIGNEE', M, y + 4);

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12);
    pdf.setTextColor(...BLACK);
    pdf.text(customerName, M, y + 10);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7);
    pdf.setTextColor(...DARK_GRAY);
    pdf.text('Tripoli, Libya', M, y + 13.5);

    y += consH;
    hRule(y, 1);

    // ── 8. ORDER ID BAR ───────────────────────────────────────
    const orderBarH = 9;
    pdf.setFillColor(...ACCENT);
    pdf.rect(0.5, y, W - 1, orderBarH, 'F');

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8);
    pdf.setTextColor(...WHITE);
    pdf.text(`ORDER #${order.id}`, M, y + 5.5);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7);
    pdf.text(dateStr, W - M, y + 5.5, { align: 'right' });

    y += orderBarH;

    // ── 9. BARCODE ────────────────────────────────────────────
    const barcodeCanvas = document.createElement('canvas');
    JsBarcode(barcodeCanvas, order.trackingNumber, {
      format: 'CODE128',
      width: 2.5,
      height: 60,
      displayValue: false,
      margin: 0,
    });
    const barcodeDataUrl = barcodeCanvas.toDataURL('image/png');

    const remainingH = H - y - 1;
    const barcodeImgH = remainingH * 0.5;
    const barcodeImgW = W - M * 4;
    const barcodeX = (W - barcodeImgW) / 2;

    pdf.setFillColor(...WHITE);
    pdf.rect(0.5, y, W - 1, remainingH, 'F');

    const barcodeY = y + (remainingH - barcodeImgH - 10) / 2 + 2;
    pdf.addImage(barcodeDataUrl, 'PNG', barcodeX, barcodeY, barcodeImgW, barcodeImgH);

    // Tracking number text below barcode
    pdf.setFont('courier', 'bold');
    pdf.setFontSize(11);
    pdf.setTextColor(...BLACK);
    pdf.text(order.trackingNumber, W / 2, barcodeY + barcodeImgH + 5, { align: 'center' });

    // Printed date
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(6);
    pdf.setTextColor(...MID_GRAY);
    pdf.text(`Printed: ${dateStr}`, W / 2, barcodeY + barcodeImgH + 9, { align: 'center' });

    // ── Open in new tab instead of downloading ────────────────
    const pdfBlob = pdf.output('blob');
    const url = URL.createObjectURL(pdfBlob);
    window.open(url, '_blank');

    toast.success('تم إنشاء الملصق بنجاح');
  } catch (err: any) {
    console.error('Sticker generation failed:', err);
    toast.error('فشل إنشاء الملصق: ' + (err?.message || 'خطأ غير معروف'));
  }
};
