
import React from 'react';
import { VaultDomain } from '../../types';

interface StudioActionPanelProps {
  prompt: string;
  setPrompt: (val: string) => void;
  onProcess: () => void;
  onCommit: () => void;
  onOptimize: () => void;
  isProcessing: boolean;
  isSaving: boolean;
  isOptimizing: boolean;
  hasImage: boolean;
  targetDomain: VaultDomain;
  setTargetDomain: (d: VaultDomain) => void;
}

const StudioActionPanel: React.FC<StudioActionPanelProps> = ({
  prompt, setPrompt, onProcess, onCommit, onOptimize, isProcessing, isSaving, isOptimizing, hasImage, targetDomain, setTargetDomain
}) => {
  const domains: { id: VaultDomain; label: string; color: string }[] = [
    { id: 'X', label: 'Identity', color: 'bg-emerald-500' },
    { id: 'Y', label: 'Env', color: 'bg-pink-500' },
    { id: 'Z', label: 'Style', color: 'bg-cyan-500' },
    { id: 'L', label: 'Light', color: 'bg-amber-500' }
  ];

  return (
    <div className="p-4 md:p-8 bg-black/95 backdrop-blur-3xl border-t border-white/5 space-y-4">
      {/* Target Domain Classification */}
      <div className="space-y-2">
         <div className="flex justify-between items-center px-1">
            <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Classify Result Domain</span>
            <span className="text-[7px] mono text-indigo-500 font-bold uppercase tracking-tighter">Biopsy on Commit</span>
         </div>
         <div className="grid grid-cols-4 gap-1.5">
            {domains.map(d => (
              <button 
                key={d.id}
                onClick={() => setTargetDomain(d.id)}
                className={`py-2 rounded-xl border transition-all flex flex-col items-center justify-center gap-0.5 ${targetDomain === d.id ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg' : 'bg-white/5 border-white/5 text-zinc-500 hover:text-zinc-300'}`}
              >
                <span className="text-[10px] font-black leading-none">{d.id}</span>
                <span className="text-[6px] font-bold uppercase opacity-60 tracking-tighter">{d.label}</span>
              </button>
            ))}
         </div>
      </div>

      <div className="relative">
         <textarea 
            value={prompt} 
            onChange={(e) => setPrompt(e.target.value)} 
            placeholder="Enter synthesis directive (Kernel v12.2)..." 
            className="w-full bg-zinc-900/50 border border-white/5 rounded-xl px-4 py-3 text-[10px] md:text-sm h-16 md:h-24 resize-none text-zinc-200 outline-none focus:border-indigo-500/40 transition-all custom-scrollbar pr-12" 
         />
         <button 
            onClick={onOptimize} 
            disabled={isOptimizing || !prompt.trim()} 
            className={`absolute top-3 right-3 p-2 rounded-lg border transition-all ${isOptimizing ? 'bg-amber-600/40 border-amber-400 animate-pulse' : 'bg-zinc-800 border-white/10 text-amber-400 hover:bg-zinc-700'}`} 
            title="Industrial Meta-Prompt Optimizer"
         >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13.5 3L11 8.5L5.5 11L11 13.5L13.5 19L16 13.5L21.5 11L16 8.5L13.5 3Z" strokeWidth={2}/></svg>
         </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button 
          onClick={onProcess} 
          disabled={isProcessing || isOptimizing} 
          className="rounded-xl bg-indigo-600 text-white p-3 md:p-4 font-black uppercase tracking-widest text-[10px] active:scale-95 transition-all shadow-xl shadow-indigo-900/20"
        >
          {isProcessing ? 'Synapsing...' : 'Execute Synth'}
        </button>
        <button 
          onClick={onCommit} 
          disabled={!hasImage || isSaving || isProcessing} 
          className="rounded-xl bg-zinc-100 text-black text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all disabled:opacity-20"
        >
          {isSaving ? 'Indexing...' : 'Commit Node'}
        </button>
      </div>
    </div>
  );
};

export default StudioActionPanel;
