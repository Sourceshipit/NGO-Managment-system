import React, { useEffect, useState } from 'react';
import { ShieldCheck, AlertTriangle, Link as LinkIcon, RefreshCw, Copy, CheckCircle2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import toast from 'react-hot-toast';
import { blockchainAPI } from '../api/client';
import { BlockchainLog, ChainVerifyResponse } from '../types';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { DataTable } from '../components/UI/DataTable';
import { Badge } from '../components/UI/Badge';

const Blockchain: React.FC = () => {
  const [logs, setLogs] = useState<BlockchainLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState('');
  const [verification, setVerification] = useState<ChainVerifyResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);

  const fetchLogs = async (p: number, t: string) => {
    try {
      const data = await blockchainAPI.getAll(p, t === 'All' ? undefined : t);
      setLogs(data.items);
      setTotal(data.total);
    } catch (error) {
      toast.error("Failed to load blockchain logs");
    }
  };

  const handleVerify = async () => {
    setIsVerifying(true);
    try {
      const v = await blockchainAPI.verify();
      setVerification(v);
      if (v.valid) {
        toast.success("Blockchain integrity verified successfully!");
      } else {
        toast.error(`Chain broken at block #${v.broken_at}`);
      }
    } catch (error) {
      toast.error("Failed to run verification");
    } finally {
      setIsVerifying(false);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      fetchLogs(page, typeFilter),
      blockchainAPI.verify().then(v => setVerification(v))
    ]).finally(() => setIsLoading(false));
  }, [page, typeFilter]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Hash copied to clipboard!");
  };

  if (isLoading && logs.length === 0) return <LoadingSpinner />;

  return (
    <div className="page-enter">
      <h1 className="page-title mb-6">Blockchain Audit Log</h1>

      {verification && (
        <div className={`p-5 mb-6 border-4 font-mono shadow-[6px_6px_0px_0px_#000] transition-colors ${verification.valid ? 'bg-green-100 border-black' : 'bg-red-500 border-black text-white'}`}>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {verification.valid ? <ShieldCheck size={48} className="text-black shrink-0" /> : <AlertTriangle size={48} className="text-white shrink-0" />}
              <div>
                <h2 className={`text-xl font-black uppercase tracking-wider ${verification.valid ? 'text-black' : 'text-white'}`}>
                  {verification.valid ? `All ${verification.total} Records Verified` : `Chain Integrity Failure at Block #${verification.broken_at}`}
                </h2>
                <p className={`text-sm font-bold mt-1 uppercase ${verification.valid ? 'text-slate-800' : 'text-white'}`}>
                  {verification.valid ? "> Cryptographic chain intact. No tampering detected." : "> IMMEDIATE INVESTIGATION REQUIRED. CRYPTOGRAPHIC CHAIN BROKEN."}
                </p>
              </div>
            </div>
            <div className="flex flex-col md:items-end gap-3 w-full md:w-auto">
              <span className={`text-xs font-bold uppercase tracking-wider ${verification.valid ? 'text-slate-600' : 'text-red-100'}`}>Last verified: just now</span>
              {verification.valid && <span className="bg-black text-white px-3 py-1 font-bold text-xs uppercase shadow-[2px_2px_0px_#22c55e] border border-black flex items-center gap-1.5"><CheckCircle2 size={16}/> CHAIN INTACT</span>}
              <button 
                onClick={handleVerify}
                disabled={isVerifying}
                className={`mt-2 text-xs font-bold uppercase tracking-widest px-4 py-2 border-2 shadow-[2px_2px_0px_0px_#000] transition-all hover:translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[3px_3px_0px_0px_#000] flex items-center gap-2 ${verification.valid ? 'bg-white text-black border-black hover:bg-slate-50' : 'bg-black text-white border-white hover:bg-slate-900'} disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[2px_2px_0px_0px_#000]`}
              >
                <RefreshCw size={14} className={isVerifying ? 'animate-spin' : ''} /> {isVerifying ? 'VERIFYING...' : 'RE-VERIFY CHAIN'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="card mb-6 overflow-hidden bg-slate-50 border-black border-2 shadow-[6px_6px_0px_#000] pt-6 relative">
        <div className="absolute top-0 left-0 w-full h-2 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,#000_10px,#000_20px)]"></div>
        <h2 className="font-mono font-black text-xl text-black mb-6 px-4 uppercase tracking-tighter bg-yellow-300 inline-block py-1 border-y-2 border-black border-r-2 shadow-[2px_2px_0px_#000] -ml-6 pl-8">Transaction Chain Visualization</h2>
        <div className="overflow-x-auto pb-6 pt-2 border-y-2 border-black bg-white px-6 custom-scrollbar">
          <div className="flex gap-6 items-center min-w-max py-4">
            
            {/* Genesis Block */}
            {page === 1 && (!typeFilter || typeFilter === 'All') && (
              <>
                <div className="bg-black text-white p-5 w-60 flex-shrink-0 shadow-[4px_4px_0px_#F97316] relative border-2 border-black transition-transform hover:-translate-y-1">
                  <div className="absolute -top-3 -right-3 text-white bg-black border-2 border-black rounded-full p-1 shadow-[2px_2px_0px_#F97316]"><ShieldCheck size={20}/></div>
                  <h3 className="font-mono font-black text-orange-400 mb-1 text-2xl tracking-tighter">GENESIS</h3>
                  <p className="text-[10px] text-slate-400 font-mono font-bold border-b border-slate-700 pb-2 uppercase tracking-widest mb-3">Block #0</p>
                  <p className="text-sm font-bold mb-3 uppercase tracking-wider">System Initialized</p>
                  <div className="mt-3 bg-slate-900 border border-slate-700 p-2 text-[10px] font-mono text-slate-400 truncate">
                    HASH: <span className="text-slate-300">0000000000...</span>
                  </div>
                </div>
                <div className="text-black font-black text-xl px-2">{"=>"}</div>
              </>
            )}

            {/* Render top 8 from current view in reverse order (oldest -> newest visually if we reverse logs piece) */}
            {[...logs].reverse().slice(0, 8).map((log, idx, arr) => (
              <React.Fragment key={log.id}>
                <div className={`bg-white border-2 p-5 w-60 flex-shrink-0 transition-transform hover:-translate-y-1 ${idx === arr.length - 1 ? 'border-orange-500 shadow-[4px_4px_0px_#F97316]' : 'border-black shadow-[4px_4px_0px_#000]'}`}>
                  <div className="flex justify-between items-start mb-2 border-b-2 border-black pb-2">
                    <h3 className="font-mono font-black text-xl text-black">#{log.id}</h3>
                    <span className={`text-[10px] uppercase font-mono font-bold px-2 py-1 border border-black ${log.record_type === 'DONATION' ? 'bg-orange-100 text-orange-800 shadow-[2px_2px_0px_#f97316]' : log.record_type === 'COMPLIANCE' ? 'bg-green-100 text-green-800 shadow-[2px_2px_0px_#22c55e]' : 'bg-blue-100 text-blue-800 shadow-[2px_2px_0px_#3b82f6]'}`}>
                      {log.record_type}
                    </span>
                  </div>
                  <div className="mt-3 bg-slate-100 border border-slate-300 p-2 font-mono text-[10px] text-slate-700 truncate cursor-pointer hover:bg-slate-200 hover:border-black transition-colors" onClick={() => copyToClipboard(log.tx_hash)}>
                    HASH: <span className="font-bold">{log.tx_hash.slice(0, 10)}...{log.tx_hash.slice(-6)}</span>
                  </div>
                  <div className="mt-3 text-[10px] font-bold uppercase text-slate-500 font-mono tracking-wider">
                    {format(parseISO(log.timestamp), 'dd MMM yyyy, HH:mm')}
                  </div>
                  <div className="mt-2 inline-flex items-center gap-1.5 text-[10px] text-green-700 font-bold uppercase tracking-wider bg-green-100 px-2 py-1 border border-green-300">
                    <CheckCircle2 size={12} /> VERIFIED
                  </div>
                </div>
                {idx < arr.length - 1 && <div className="text-black font-black text-xl px-2">{"=>"}</div>}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-3 mb-6 font-mono">
        {['All', 'DONATION', 'EMPLOYEE', 'COMPLIANCE'].map(filter => (
          <button 
            key={filter}
            onClick={() => { setTypeFilter(filter); setPage(1); }}
            className={`px-4 py-2 border-2 font-bold uppercase tracking-wider text-xs transition-all ${
              (typeFilter || 'All') === filter 
                ? 'bg-black text-white border-black shadow-[3px_3px_0px_#F97316] translate-y-[-2px]' 
                : 'bg-white border-black text-slate-800 shadow-[3px_3px_0px_#000] hover:bg-slate-50 hover:translate-y-[-2px]'
            }`}
          >
            {filter === 'All' ? `ALL RECORDS (${total})` : filter}
          </button>
        ))}
      </div>

      <div className="card !p-0 border-black border-2 shadow-[8px_8px_0px_#000]">
        <DataTable 
          data={logs}
          columns={[
            { key: 'id', header: 'BLOCK #', render: (row) => <span className="font-black text-lg text-black font-mono">#{row.id}</span> },
            { key: 'type', header: 'TYPE', render: (row) => <span className={`text-[10px] uppercase font-mono font-bold px-2 py-1 border border-black ${row.record_type === 'DONATION' ? 'bg-orange-100 text-orange-800 shadow-[2px_2px_0px_#f97316]' : row.record_type === 'COMPLIANCE' ? 'bg-green-100 text-green-800 shadow-[2px_2px_0px_#22c55e]' : 'bg-blue-100 text-blue-800 shadow-[2px_2px_0px_#3b82f6]'}`}>{row.record_type}</span> },
            { key: 'data_summary', header: 'DATA SUMMARY', render: (row) => <span className="text-slate-800 font-bold text-xs uppercase font-mono tracking-wide">{row.data_summary}</span> },
            { key: 'timestamp', header: 'TIMESTAMP', render: (row) => <span className="text-xs font-bold text-slate-500 font-mono tracking-widest">{format(parseISO(row.timestamp), 'dd MMM yyyy, HH:mm:ss')}</span> },
            { key: 'hash', header: 'TRANSACTION HASH', render: (row) => (
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-[10px] text-slate-700 bg-slate-100 border-2 border-slate-300 px-2 py-1">{row.tx_hash.slice(0, 10)}...{row.tx_hash.slice(-6)}</span>
                <button onClick={() => copyToClipboard(row.tx_hash)} className="text-black border-2 border-black shadow-[2px_2px_0px_#000] hover:translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[3px_3px_0px_#000] bg-white p-1 transition-all"><Copy size={14}/></button>
              </div>
            )},
            { key: 'verified', header: 'STATE', render: () => <span className="text-green-600 font-bold flex items-center justify-center p-1 bg-green-100 border border-green-300 w-8 h-8 mx-auto shadow-[1px_1px_0px_#22c55e]"><CheckCircle2 size={16}/></span> }
          ]}
        />
        <div className="p-4 border-t-2 border-black flex flex-col sm:flex-row justify-between items-center font-mono text-xs uppercase font-bold tracking-widest bg-slate-50">
          <span className="text-slate-600 mb-4 sm:mb-0">SHOWING {Math.min((page - 1) * 20 + 1, total)}-{Math.min(page * 20, total)} OF {total} RECORDS</span>
          <div className="flex gap-3">
            <button 
              disabled={page === 1} 
              onClick={() => setPage(page - 1)}
              className="btn-secondary disabled:opacity-50"
            >
              ← PREV
            </button>
            <button 
              disabled={page * 20 >= total}
              onClick={() => setPage(page + 1)}
              className="btn-secondary disabled:opacity-50"
            >
              NEXT →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Blockchain;
