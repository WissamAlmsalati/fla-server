import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import puppeteer from "puppeteer";
import { getStatusLabel } from "@/lib/orderStatus";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import fs from "fs";
import path from "path";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const user = await requireAuth(request);
    const { orderId } = await params;
    const id = parseInt(orderId);

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        customer: {
          include: {
            user: true,
          },
        },
        shippingRate: true,
        flight: true,
        logs: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Check access rights
    if (user.role === "CUSTOMER" && order.customerId !== user.customerId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Load Local Logo to Base64
    let logoBase64 = '';
    try {
      const logoPath = path.join(process.cwd(), 'public', 'photos', 'logo-with-title.png');
      const logoBuffer = fs.readFileSync(logoPath);
      logoBase64 = `data:image/png;base64,${logoBuffer.toString('base64')}`;
    } catch (e) {
      console.error("Could not load logo image for PDF", e);
    }

    const dateStr = format(new Date(), 'yyyy-MM-dd');
    const statusLabel = getStatusLabel(order.status, order.country);

    // Time the status was changed (from the most recent log, or order.updatedAt)
    const timeChanged = order.logs && order.logs.length > 0
      ? order.logs[0].createdAt
      : order.updatedAt;

    // Calculate totals
    const shippingCost = order.shippingCost ?? 0;
    const totalAmount = order.usdPrice + shippingCost;
    const customerCode = order.customer?.code || "unknown";
    const customerName = order.customer?.name || order.customer?.user?.name || "Unknown";

    const invoiceHTML = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Tajwal:wght@300;400;700;800&display=swap');
          
          body {
            font-family: 'Tajwal', sans-serif;
            margin: 0;
            padding: 0;
            background: white;
            color: #333;
            line-height: 1.4;
            width: 100%; 
            margin: 0 auto;
          }
          .invoice-container {
            width: 100%;
            margin: 0;
            padding: 20px;
            background: white;
            font-size: 14px;
            position: relative;
            min-height: 100%; 
            box-sizing: border-box;
          }
          .header {
            background: white;
            color: #333;
            padding: 30px 20px;
            text-align: center;
            margin: -20px -20px 20px -20px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 20px;
            border-bottom: 2px solid #eee;
          }
          .logo {
            height: 80px;
            width: auto;
          }
          .company-info h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 800;
          }
          .company-info h2 {
            margin: 10px 0 0 0;
            font-size: 16px;
            font-weight: 400;
          }
          .invoice-details {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
            gap: 20px;
          }
          .invoice-info {
            flex: 1;
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border: 1px solid #dee2e6;
          }
          .customer-info {
            flex: 1;
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border: 1px solid #dee2e6;
          }
          .section-title {
            margin: 0 0 15px 0;
            color: #333;
            font-size: 18px;
            font-weight: 700;
          }
          .info-item {
            margin: 8px 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .info-label {
            font-weight: 600;
            color: #555;
          }
          .info-value {
            font-weight: 500;
          }
          .order-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            background: white;
            border: 1px solid #dee2e6;
            border-radius: 8px;
            overflow: hidden;
          }
          .order-table th {
            background: white;
            color: #333;
            padding: 15px;
            text-align: right;
            font-weight: 600;
            border: 1px solid #dee2e6;
          }
          .order-table td {
            padding: 15px;
            border: 1px solid #dee2e6;
            text-align: right;
          }
          .order-table tbody tr:nth-child(even) {
            background: #f8f9fa;
          }
          .total-row {
            background: #f8f9fa !important;
            color: #333;
            font-weight: 700;
          }
          .additional-info {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
          }
          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
          }
          .notes {
            margin-top: 15px;
            padding-top: 15px;
            border-top: 1px solid #dee2e6;
          }
          .footer {
            background: white;
            color: #333;
            padding: 25px 20px;
            text-align: center;
            border-top: 2px solid #eee;
            margin-top: 40px;
            page-break-inside: avoid;
          }
          .footer p {
            margin: 0;
            font-size: 16px;
          }
          /* --- Horizontal Stepper CSS --- */
          .timeline-section {
            margin-top: 30px;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 8px;
            border: 1px solid #dee2e6;
            page-break-inside: avoid;
            overflow: hidden;
          }
          .timeline {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            position: relative;
            margin: 0;
            padding: 0;
            list-style: none;
            width: 100%;
          }
          .timeline::before {
            content: '';
            position: absolute;
            top: 15px; /* Center of the circle */
            left: 5%;
            right: 5%;
            height: 2px;
            background: #cbd5e1;
            z-index: 0;
          }
          .timeline-item {
            position: relative;
            flex: 1;
            text-align: center;
            z-index: 1;
            padding: 0 5px;
          }
          .timeline-point {
            position: relative;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: #4AC1C2;
            border: 4px solid #fff;
            box-shadow: 0 0 0 2px #4AC1C2;
            margin: 0 auto 12px auto;
            z-index: 2;
          }
          .timeline-content {
            background: transparent;
            padding: 0;
            border: none;
            box-shadow: none;
          }
          .timeline-title {
            font-weight: 700;
            font-size: 13px;
            color: #1e293b;
            margin-bottom: 4px;
            word-wrap: break-word;
          }
          .timeline-date {
            font-size: 11px;
            color: #64748b;
          }
          .timeline-note {
            margin-top: 6px;
            font-size: 13px;
            color: #475569;
            font-style: italic;
          }
          .page-break {
            page-break-before: always;
          }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <!-- Header -->
          <div class="header">
             ${logoBase64 ? `<img src="${logoBase64}" alt="Alwala Shipping Logo" class="logo">` : ''}
            <div class="company-info">
              <h1>فاتورة تسليم</h1>
              <h2>Delivery Invoice</h2>
            </div>
          </div>

          <!-- Invoice Details -->
          <div class="invoice-details">
            <div class="invoice-info">
              <h3 class="section-title">تفاصيل الفاتورة</h3>
              <div class="info-item">
                <span class="info-label">رقم الفاتورة:</span>
                <span class="info-value">INV-${customerCode}-${dateStr}</span>
              </div>
              <div class="info-item">
                <span class="info-label">تاريخ الفاتورة:</span>
                <span class="info-value">${format(new Date(), 'dd/MM/yyyy', { locale: ar })}</span>
              </div>
              <div class="info-item">
                <span class="info-label">رقم التتبع:</span>
                <span class="info-value">${order.trackingNumber}</span>
              </div>
            </div>

            <div class="customer-info">
              <h3 class="section-title">معلومات العميل</h3>
               ${order.customer ? `
                <div class="info-item">
                  <span class="info-label">الاسم:</span>
                  <span class="info-value">${customerName}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">كود العميل:</span>
                  <span class="info-value">${customerCode}</span>
                </div>
              ` : '<p style="margin: 0; color: #6c757d; text-align: center;">لا يوجد عميل مرتبط</p>'}
            </div>
          </div>

          <!-- Order Details Table -->
          <h3 class="section-title">تفاصيل الطلب / Order Details</h3>

          <table class="order-table">
            <thead>
              <tr>
                <th>الوصف / Description</th>
                <th>الكمية / Qty</th>
                <th>السعر / Price</th>
                <th>المجموع / Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${order.name}</td>
                <td style="text-align: center;">1</td>
                <td style="text-align: center;">$${order.usdPrice.toFixed(2)}</td>
                <td style="text-align: center;">$${order.usdPrice.toFixed(2)}</td>
              </tr>
               ${shippingCost && shippingCost > 0 ? `
                <tr>
                  <td>تكلفة الشحن / Shipping Cost (${order.shippingRate?.name || 'غير محدد'})</td>
                  <td style="text-align: center;">1</td>
                  <td style="text-align: center;">$${shippingCost.toFixed(2)}</td>
                  <td style="text-align: center;">$${shippingCost.toFixed(2)}</td>
                </tr>
              ` : ''}
              <tr class="total-row">
                <td colspan="3" style="text-align: right; font-weight: 700;">المجموع الكلي / Total</td>
                <td style="text-align: center; font-weight: 700;">$${totalAmount.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          <!-- Additional Information -->
          <div class="additional-info">
            <h4 style="margin: 0 0 15px 0; color: #2980b9; font-size: 16px;">معلومات إضافية / Additional Information</h4>

            <div class="info-grid">
               ${order.shippingRate?.name ? `<div class="info-item"><span class="info-label">نوع الشحن:</span><span class="info-value">${order.shippingRate.name}</span></div>` : ''}
               ${order.weight ? `<div class="info-item"><span class="info-label">الوزن:</span><span class="info-value">${order.weight} كجم</span></div>` : ''}
              <div class="info-item">
                <span class="info-label">تاريخ الإنشاء:</span>
                <span class="info-value">${format(new Date(order.createdAt), 'dd MMMM yyyy', { locale: ar })}</span>
              </div>
              <div class="info-item">
                <span class="info-label">الحالة:</span>
                <span class="info-value">${statusLabel}</span>
              </div>
              <div class="info-item">
                <span class="info-label">تاريخ تغيير الحالة:</span>
                <span class="info-value">${format(new Date(timeChanged), 'dd MMMM yyyy HH:mm', { locale: ar })}</span>
              </div>
            </div>

             ${order.notes ? `
              <div class="notes">
                <strong>ملاحظات / Notes:</strong><br>
                ${order.notes.replace(/\n/g, '<br>')}
              </div>
            ` : ''}
          </div>
          
           ${order.logs && order.logs.length > 0 ? `
            <!-- Order Timeline / Stepper -->
            <div class="timeline-section page-break">
              <h3 class="section-title">سجل حالة الطلب / Order History</h3>
              <ul class="timeline">
                ${order.logs.map(log => `
                  <li class="timeline-item">
                    <div class="timeline-point"></div>
                    <div class="timeline-content">
                      <div class="timeline-title">${getStatusLabel(log.status, order.country)}</div>
                      <div class="timeline-date">${format(new Date(log.createdAt), 'dd MMMM yyyy HH:mm', { locale: ar })}</div>
                      ${log.note ? `<div class="timeline-note">${log.note}</div>` : ''}
                    </div>
                  </li>
                `).join('')}
              </ul>
            </div>
          ` : ''}

          <!-- Footer -->
          <div class="footer">
            <p>شكراً لتعاملكم معنا</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Initialize Puppeteer to render HTML to PDF
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });

    const page = await browser.newPage();

    // Set the HTML content
    await page.setContent(invoiceHTML, { waitUntil: 'networkidle2', timeout: 15000 });

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
      margin: {
        top: '20px',
        bottom: '20px',
        left: '20px',
        right: '20px'
      }
    });

    await browser.close();

    // Return the PDF directly as a downloadable file
    return new NextResponse(Buffer.from(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="inv-${customerCode}-${dateStr}.pdf"`,
      },
    });

  } catch (error) {
    console.error("PDF Generation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
