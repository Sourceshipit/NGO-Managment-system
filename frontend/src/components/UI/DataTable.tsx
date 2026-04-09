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

/* #11 — Branded empty state with blueprint grid background */
function EmptyState({ message = 'NO_RECORDS_FOUND' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4 relative">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(0,0,0,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,1) 1px, transparent 1px)',
          backgroundSize: '2rem 2rem'
        }}
      />
      <div className="w-16 h-16 border-2 border-dashed border-black/20 flex items-center justify-center relative z-10">
        <FolderOpen size={24} className="text-black/20" />
      </div>
      <div className="text-center relative z-10">
        <p className="text-xs font-bold font-mono text-black/40 uppercase tracking-widest">[ {message} ]</p>
        <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest font-mono">QUERY RETURNED Ø RESULTS</p>
      </div>
    </div>
  );
}

export function DataTable<T extends Record<string, any>>({ 
  columns, 
  data, 
  isLoading = false, 
  emptyMessage = "NO_RECORDS_FOUND",
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
    <div className="w-full flex flex-col font-mono">
      {searchable && (
        <div className="mb-4 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-black" size={16} />
          <input
            type="text"
            placeholder="SEARCH_DATASTREAM..."
            className="w-full h-10 pl-10 pr-4 bg-slate-50 border-2 border-black text-black text-xs uppercase tracking-widest focus:outline-none focus:bg-brand-primary/10 transition-colors"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      )}
      
      <div className="overflow-x-auto border-2 border-black bg-white shadow-[8px_8px_0_rgba(0,0,0,0.1)]">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#050505] border-b-2 border-black text-brand-primary uppercase font-bold text-[10px] tracking-widest relative z-10">
            <tr>
              {columns.map((col, idx) => (
                <th 
                  key={idx} 
                  className={`px-4 py-3 border-r border-white/10 last:border-r-0 ${col.sortable ? 'cursor-pointer hover:bg-brand-primary hover:text-black transition-colors' : ''}`}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <div className="flex items-center gap-2">
                    {col.header}
                    {col.sortable && sortConfig?.key === col.key && (
                      <span className="text-white bg-white/20 px-1 ml-auto">
                        {sortConfig.direction === 'asc' ? 'ASC' : 'DESC'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-black">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse bg-slate-50">
                  {columns.map((_, j) => (
                    <td key={j} className="px-4 py-3 border-r border-black last:border-r-0">
                      <div className="h-4 bg-slate-200 w-full max-w-[80%] border border-black/10"></div>
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
                /* #7 — Enhanced row hover with left-bar indicator */
                <tr key={i} className="bg-white hover:bg-slate-50 transition-all group relative">
                  {columns.map((col, j) => (
                    <td key={j} className={`px-4 py-3 text-black text-xs whitespace-nowrap border-r border-black/10 last:border-r-0 group-hover:border-black/30 transition-colors ${j === 0 ? 'relative' : ''}`}>
                      {/* Left-bar indicator on first cell */}
                      {j === 0 && (
                        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-brand-primary scale-y-0 group-hover:scale-y-100 transition-transform origin-top duration-200" />
                      )}
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
