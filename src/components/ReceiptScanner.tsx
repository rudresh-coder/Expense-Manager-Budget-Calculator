import { useState, useEffect, useRef } from "react";
import Tesseract from "tesseract.js";
import './ReceiptScanner.css';

interface ReceiptData {
  vendor: string;
  address: string;
  gstin: string;
  receiptNumber: string;
  customerName: string;
  date: string;
  time: string;
  paymentMode: string;
  items: {
    name: string;
    quantity: number;
    unitPrice: number;
    hsn: string;
    total: number; 
    discount?: number;
    freebie?: string;
  }[];
  cgst: number;
  sgst: number;
  igst: number;
  subtotal: number;
  discount: number;
  taxTotal: number;
  grandTotal: number;
  total?: number; 
  authorization: string;
  raw:string;
}

export default function ReceiptScanner({ onExtract }: { onExtract: (data: ReceiptData) => void }) {
  const [image,setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [ocrText, setOcrText] = useState("");
  const [error, setError] = useState("");
  const ocrTextRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  useEffect(() => {
    if (ocrTextRef.current) {
      ocrTextRef.current.style.height = "auto";
      ocrTextRef.current.style.height = ocrTextRef.current.scrollHeight + "px";
    }
  }, [ocrText]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]); 
      setPreviewUrl(URL.createObjectURL(e.target.files[0]));
      setOcrText("");
      setError("");
    }
  };

  const handleScan = async () => {
    if (!image) return;
    setLoading(true);
    setError("");
    try {
      const { data } = await Tesseract.recognize(image, "eng");
      setOcrText(data.text);
      // Parse the OCR text for date, vendor, total, etc.
      const parsed = parseReceipt(data.text);
      onExtract(parsed);
    } catch (err) {
      setError("Failed to scan receipt.");
      console.error(err);
    }
    setLoading(false);
  };

  function handleOcrTextChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setOcrText(e.target.value);
    if (ocrTextRef.current) {
      ocrTextRef.current.style.height = "auto";
      ocrTextRef.current.style.height = ocrTextRef.current.scrollHeight + "px";
    }
  }

  function parseReceipt(text: string): ReceiptData {
    const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
    let vendor = extractVendor(lines);
    let date = extractDate(lines);
    let total = extractGrandTotal(lines);

    if (!vendor || !date || !total) {
      const fallback = fallbackExtract(lines);
      vendor = vendor || fallback.vendor;
      date = date || fallback.date;
      total = total || fallback.total;
    }

    return {
      vendor,
      address: extractAddress(lines),
      gstin: extractGSTIN(lines),
      receiptNumber: extractReceiptNumber(lines),
      customerName: extractCustomerName(lines),
      date,
      time: extractTime(lines),
      paymentMode: extractPaymentMode(lines),
      items: extractItems(lines),
      cgst: extractTax(lines, "cgst"),
      sgst: extractTax(lines, "sgst"),
      igst: extractTax(lines, "igst"),
      subtotal: extractSubtotal(lines),
      discount: extractDiscount(lines),
      taxTotal: extractTaxTotal(lines),
      grandTotal: extractGrandTotal(lines),
      authorization: extractAuthorization(lines),
      raw: text
    };
  }

  function extractVendor(lines: string[]): string {
    // Look for business name in header (first 5 lines)
    for (let i = 0; i < Math.min(5, lines.length); i++) {
      if (
        lines[i] &&
        !/invoice|gstin|address|contact|receipt|cash memo|tax/i.test(lines[i])
      ) {
        return lines[i];
      }
    }
    return "";
  }

  function extractAddress(lines: string[]): string {
    return lines.find(line => /address/i.test(line)) || "";
  }

  function extractGSTIN(lines: string[]): string {
    const gstPatterns = [
      /GSTIN[:\s-]*([0-9A-Z]+)/i,
      /GST\s*No[:\s-]*([0-9A-Z]+)/i,
      /GST\s*Number[:\s-]*([0-9A-Z]+)/i,
      /GSTIN\s*No[:\s-]*([0-9A-Z]+)/i,
      /GST\s*Registration[:\s-]*([0-9A-Z]+)/i,
    ];
    for (const line of lines) {
      for (const pattern of gstPatterns) {
        const match = line.match(pattern);
        if (match) return match[1];
      }
    }
    return "";
  }

  function extractReceiptNumber(lines: string[]): string {
    const receiptPatterns = [
      /(?:Receipt|Invoice|Bill)[\s\-#:]*([A-Za-z0-9-]+)/i,
      /ReceiptNumber[:\s-]*([A-Za-z0-9-]+)/i,
      /Receipt\s*ID[:\s-]*([A-Za-z0-9-]+)/i,
      /Txn\s*ID[:\s-]*([A-Za-z0-9-]+)/i,
    ];
    for (const line of lines) {
      for (const pattern of receiptPatterns) {
        const match = line.match(pattern);
        if (match) return match[1];
      }
    }
    return "";
  }

  function extractDate(lines: string[]): string {
    const dateRegex = /\b(\d{1,2}[/\-.]\d{1,2}[/\-.]\d{2,4}|\d{4}[/\-.]\d{1,2}[/\-.]\d{1,2})\b/;
    for (const line of lines) {
      const match = line.match(dateRegex);
      if (match) return match[0];
    }
    return "";
  }

  const itemPatterns = [
    /^([A-Za-z0-9\s-]+)\s+(\d+)\s+₹?([\d.]+)\s+([0-9]{4,6})\s+₹?([\d.]+)\s+₹?([\d.]+)?\s*(Free|Complimentary)?\s*([A-Za-z0-9\s-]+)?/,
    /^([A-Za-z0-9\s-]+)\s+(\d+)\s+₹?([\d.]+)\s+₹?([\d.]+)\s+₹?([\d.]+)?\s*(Free|Complimentary)?\s*([A-Za-z0-9\s-]+)?/,
    /^Free[:\s-]*([A-Za-z0-9\s-]+)/i,
    /^Complimentary[:\s-]*([A-Za-z0-9\s-]+)/i,
    /^([A-Za-z0-9\s-]+)\s+Free$/i,
    /^([A-Za-z0-9\s-]+)\s+(\d+)\s+₹?([\d.]+)\s+([0-9]{4,6})\s+₹?([\d.]+)/,
    /^([A-Za-z0-9\s-]+)\s+(\d+)\s+₹?([\d.]+)\s+₹?([\d.]+)/,
    /^([A-Za-z0-9\s-]+)\s+₹?([\d.]+)\s+(\d+)\s+₹?([\d.]+)/,
    /^([A-Za-z0-9\s-]+)\s+(\d+)\s+₹?([\d.]+)/,
    /^([A-Za-z0-9\s-]+)\s+₹?([\d.]+)$/,
  ];

  function extractItems(lines: string[]): ReceiptData["items"] {
    const items: ReceiptData["items"] = [];
    for (const line of lines) {
      for (const pattern of itemPatterns) {
        const match = line.match(pattern);
        if (match) {
          const name = match[1]?.trim() || "";
          const quantity = match[2] ? parseInt(match[2]) : 1;
          const unitPrice = match[3] ? parseFloat(match[3]) : 0;
          const hsn = match[4] && /^\d{4,6}$/.test(match[4]) ? match[4] : "";
          const total = match[5]
            ? parseFloat(match[5])
            : match[4] && !hsn
            ? parseFloat(match[4])
            : match[3] && !quantity
            ? parseFloat(match[3])
            : 0;
          const discount = match[6] ? parseFloat(match[6]) : 0;
          const freebie = match[8] ? match[8].trim() : "";

          // Freebie only patterns
          if (pattern === itemPatterns[2] || pattern === itemPatterns[3]) {
            items.push({
              name: match[1].trim(),
              quantity: 1,
              unitPrice: 0,
              hsn: "",
              total: 0,
              discount: 0,
              freebie: match[1].trim(),
            });
            break;
          }
          // Name Free pattern
          if (pattern === itemPatterns[4]) {
            items.push({
              name: match[1].trim(),
              quantity: 1,
              unitPrice: 0,
              hsn: "",
              total: 0,
              discount: 0,
              freebie: match[1].trim(),
            });
            break;
          }

          items.push({
            name,
            quantity,
            unitPrice,
            hsn,
            total,
            discount,
            freebie,
          });
          break;
        }
      }
    }
    return items.filter(item => item.name);
  }

  function extractTime(lines: string[]): string {
    const timeRegex = /\b(\d{1,2}[:.]\d{2}(?:\s?[APMapm]{2})?)\b/;
    for (const line of lines) {
      const match = line.match(timeRegex);
      if (match) return match[0];
    }
    return "";
  }

  function extractCustomerName(lines: string[]): string {
    const patterns = [
      /Customer\s*Name[:\s-]*([A-Za-z\s]+)/i,
      /Cust\s*Name[:\s-]*([A-Za-z\s]+)/i,
      /Customer[:\s-]*([A-Za-z\s]+)/i,
      /Cust[:\s-]*([A-Za-z\s]+)/i,
      /Buyer[:\s-]*([A-Za-z\s]+)/i,
      /Sold\s*To[:\s-]*([A-Za-z\s]+)/i,
    ];
    for (const line of lines) {
      for (const pattern of patterns) {
        const match = line.match(pattern);
        if (match) return match[1].trim();
      }
    }
    return "";
  }

  function extractPaymentMode(lines: string[]): string {
    const paymentPatterns = [
      /Payment\s*Mode[:\s-]*([A-Za-z0-9\s]+)/i,
      /Mode\s*of\s*Payment[:\s-]*([A-Za-z0-9\s]+)/i,
      /Paid\s*By[:\s-]*([A-Za-z0-9\s]+)/i,
      /PaymentMethod[:\s-]*([A-Za-z0-9\s]+)/i,
      /Pay\s*Via[:\s-]*([A-Za-z0-9\s]+)/i,
      /(Cash|Card|UPI|Net\s*Banking)/i, 
    ];
    for (const line of lines) {
      for (const pattern of paymentPatterns) {
        const match = line.match(pattern);
        if (match) return match[1] || match[0];
      }
    }
    return "";
  }

  function extractAuthorization(lines: string[]): string {
    const patterns = [
      /Authorized\s*By[:\s-]*([A-Za-z\s]+)/i,
      /Signature[:\s-]*([A-Za-z\s]+)/i,
      /Stamp[:\s-]*([A-Za-z\s]+)/i,
      /Cashier[:\s-]*([A-Za-z\s]+)/i,
      /POS[:\s-]*([A-Za-z0-9\s]+)/i,
      /Approved\s*By[:\s-]*([A-Za-z\s]+)/i,
      /Processed\s*By[:\s-]*([A-Za-z\s]+)/i,
    ];
    for (const line of lines) {
      for (const pattern of patterns) {
        const match = line.match(pattern);
        if (match) return match[1].trim();
      }
    }
    const fallback = lines.find(line => /authorized|signature|stamp|cashier|pos|approved|processed/i.test(line));
    return fallback || "";
  }

  function extractSubtotal(lines: string[]): number {
    const match = lines.find(line => /subtotal/i.test(line));
    if (match) {
      const numMatch = match.match(/subtotal[:\s]*₹?([\d.]+)/i);
      return numMatch ? parseFloat(numMatch[1]) : 0;
    }
    return 0;
  }

  function extractDiscount(lines: string[]): number {
    const match = lines.find(line => /discount/i.test(line));
    if (match) {
      const numMatch = match.match(/discount[:\s]*₹?([\d.]+)/i);
      return numMatch ? parseFloat(numMatch[1]) : 0;
    }
    return 0;
  }

  function extractTaxTotal(lines: string[]): number {
    const match = lines.find(line => /total\s*tax/i.test(line));
    if (match) {
      const numMatch = match.match(/total\s*tax[:\s]*₹?([\d.]+)/i);
      return numMatch ? parseFloat(numMatch[1]) : 0;
    }
    return 0;
  }

  function extractTax(lines: string[], type: string): number {
    const match = lines.find(line => new RegExp(`${type}`, "i").test(line));
    if (match) {
      const numMatch = match.match(new RegExp(`${type}[:\\s]*₹?([\\d.]+)`, "i"));
      return numMatch ? parseFloat(numMatch[1]) : 0;
    }
    return 0;
  }

  function extractGrandTotal(lines: string[]): number {
    const match = lines.find(line => /(grand\s*total|total\s*amount|amount\s*payable)/i.test(line));
    if (match) {
      const numMatch = match.match(/(?:grand\s*total|total\s*amount|amount\s*payable)[:\s]*₹?([\d.]+)/i);
      return numMatch ? parseFloat(numMatch[1]) : 0;
    }
    return 0;
  }

  function fallbackExtract(lines: string[]) {
    // Largest number as total
    let max = 0, total = "";
    lines.forEach(line => {
      const nums = line.match(/[\d,.]+/g);
      if (nums) {
        nums.forEach(num => {
          const val = parseFloat(num.replace(/,/g, ""));
          if (val > max) {
            max = val;
            total = num;
          }
        });
      }
    });
    // First date-like string
    const dateRegex = /\d{1,2}[/\-.]\d{1,2}[/\-.]\d{2,4}/;
    const date = lines.find(line => dateRegex.test(line)) || "";
    // First line as vendor
    const vendor = lines[0] || "";
    return { vendor, date, total: parseFloat(total.replace(/,/g, "")) || 0 };
  }

  return (
    <div className="receipt-upload-section">
      <label htmlFor="receipt-image" className="receipt-upload-label">
        <span role="img" aria-label="camera" style={{ marginRight: 8 }}>📷</span>
        Upload Receipt Image
      </label>
      <input
        id="receipt-image"
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleImageChange}
        aria-label="Upload receipt image"
        className="receipt-upload-input"
      />

      {previewUrl && (
        <div className="receipt-preview-wrapper">
          <img
            src={previewUrl}
            alt="Receipt preview"
            className="receipt-preview-img"
          />
        </div>
      )}

      <button
        className="receipt-scan-btn"
        onClick={handleScan}
        disabled={!image || loading}
        aria-label="Scan receipt for items"
      >
        {loading ? <span className="spinner" aria-label="Scanning..."></span> : null}
        {loading ? "Scanning..." : "Scan Receipt"}
      </button>

      {error && <div className="receipt-error">{error}</div>}

      {ocrText && (
        <label className="receipt-ocr-label">
          Raw Receipt Text:
          <textarea
            ref={ocrTextRef}
            value={ocrText}
            onChange={handleOcrTextChange}
            onInput={handleOcrTextChange}
            className="receipt-ocr-textarea"
            aria-label="Raw OCR text from receipt"
          />
        </label>
      )}
    </div>
  );
}