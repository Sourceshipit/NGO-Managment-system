import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, AlertCircle, CheckCircle, X, Download } from 'lucide-react';

interface ParsedRow {
  [key: string]: string;
}

interface BulkUploadProps {
  /** Column headers expected in CSV */
  expectedColumns: string[];
  /** Label for the upload context e.g. "CHILDREN", "DONORS" */
  entityLabel: string;
  /** Called with valid parsed rows */
  onUpload: (rows: ParsedRow[]) => Promise<void>;
  /** Optional CSV template download data */
  templateData?: string;
}

function parseCSV(text: string): { headers: string[]; rows: ParsedRow[] } {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return { headers: [], rows: [] };

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  const rows: ParsedRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    if (values.length !== headers.length) continue;

    const row: ParsedRow = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx];
    });
    rows.push(row);
  }

  return { headers, rows };
}

const BulkUpload: React.FC<BulkUploadProps> = ({
  expectedColumns,
  entityLabel,
  onUpload,
  templateData,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ParsedRow[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((f: File) => {
    setSuccess(false);
    setErrors([]);

    if (!f.name.endsWith('.csv')) {
      setErrors(['Only CSV files are accepted.']);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const { headers: h, rows } = parseCSV(text);

      // Validate headers
      const missing = expectedColumns.filter(
        col => !h.includes(col.toLowerCase())
      );

      if (missing.length > 0) {
        setErrors([`Missing columns: ${missing.join(', ')}`]);
        return;
      }

      if (rows.length === 0) {
        setErrors(['CSV contains no data rows.']);
        return;
      }

      setFile(f);
      setHeaders(h);
      setPreview(rows.slice(0, 5));
    };
    reader.readAsText(f);
  }, [expectedColumns]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [handleFile]);

  const handleSubmit = async () => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      const { rows } = parseCSV(text);

      setUploading(true);
      try {
        await onUpload(rows);
        setSuccess(true);
        setFile(null);
        setPreview([]);
      } catch (err: any) {
        setErrors([err.message || 'Upload failed']);
      } finally {
        setUploading(false);
      }
    };
    if (file) reader.readAsText(file);
  };

  const handleTemplateDownload = () => {
    if (!templateData) return;
    const blob = new Blob([templateData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${entityLabel.toLowerCase()}_template.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    setFile(null);
    setPreview([]);
    setHeaders([]);
    setErrors([]);
    setSuccess(false);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-[10px] font-bold text-black uppercase tracking-[0.2em] font-mono">
          BULK_UPLOAD : {entityLabel}
        </h3>
        {templateData && (
          <button
            onClick={handleTemplateDownload}
            className="flex items-center gap-1.5 text-[9px] font-mono uppercase tracking-widest text-brand-primary hover:underline"
          >
            <Download size={10} />
            DOWNLOAD_TEMPLATE
          </button>
        )}
      </div>

      {/* Drop zone */}
      {!file && !success && (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-black p-10 text-center cursor-pointer hover:bg-slate-50 transition-colors group"
        >
          <Upload
            size={28}
            className="mx-auto mb-3 text-slate-400 group-hover:text-brand-primary transition-colors"
          />
          <p className="text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-1">
            DRAG_CSV_OR_CLICK_TO_BROWSE
          </p>
          <p className="text-[8px] font-mono text-slate-400 uppercase tracking-wider">
            Expected: {expectedColumns.join(', ')}
          </p>
          <input
            ref={inputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
        </div>
      )}

      {/* Errors */}
      <AnimatePresence>
        {errors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="border-2 border-brand-danger bg-red-50 p-3"
          >
            {errors.map((err, i) => (
              <div key={i} className="flex items-center gap-2 text-[10px] font-mono text-red-700 uppercase tracking-wider">
                <AlertCircle size={12} />
                {err}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview */}
      {preview.length > 0 && (
        <div className="border-2 border-black">
          <div className="flex items-center justify-between bg-slate-100 px-4 py-2 border-b-2 border-black">
            <div className="flex items-center gap-2">
              <FileText size={12} />
              <span className="text-[9px] font-mono uppercase tracking-widest font-bold">
                PREVIEW : {file?.name}
              </span>
            </div>
            <button onClick={reset} className="w-5 h-5 border border-black flex items-center justify-center hover:bg-slate-200 transition-colors">
              <X size={10} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-[9px] font-mono">
              <thead>
                <tr className="bg-slate-50 border-b border-black">
                  {headers.map((h) => (
                    <th key={h} className="px-3 py-2 text-left uppercase tracking-widest font-bold text-slate-600 border-r border-slate-200 last:border-r-0">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.map((row, i) => (
                  <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                    {headers.map((h) => (
                      <td key={h} className="px-3 py-1.5 text-slate-700 border-r border-slate-100 last:border-r-0">
                        {row[h]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-t border-black">
            <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest">
              Showing 5 of {file ? 'file' : '?'} rows
            </span>
            <button
              onClick={handleSubmit}
              disabled={uploading}
              className="px-6 py-2 bg-brand-primary text-white text-[10px] font-bold font-mono uppercase tracking-widest border-2 border-black shadow-brutal-sm hover:shadow-brutal transition-shadow disabled:opacity-50"
            >
              {uploading ? 'UPLOADING…' : `UPLOAD_${entityLabel}`}
            </button>
          </div>
        </div>
      )}

      {/* Success state */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="border-2 border-brand-success bg-green-50 p-6 text-center"
          >
            <CheckCircle size={28} className="mx-auto mb-2 text-brand-success" />
            <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-green-700">
              UPLOAD_COMPLETE
            </p>
            <button
              onClick={reset}
              className="mt-3 text-[9px] font-mono uppercase tracking-widest text-brand-primary hover:underline"
            >
              UPLOAD_ANOTHER
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BulkUpload;
