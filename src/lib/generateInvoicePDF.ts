import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Order } from '@/features/orders/slices/orderSlice';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

export const generateInvoicePDF = async (order: Order) => {
  // Load the logo
  const logoResponse = await fetch('/photos/logo-with-title.png');
  const logoBlob = await logoResponse.blob();
  const logoBase64 = await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(logoBlob);
  });

  // Define date string for filename and invoice number
  const dateStr = format(new Date(), 'yyyy-MM-dd');

  // Create HTML content for the invoice
  const invoiceHTML = `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Almarai:wght@300;400;700;800&display=swap" rel="stylesheet">
      <style>
        body {
          font-family: 'Almarai', sans-serif;
          margin: 0;
          padding: 0;
          background: white;
          color: #333;
          line-height: 1.4;
        }
        .invoice-container {
          width: 800px;
          margin: 0;
          padding: 20px;
          background: white;
          font-size: 14px;
          position: relative;
          min-height: 1100px; /* A4 height approximation */
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
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          border-top: 2px solid #eee;
        }
        .footer p {
          margin: 0;
          font-size: 16px;
        }
      </style>
    </head>
    <body>
      <div class="invoice-container">
        <!-- Header -->
        <div class="header">
          <img src="${logoBase64}" alt="Alwala Shipping Logo" class="logo">
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
              <span class="info-value">INV-${order.customer?.code || 'unknown'}-${dateStr}</span>
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
                <span class="info-value">${order.customer.user?.name ?? "-"}</span>
              </div>
              <div class="info-item">
                <span class="info-label">كود العميل:</span>
                <span class="info-value">${order.customer.code}</span>
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
              <td style="text-align: center;">$${order.usdPrice}</td>
              <td style="text-align: center;">$${order.usdPrice}</td>
            </tr>
            ${order.shippingCost && order.shippingCost > 0 ? `
              <tr>
                <td>تكلفة الشحن / Shipping Cost</td>
                <td style="text-align: center;">1</td>
                <td style="text-align: center;">$${order.shippingCost}</td>
                <td style="text-align: center;">$${order.shippingCost}</td>
              </tr>
            ` : ''}
            <tr class="total-row">
              <td colspan="3" style="text-align: right; font-weight: 700;">المجموع الكلي / Total</td>
              <td style="text-align: center; font-weight: 700;">$${(order.usdPrice + (order.shippingCost || 0)).toFixed(2)}</td>
            </tr>
          </tbody>
        </table>

        <!-- Additional Information -->
        <div class="additional-info">
          <h4 style="margin: 0 0 15px 0; color: #2980b9; font-size: 16px;">معلومات إضافية / Additional Information</h4>

          <div class="info-grid">
            ${order.shippingRate ? `<div class="info-item"><span class="info-label">نوع الشحن:</span><span class="info-value">${order.shippingRate.name}</span></div>` : ''}
            ${order.weight ? `<div class="info-item"><span class="info-label">الوزن:</span><span class="info-value">${order.weight} كجم</span></div>` : ''}
            <div class="info-item">
              <span class="info-label">تاريخ الإنشاء:</span>
              <span class="info-value">${format(new Date(order.createdAt), 'dd MMMM yyyy', { locale: ar })}</span>
            </div>
            <div class="info-item">
              <span class="info-label">الحالة:</span>
              <span class="info-value">تم التسليم / Delivered</span>
            </div>
          </div>

          ${order.notes ? `
            <div class="notes">
              <strong>ملاحظات / Notes:</strong><br>
              ${order.notes.replace(/\n/g, '<br>')}
            </div>
          ` : ''}
        </div>

        <!-- Footer -->
        <div class="footer">
          <p>شكراً لتعاملكم معنا</p>
        </div>
      </div>
    </body>
    </html>
  `;

  // Create a temporary div to render the HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = invoiceHTML;
  tempDiv.style.position = 'absolute';
  tempDiv.style.left = '-9999px';
  tempDiv.style.top = '-9999px';
  document.body.appendChild(tempDiv);

  try {
    // Wait for fonts to load
    await document.fonts.ready;

    // Use html2canvas to capture the HTML as an image
    const canvas = await html2canvas(tempDiv, {
      scale: 2, // Higher quality
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: 800,
      height: tempDiv.offsetHeight,
      scrollX: 0,
      scrollY: 0,
    });

    // Create PDF and add the image
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgData = canvas.toDataURL('image/png');

    // Calculate dimensions to fit the page
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    // Add first page
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Add additional pages if needed
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // Save the PDF
    pdf.save(`inv-${order.customer?.code || 'unknown'}-${dateStr}.pdf`);

  } finally {
    // Clean up
    document.body.removeChild(tempDiv);
  }
};