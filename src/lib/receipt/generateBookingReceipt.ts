import jsPDF from 'jspdf';
import { format } from 'date-fns';
import logoUrl from '@/assets/eventpro-logo.png';

export interface ReceiptData {
  receiptNumber: string;
  issuedAt: Date;
  // Booking
  bookingId: string;
  packageName: string;
  vendorName: string;
  eventDate: Date;
  eventLocation: string;
  // Customer
  customerName?: string | null;
  customerEmail?: string | null;
  // Money (all in dollars, numbers)
  totalPrice: number;
  depositAmount: number;
  finalAmount: number;
  platformFee?: number | null;
  // Payment
  paymentMethod?: string | null;
  paymentStatus?: string | null;
  depositPaidAt?: Date | null;
  finalPaidAt?: Date | null;
  stripePaymentIntentId?: string | null;
  stripeSessionId?: string | null;
}

const BRAND = {
  ink: [10, 10, 10] as [number, number, number],
  muted: [110, 110, 110] as [number, number, number],
  hairline: [225, 225, 225] as [number, number, number],
  accent: [0, 0, 0] as [number, number, number],
};

async function loadImageAsDataUrl(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

const usd = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

export async function generateBookingReceipt(data: ReceiptData): Promise<jsPDF> {
  const doc = new jsPDF({ unit: 'pt', format: 'letter' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 56;
  let y = margin;

  // Header band
  const logo = await loadImageAsDataUrl(logoUrl);
  if (logo) {
    try {
      doc.addImage(logo, 'PNG', margin, y, 110, 32, undefined, 'FAST');
    } catch {}
  }

  // Right-side header meta
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(...BRAND.ink);
  doc.text('RECEIPT', pageW - margin, y + 14, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...BRAND.muted);
  doc.text(`No. ${data.receiptNumber}`, pageW - margin, y + 30, { align: 'right' });
  doc.text(`Issued ${format(data.issuedAt, 'PPP')}`, pageW - margin, y + 42, { align: 'right' });

  y += 70;

  // Hairline
  doc.setDrawColor(...BRAND.hairline);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageW - margin, y);
  y += 24;

  // Issuer / Customer columns
  const colW = (pageW - margin * 2 - 24) / 2;

  const labelStyle = () => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...BRAND.muted);
  };
  const valueStyle = () => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...BRAND.ink);
  };

  labelStyle();
  doc.text('FROM', margin, y);
  doc.text('BILLED TO', margin + colW + 24, y);
  y += 14;

  valueStyle();
  doc.setFont('helvetica', 'bold');
  doc.text('EventPro by Vendibook', margin, y);
  doc.text(data.customerName || data.customerEmail || 'Customer', margin + colW + 24, y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...BRAND.muted);
  doc.setFontSize(9);
  doc.text('eventpro.vendibook.com', margin, y + 14);
  doc.text('support@vendibook.com', margin, y + 26);
  if (data.customerEmail && data.customerName) {
    doc.text(data.customerEmail, margin + colW + 24, y + 14);
  }

  y += 56;

  // Booking summary panel
  doc.setDrawColor(...BRAND.hairline);
  doc.setFillColor(250, 250, 250);
  doc.roundedRect(margin, y, pageW - margin * 2, 96, 8, 8, 'FD');

  const panelPad = 16;
  const px = margin + panelPad;
  let py = y + panelPad + 4;

  labelStyle();
  doc.text('PACKAGE', px, py);
  doc.text('EVENT PRO', px + colW / 1.2, py);
  doc.text('EVENT DATE', pageW - margin - panelPad - 110, py);

  valueStyle();
  doc.setFont('helvetica', 'bold');
  doc.text(truncate(data.packageName, 28), px, py + 16);
  doc.text(truncate(data.vendorName, 24), px + colW / 1.2, py + 16);
  doc.text(format(data.eventDate, 'MMM d, yyyy'), pageW - margin - panelPad - 110, py + 16);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...BRAND.muted);
  doc.text('Location', px, py + 38);
  doc.setTextColor(...BRAND.ink);
  doc.text(truncate(data.eventLocation, 90), px, py + 52);

  y += 96 + 32;

  // Line items table
  labelStyle();
  doc.text('DESCRIPTION', margin, y);
  doc.text('AMOUNT', pageW - margin, y, { align: 'right' });
  y += 8;
  doc.setDrawColor(...BRAND.ink);
  doc.setLineWidth(0.75);
  doc.line(margin, y, pageW - margin, y);
  y += 18;

  const addRow = (label: string, sub: string | null, amount: number, opts?: { bold?: boolean; muted?: boolean }) => {
    doc.setFont('helvetica', opts?.bold ? 'bold' : 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...(opts?.muted ? BRAND.muted : BRAND.ink));
    doc.text(label, margin, y);
    if (sub) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...BRAND.muted);
      doc.text(sub, margin, y + 12);
    }
    doc.setFont('helvetica', opts?.bold ? 'bold' : 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...(opts?.muted ? BRAND.muted : BRAND.ink));
    doc.text(usd(amount), pageW - margin, y, { align: 'right' });
    y += sub ? 30 : 22;
  };

  // Show actual paid items
  if (data.depositAmount > 0) {
    addRow(
      'Deposit',
      data.depositPaidAt ? `Paid ${format(data.depositPaidAt, 'PPp')}` : 'Reserves your event date',
      data.depositAmount,
    );
  }
  if (data.finalAmount > 0) {
    addRow(
      'Final balance',
      data.finalPaidAt ? `Paid ${format(data.finalPaidAt, 'PPp')}` : 'Due on event day',
      data.finalAmount,
      { muted: !data.finalPaidAt },
    );
  }

  // Subtle separator before total
  doc.setDrawColor(...BRAND.hairline);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageW - margin, y);
  y += 18;

  // Total
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...BRAND.ink);
  doc.text('TOTAL', margin, y);
  doc.setFontSize(14);
  doc.text(usd(data.totalPrice), pageW - margin, y, { align: 'right' });
  y += 10;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...BRAND.muted);
  doc.text('Includes 12.9% platform service fee', pageW - margin, y + 8, { align: 'right' });

  y += 36;

  // Payment details block
  doc.setDrawColor(...BRAND.hairline);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageW - margin, y);
  y += 20;

  labelStyle();
  doc.text('PAYMENT DETAILS', margin, y);
  y += 16;

  const kv = (k: string, v: string) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...BRAND.muted);
    doc.text(k, margin, y);
    doc.setTextColor(...BRAND.ink);
    doc.text(v, margin + 140, y);
    y += 14;
  };

  kv('Booking ID', data.bookingId);
  kv('Payment method', humanMethod(data.paymentMethod));
  kv('Status', humanStatus(data.paymentStatus));
  if (data.stripePaymentIntentId) kv('Stripe Payment Intent', data.stripePaymentIntentId);
  if (data.stripeSessionId) kv('Stripe Session', data.stripeSessionId);

  // Footer
  const footerY = pageH - 60;
  doc.setDrawColor(...BRAND.hairline);
  doc.line(margin, footerY, pageW - margin, footerY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...BRAND.muted);
  doc.text(
    'This receipt confirms a transaction processed through EventPro by Vendibook.',
    margin,
    footerY + 16,
  );
  doc.text(
    'Questions? Contact support@vendibook.com — Keep this receipt for your records.',
    margin,
    footerY + 28,
  );
  doc.text(`Page 1 of 1`, pageW - margin, footerY + 28, { align: 'right' });

  return doc;
}

function truncate(s: string, n: number) {
  if (!s) return '';
  return s.length > n ? s.slice(0, n - 1) + '…' : s;
}

function humanMethod(m?: string | null) {
  if (!m) return 'Card (Stripe)';
  if (m === 'stripe') return 'Card (Stripe)';
  if (m === 'cash') return 'Cash';
  return m;
}

function humanStatus(s?: string | null) {
  if (!s) return 'Paid';
  return s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function buildReceiptNumber(bookingId: string, issuedAt: Date) {
  const ymd = format(issuedAt, 'yyyyMMdd');
  const short = bookingId.replace(/-/g, '').slice(0, 6).toUpperCase();
  return `EP-${ymd}-${short}`;
}
