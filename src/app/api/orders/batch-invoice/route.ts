import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import puppeteer from "puppeteer";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { getStatusLabel } from "@/lib/orderStatus";
import fs from "fs";
import path from "path";

export async function POST(request: Request) {
  try {
    const user = await requireAuth(request);
    const body = await request.json();
    const orderIds: number[] = body.orderIds;

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return NextResponse.json({ error: "Invalid order IDs provided" }, { status: 400 });
    }

    const orders = await prisma.order.findMany({
      where: {
        id: { in: orderIds },
      },
      include: {
        customer: {
          include: {
            user: true,
          },
        },
        shippingRate: true,
        logs: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    if (orders.length === 0) {
      return NextResponse.json({ error: "No orders found" }, { status: 404 });
    }

    // Check access rights
    if (user.role === "CUSTOMER") {
      for (const order of orders) {
        if (order.customerId !== user.customerId) {
          return NextResponse.json({ error: "Unauthorized access to some orders" }, { status: 403 });
        }
      }
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

    // Calculate totals
    const totalItems = orders.length;
    let totalAmount = 0;

    for (const order of orders) {
      totalAmount += order.usdPrice + (order.shippingCost || 0);
    }

    const firstOrder = orders[0];
    const customerCode = firstOrder.customer?.code || "unknown";
    const customerName = firstOrder.customer?.name || firstOrder.customer?.user?.name || "Unknown";

    const orderRowsHtml = orders.map(order => `
      <tr>
        <td style="font-family: monospace;">${order.trackingNumber}</td>
        <td>
           ${order.name}
           <br/>
           <small style="color:#6b7280">
               الوزن/الحجم: ${order.weight ? order.weight + (order.shippingRate?.type === 'SEA' ? ' CBM' : ' kg') : 'غير محدد'}
           </small>
        </td>
        <td style="text-align: center;">1</td>
        <td style="text-align: center;">$${order.usdPrice.toFixed(2)}</td>
        <td style="text-align: center;">$${(order.shippingCost || 0).toFixed(2)}</td>
        <td style="text-align: center; font-weight: bold;">$${(order.usdPrice + (order.shippingCost || 0)).toFixed(2)}</td>
      </tr>
    `).join('');

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
          .footer {
            background: white;
            color: #333;
            padding: 25px 20px;
            text-align: center;
            border-top: 2px solid #eee;
            margin-top: 50px;
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
              <h1>المجموعة الموحدة للفواتير</h1>
              <h2>Combined Delivery Invoice</h2>
            </div>
          </div>

          <!-- Invoice Details -->
          <div class="invoice-details">
            <div class="invoice-info">
              <h3 class="section-title">تفاصيل الفاتورة</h3>
              <div class="info-item">
                <span class="info-label">رقم مرجعي:</span>
                <span class="info-value">BATCH-${customerCode}-${dateStr}</span>
              </div>
              <div class="info-item">
                <span class="info-label">تاريخ الفاتورة:</span>
                <span class="info-value">${format(new Date(), 'dd/MM/yyyy', { locale: ar })}</span>
              </div>
              <div class="info-item">
                <span class="info-label">عدد الطلبات:</span>
                <span class="info-value">${totalItems}</span>
              </div>
            </div>

            <div class="customer-info">
              <h3 class="section-title">معلومات العميل</h3>
              <div class="info-item">
                <span class="info-label">الاسم:</span>
                <span class="info-value">${customerName}</span>
              </div>
              <div class="info-item">
                <span class="info-label">كود العميل:</span>
                <span class="info-value">${customerCode}</span>
              </div>
              <div class="info-item">
                <span class="info-label">تاريخ الإصدار:</span>
                <span class="info-value">${format(new Date(), 'dd MMMM yyyy', { locale: ar })}</span>
              </div>
            </div>
          </div>

          <!-- Order Details Table -->
          <h3 class="section-title">التفاصيل المجمعة / Combined Orders</h3>

          <table class="order-table">
            <thead>
              <tr>
                <th>رقم التتبع / Tracking</th>
                <th>الوصف / Description</th>
                <th style="text-align: center;">الكمية / Qty</th>
                <th style="text-align: center;">السعر / Price</th>
                <th style="text-align: center;">الشحن / Shipping</th>
                <th style="text-align: center;">المجموع / Total</th>
              </tr>
            </thead>
            <tbody>
              ${orderRowsHtml}
              <tr class="total-row">
                <td colspan="5" style="text-align: right; font-weight: 700;">المجموع الكلي / Grand Total</td>
                <td style="text-align: center; font-weight: 700;">$${totalAmount.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          <!-- Order Timelines (Steppers) -->
          ${orders.map(order => order.logs && order.logs.length > 0 ? `
            <div class="timeline-section page-break">
              <h3 class="section-title">سجل حالة الطلب (${order.trackingNumber}) / Order History</h3>
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
          ` : '').join('')}

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
        "Content-Disposition": `inline; filename="batch-inv-${customerCode}-${dateStr}.pdf"`,
      },
    });

  } catch (error) {
    console.error("Batch PDF Generation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
