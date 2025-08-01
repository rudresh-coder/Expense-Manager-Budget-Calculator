import { useState, useEffect } from "react";
import Tesseract from "tesseract.js";

interface ReceiptData {
  vendor: string;
  date: string;
  total: string;
  items: string[];
  raw: string;
}

export default function ReceiptScanner({ onExtract }: { onExtract: (data: ReceiptData) => void }) {
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [ocrText, setOcrText] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

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

  function parseReceipt(text: string) {
    const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
    const vendor = extractVendor(lines);
    const date = extractDate(lines);
    const total = extractTotal(lines);
    const items = extractItems(lines);
    return { vendor, date, total, items, raw: text };
  }

  function extractVendor(lines: string[]): string {
    for (let i = 0; i < Math.min(5, lines.length); i++) {
      const line = lines[i];
      if (
        line &&
        !/receipt|invoice|date|total|amount|cash|card|address|phone/i.test(line) &&
        !/\d/.test(line) &&
        line.length > 2
      ) {
        return line;
      }
    }
    return lines[0] || "";
  }

  function extractDate(lines: string[]): string {
    const dateRegex = /\b(\d{1,2}[/\-.]\d{1,2}[/\-.]\d{2,4}|\d{4}[/\-.]\d{1,2}[/\-.]\d{1,2})\b/;
    for (const line of lines) {
      const match = line.match(dateRegex);
      if (match) return match[0];
    }
    return "";
  }

  function extractTotal(lines: string[]): string {
    const totalRegex = /(total|amount due|grand total)[^\d]*([\d,.]+)/i;
    for (const line of lines) {
      const match = line.match(totalRegex);
      if (match) return match[2];
    }
    // Fallback: find the largest number in the last 10 lines
    let max = 0, found = "";
    for (const line of lines.slice(-10)) {
      const nums = line.match(/([\d,.]+)/g);
      if (nums) {
        for (const num of nums) {
          const val = parseFloat(num.replace(/,/g, ""));
          if (val > max) {
            max = val;
            found = num;
          }
        }
      }
    }
    return found;
  }

  function extractItems(lines: string[]): string[] {
    const items: string[] = [];
    for (const line of lines) {
      // Match lines with at least one word and a price (₹ or Rs or digits)
      if (
        /\b([A-Za-z]+.*?)(₹|Rs\.?|[0-9]{1,3}(?:[.,][0-9]{2})?)\b/.test(line) &&
        !/total|amount|grand|tax|date|invoice|cash|card/i.test(line)
      ) {
        items.push(line);
      }
      // Or lines that start with a quantity and a word
      else if (/^\d+\s+\w+/.test(line)) {
        items.push(line);
      }
    }
    return items;
  }

  return (
    <div>
      <label htmlFor="receipt-image" style={{ fontWeight: 500, marginRight: 8 }}>
        Upload Receipt Image
      </label>
      <input
        id="receipt-image"
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleImageChange}
        aria-label="Upload receipt image"
      />
      {previewUrl && (
        <div style={{ margin: "1rem 0" }}>
          <img
            src={previewUrl}
            alt="Receipt preview"
            style={{ maxWidth: 320, maxHeight: 240, borderRadius: 8, boxShadow: "0 2px 8px #a78bfa22" }}
          />
        </div>
      )}
      <button
        onClick={handleScan}
        disabled={!image || loading}
        aria-label="Scan receipt for items"
      >
        {loading ? <span className="spinner" aria-label="Scanning..."></span> : null}
        {loading ? "Scanning..." : "Scan Receipt"}
      </button>
      {error && <div style={{ color: "red" }}>{error}</div>}
      {ocrText && (
        <pre style={{ whiteSpace: "pre-wrap", background: "#f7f7f7", padding: 8 }}>
          {ocrText}
        </pre>
      )}
    </div>
  );
}