import React, { useState } from 'react';
import { Search, FolderOpen } from 'lucide-react';

export interface ColumnDef<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
}

interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  isLoading?: boolean;
  emptyMessage?: string;
  searchable?: boolean;
}

function EmptyState({ message = 'No records found' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <div className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center">
        <FolderOpen size={24} className="text-slate-400" />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-brand-muted">{message}</p>
        <p className="text-xs text-slate-400 mt-1">Try adjusting your filters or search terms</p>
      </div>
    </div>
  );
}

export function DataTable<T extends Record<string, any>>({ 
  columns, 
  data, 
  isLoading = false, 
  emptyMessage = "No records found",
  searchable = false
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{key: string, direction: 'asc'|'desc'} | null>(null);

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredData = data.filter(item => 
    searchTerm === "" || JSON.stringify(item).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortConfig) return 0;
    const aVal = a[sortConfig.key];
    const bVal = b[sortConfig.key];
    if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  return (
    <div className="w-full flex flex-col">
      {searchable && (
        <div className="mb-4 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search records..."
            className="input-field pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      )}
      
      <div className="overflow-x-auto border border-brand-border rounded-xl bg-white shadow-card">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-brand-border text-xs font-semibold text-brand-muted uppercase tracking-wider">
            <tr>
              {columns.map((col, idx) => (
                <th 
                  key={idx} 
                  className={`px-4 py-3 ${col.sortable ? 'cursor-pointer hover:text-brand-text hover:bg-slate-100 transition-colors' : ''}`}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <div className="flex items-center gap-2">
                    {col.header}
                    {col.sortable && sortConfig?.key === col.key && (
                      <span className="text-brand-primary text-[10px] font-semibold bg-brand-primary-light rounded px-1.5 py-0.5">
                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {columns.map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-4 bg-slate-100 rounded-md w-3/4"></div>
                    </td>
                  ))}
                </tr>
              ))
            ) : sortedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length}>
                  <EmptyState message={emptyMessage} />
                </td>
              </tr>
            ) : (
              sortedData.map((row, i) => (
                <tr key={i} className="bg-white hover:bg-slate-50/80 transition-colors group">
                  {columns.map((col, j) => (
                    <td key={j} className="px-4 py-3 text-sm text-brand-text whitespace-nowrap">
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
