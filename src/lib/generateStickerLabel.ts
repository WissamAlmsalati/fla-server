import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import JsBarcode from 'jsbarcode';
import { Order } from '@/features/orders/slices/orderSlice';

/**
 * Generate a sticker label for thermal printer (Xprinter XP-420B)
 * Specs: 4 inch (108mm) width, 203 dpi
 * Label dimensions: 100mm x 150mm (common 4x6 inch shipping label)
 * Design: DHL Replica Style
 */
export const generateStickerLabel = async (order: Order) => {
  // Load the logo
  const logoResponse = await fetch('/photos/logo-with-title.png');
  const logoBlob = await logoResponse.blob();
  const logoBase64 = await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(logoBlob);
  });

  // Get customer code based on country
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
      case 'CHINA': return 'GUANGZHOU, CN';
      case 'DUBAI': return 'DUBAI, AE';
      case 'USA': return 'DELAWARE, US';
      case 'TURKEY': return 'ISTANBUL, TR';
      default: return 'CHINA';
    }
  };

  const getCountryName = () => {
    switch (order.country) {
      case 'CHINA': return 'CN';
      case 'DUBAI': return 'UAE';
      case 'USA': return 'USA';
      case 'TURKEY': return 'TR';
      default: return order.country ? order.country.substring(0, 3).toUpperCase() : 'CN';
    }
  };

  const getShippingType = () => {
    // If AIR/SEA is not explicitly set, default to EXPRESS
    if (order.shippingRate?.type === 'SEA') return 'SEA FREIGHT';
    return 'EXPRESS WORLDWIDE'; // Default for AIR/Standard
  };

  const customerCode = getCustomerCode();
  const customerName = order.customer?.user?.name || 'Valued Customer';
  const displayId = `${order.trackingNumber}`;
  const origin = getOrigin();

  // Create barcode (Primary)
  const barcodeCanvas = document.createElement('canvas');
  JsBarcode(barcodeCanvas, order.trackingNumber, {
    format: 'CODE128',
    width: 3,
    height: 60,
    displayValue: false, // DHL style has text below or above separately
    margin: 0,
  });
  const barcodeDataUrl = barcodeCanvas.toDataURL('image/png');

  // Create Waybill barcode (Secondary - using ID/Ref)
  const waybillCanvas = document.createElement('canvas');
  JsBarcode(waybillCanvas, `WB-${order.id}`, {
    format: 'CODE128',
    width: 2,
    height: 50,
    displayValue: false,
    margin: 0,
  });
  const waybillDataUrl = waybillCanvas.toDataURL('image/png');

  // DHL Replica HTML
  const stickerHTML = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          -webkit-font-smoothing: antialiased;
        }
        body {
          font-family: Arial, sans-serif;
          background: white;
          color: #000;
        }
        .label {
          width: 378px;
          height: 567px;
          background: #fff;
          display: flex;
          flex-direction: column;
          border: 2px solid #000;
          position: relative;
        }
        
        /* HEADER */
        .header {
          display: flex;
          justify-content: space-between;
          border-bottom: 2px solid #000;
          height: 40px;
        }
        .service-text {
          font-weight: 900;
          font-size: 18px;
          text-transform: uppercase;
          padding: 8px 10px;
          letter-spacing: -0.5px;
        }
        .logo-box {
          background: #000;
          color: #fff;
          padding: 0 10px;
          display: flex;
          align-items: center;
          font-weight: 900;
          font-style: italic;
          font-size: 20px;
          letter-spacing: 1px;
        }
        .logo-img {
          height: 20px;
          filter: brightness(0) invert(1);
          margin-right: 5px;
        }

        /* FROM SECTION */
        .from-section {
          padding: 5px 10px;
          border-bottom: 1px solid #000;
          position: relative;
          height: 60px;
        }
        .section-lbl {
          font-size: 10px;
          font-weight: 700;
          margin-bottom: 2px;
          position: absolute;
          top: 5px;
          left: 10px;
        }
        .address-text {
          font-size: 10px;
          line-height: 1.2;
          margin-left: 35px; /* Indent for 'From:' label */
        }
        .origin-code {
          position: absolute;
          top: 5px;
          right: 10px;
          font-size: 24px;
          font-weight: 900;
        }

        /* TO SECTION */
        .to-section {
          padding: 5px 10px;
          border-bottom: 2px solid #000;
          position: relative;
          height: 80px;
        }
        .consignee-info {
          font-size: 13px;
          font-weight: 700;
          margin-left: 35px;
          line-height: 1.3;
        }
        .dest-city {
          font-size: 16px;
          font-weight: 900;
          margin-top: 5px;
          text-transform: uppercase;
        }
        
        /* BIG ROUTING CODE (Like HK-HKG-HKC) */
        .routing-code-section {
          text-align: center;
          border-bottom: 2px solid #000;
          padding: 5px 0;
          background: #fff;
        }
        .routing-text {
          font-size: 32px;
          font-weight: 900;
          text-transform: uppercase;
          line-height: 1;
        }

        /* PRODUCT BAR */
        .product-bar {
          display: flex;
          height: 35px;
          border-bottom: 2px solid #000;
        }
        .product-code {
          background: #000;
          color: #fff;
          font-size: 24px;
          font-weight: 900;
          padding: 0 10px;
          display: flex;
          align-items: center;
          width: 80px;
          justify-content: center;
        }
        .ref-area {
          flex: 1;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 10px;
          font-size: 10px;
        }

        /* WEIGHT / PIECE ROW */
        .details-row {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          padding: 5px 15px;
          border-bottom: 2px solid #000;
          height: 35px;
        }
        .weight-large {
          font-size: 20px;
          font-weight: 900;
          margin-right: 20px;
        }
        .pieces-large {
          font-size: 20px;
          font-weight: 900;
        }

        /* DESCRIPTION TEXT */
        .desc-text {
          font-size: 9px;
          padding: 5px 10px;
          border-bottom: 1px solid #ddd;
          line-height: 1.2;
          height: 30px;
          overflow: hidden;
        }

        /* BARCODE AREA */
        .barcodes-container {
          flex: 1;
          padding: 10px;
          display: flex;
          flex-direction: column;
          justify-content: space-evenly;
          align-items: center;
        }
        
        .barcode-group {
          text-align: center;
          width: 100%;
          margin-bottom: 10px;
        }
        .bc-img {
          width: 90%;
          height: 50px;
        }
        .bc-text {
          font-size: 11px;
          letter-spacing: 1px;
          margin-top: 2px;
          font-weight: 600;
        }

        .waybill-lbl {
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-weight: 700;
          margin-bottom: 2px;
        }

      </style>
    </head>
    <body>
      <div class="label">
        <!-- HEADER -->
        <div class="header">
          <div class="service-text">${getShippingType()}</div>
          <div class="logo-box">
             <img src="${logoBase64}" class="logo-img"> ALWALA
          </div>
        </div>

        <!-- FROM -->
        <div class="from-section">
          <div class="section-lbl">From :</div>
          <div class="address-text">
            Alwala Shipping - ${getCountryName()}<br>
            International Logistics Center<br>
            ${getOrigin()}
          </div>
          <div class="origin-code">${getCountryName().substring(0, 3)}</div>
        </div>

        <!-- TO -->
        <div class="to-section">
          <div class="section-lbl">To :</div>
          <div class="consignee-info">
            ${customerName}<br>
            CODE: <strong>${customerCode}</strong><br>
            Tripoli, Libya
            <div class="dest-city">TRIPOLI - LIBYA</div>
          </div>
        </div>

        <!-- BIG ROUTING CODE -->
        <div class="routing-code-section">
           <div class="routing-text">TIP-LY-TRI</div>
        </div>

        <!-- PRODUCT BLACK BAR -->
        <div class="product-bar">
          <div class="product-code">${order.country?.substring(0, 2) || 'CN'}</div>
          <div class="ref-area">
             <span>Ref: ${displayId}</span>
             <span>Day: ${new Date().getDate()}</span>
             <span>Time: ${new Date().getHours()}:${new Date().getMinutes()}</span>
          </div>
        </div>

        <!-- WEIGHT & PIECES -->
        <div class="details-row">
           <div class="weight-large">${order.weight || '0.5'} kg</div>
           <div class="pieces-large">1 / 1</div>
        </div>

        <!-- DESCRIPTION -->
        <div class="desc-text">
          Contents: ${order.name}<br>
          Valuation: $${order.usdPrice}
        </div>

        <!-- BARCODES -->
        <div class="barcodes-container">
          <!-- WAYBILL -->
          <div class="barcode-group">
            <div class="waybill-lbl">WAYBILL ${order.trackingNumber}</div>
            <img src="${barcodeDataUrl}" class="bc-img">
          </div>
          
          <!-- SECONDARY CODE -->
          <div class="barcode-group">
            <img src="${waybillDataUrl}" class="bc-img" style="height: 40px;">
            <div class="bc-text">(${customerCode}) ${displayId}</div>
          </div>
        </div>

      </div>
    </body>
    </html>
  `;

  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = stickerHTML;
  tempDiv.style.position = 'absolute';
  tempDiv.style.left = '-9999px';
  tempDiv.style.top = '-9999px';
  document.body.appendChild(tempDiv);

  try {
    await document.fonts.ready;
    const canvas = await html2canvas(tempDiv, {
      scale: 3,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: 378,
      height: 567,
    });

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [100, 150],
    });

    const imgData = canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', 0, 0, 100, 150);
    pdf.save(`${order.trackingNumber}.pdf`);
  } finally {
    document.body.removeChild(tempDiv);
  }
};
