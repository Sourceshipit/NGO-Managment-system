import { useState, useEffect, useCallback } from 'react';
import { searchAPI } from '../../api/client';
import type { SearchResults } from '../../types';
import { Search as SearchIcon, Users, Baby, Heart, Briefcase, Loader2, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [debounced, setDebounced] = useState('');

  useEffect(() => { const t = setTimeout(() => setDebounced(query), 400); return () => clearTimeout(t); }, [query]);

  useEffect(() => {
    if (debounced.length < 2) { setResults(null); return; }
    setLoading(true);
    searchAPI.search(debounced).then(setResults).catch(() => toast.error('Search failed')).finally(() => setLoading(false));
  }, [debounced]);

  const total = results ? results.volunteers.length + results.children.length + results.donors.length + results.employees.length : 0;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Search</h1>
      <div className="relative mb-6">
        <SearchIcon className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
        <input value={query} onChange={e => setQuery(e.target.value)} autoFocus
          className="w-full h-12 pl-12 pr-12 bg-white border border-slate-200 rounded-2xl text-base focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 shadow-sm"
          placeholder="Search volunteers, children, donors, employees..." />
        {query && <button onClick={() => { setQuery(''); setResults(null); }} className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>}
        {loading && <Loader2 className="absolute right-12 top-3.5 w-5 h-5 animate-spin text-orange-500" />}
      </div>

      {query.length > 0 && query.length < 2 && <p className="text-sm text-slate-400 text-center">Type at least 2 characters to search</p>}

      {results && (
        <div className="space-y-6">
          <p className="text-sm text-slate-500">{total} result{total !== 1 ? 's' : ''} for "{debounced}"</p>

          {results.volunteers.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-500 uppercase mb-3 flex items-center gap-2"><Users className="w-4 h-4" /> Volunteers ({results.volunteers.length})</h3>
              <div className="space-y-2">{results.volunteers.map(v => (
                <div key={v.id} className="bg-white rounded-xl border p-4 shadow-sm flex items-center gap-4">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold">{v.name.charAt(0)}</div>
                  <div className="flex-1"><p className="font-medium text-slate-800">{v.name}</p><p className="text-xs text-slate-500">{v.total_hours}h logged</p></div>
                  <div className="flex flex-wrap gap-1">{(() => { try { return JSON.parse(v.skills); } catch { return []; }})().map((s: string) => <span key={s} className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-500 rounded-full">{s}</span>)}</div>
                </div>
              ))}</div>
            </div>
          )}

          {results.children.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-500 uppercase mb-3 flex items-center gap-2"><Baby className="w-4 h-4" /> Children ({results.children.length})</h3>
              <div className="space-y-2">{results.children.map(c => (
                <div key={c.id} className="bg-white rounded-xl border p-4 shadow-sm flex items-center gap-4">
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-bold">{c.masked_name.charAt(0)}</div>
                  <div className="flex-1"><p className="font-medium text-slate-800">{c.masked_name}</p><p className="text-xs text-slate-500">{c.program} • {c.branch}</p></div>
                </div>
              ))}</div>
            </div>
          )}

          {results.donors.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-500 uppercase mb-3 flex items-center gap-2"><Heart className="w-4 h-4" /> Donors ({results.donors.length})</h3>
              <div className="space-y-2">{results.donors.map(d => (
                <div key={d.id} className="bg-white rounded-xl border p-4 shadow-sm flex items-center gap-4">
                  <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center text-pink-600 font-bold">{d.name.charAt(0)}</div>
                  <div className="flex-1"><p className="font-medium text-slate-800">{d.name}</p><p className="text-xs text-slate-500">₹{d.total_donated.toLocaleString()} donated</p></div>
                </div>
              ))}</div>
            </div>
          )}

          {results.employees.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-500 uppercase mb-3 flex items-center gap-2"><Briefcase className="w-4 h-4" /> Employees ({results.employees.length})</h3>
              <div className="space-y-2">{results.employees.map(e => (
                <div key={e.id} className="bg-white rounded-xl border p-4 shadow-sm flex items-center gap-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold">{e.name.charAt(0)}</div>
                  <div className="flex-1"><p className="font-medium text-slate-800">{e.name}</p><p className="text-xs text-slate-500">{e.role} • {e.department}</p></div>
                </div>
              ))}</div>
            </div>
          )}

          {total === 0 && <div className="text-center py-16"><SearchIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" /><p className="text-slate-500">No results found for "{debounced}"</p></div>}
        </div>
      )}
    </div>
  );
}
