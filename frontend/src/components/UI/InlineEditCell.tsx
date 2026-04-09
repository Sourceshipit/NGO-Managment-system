import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Check, X, Pencil } from 'lucide-react';

interface InlineEditCellProps {
  value: string;
  onSave: (newValue: string) => Promise<void> | void;
  type?: 'text' | 'number' | 'date';
  placeholder?: string;
  disabled?: boolean;
}

/**
 * Inline-editable table cell. Click pencil → type → Enter to save, Esc to cancel.
 * Brutalist styling: no border-radius, monospace, black borders.
 */
const InlineEditCell: React.FC<InlineEditCellProps> = ({
  value,
  onSave,
  type = 'text',
  placeholder = '—',
  disabled = false,
}) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  // Sync external value changes
  useEffect(() => {
    if (!editing) setDraft(value);
  }, [value, editing]);

  const handleSave = useCallback(async () => {
    if (draft === value) {
      setEditing(false);
      return;
    }
    setSaving(true);
    try {
      await onSave(draft);
      setEditing(false);
    } catch {
      // Keep editing on error
    } finally {
      setSaving(false);
    }
  }, [draft, value, onSave]);

  const handleCancel = () => {
    setDraft(value);
    setEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') handleCancel();
  };

  if (disabled) {
    return (
      <span className="text-[11px] font-mono text-slate-700 uppercase tracking-wider">
        {value || placeholder}
      </span>
    );
  }

  if (!editing) {
    return (
      <div className="flex items-center gap-1.5 group cursor-pointer" onClick={() => setEditing(true)}>
        <span className="text-[11px] font-mono text-slate-700 uppercase tracking-wider">
          {value || placeholder}
        </span>
        <Pencil
          size={10}
          className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
        />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <input
        ref={inputRef}
        type={type}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleSave}
        disabled={saving}
        className="w-full bg-white border-2 border-black px-2 py-1 text-[11px] font-mono uppercase tracking-wider text-black outline-none focus:border-brand-primary disabled:opacity-50"
      />
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-6 h-6 bg-brand-success border border-black flex items-center justify-center shrink-0 hover:brightness-110 transition-all disabled:opacity-50"
      >
        <Check size={10} className="text-white" />
      </button>
      <button
        onClick={handleCancel}
        disabled={saving}
        className="w-6 h-6 bg-slate-200 border border-black flex items-center justify-center shrink-0 hover:bg-slate-300 transition-colors disabled:opacity-50"
      >
        <X size={10} />
      </button>
    </div>
  );
};

export default InlineEditCell;
