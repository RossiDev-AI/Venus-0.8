
import React, { useRef } from 'react';

interface CreationActionProps {
  isProcessing: boolean;
  onProcess: () => void;
  prompt: string;
  injectedImage: string | null;
  onImageUpload: (image: string | null) => void;
  onOpenVault: () => void;
}

const CreationAction: React.FC<CreationActionProps> = ({ 
  isProcessing, onProcess, prompt, injectedImage, onImageUpload, onOpenVault 
}) => {
  const fileRef = useRef<HTMLInputElement>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        onImageUpload(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-zinc-950 border border-white/5 p-8 rounded-[3rem] space-y-5 shadow-2xl flex-1 flex flex-col transition-all hover:border-indigo-500/20 overflow-hidden relative">
      <div className="flex justify-between items-center">
        <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Synthesis Anchor</label>
        {injectedImage && (
          <button 
            onClick={() => onImageUpload(null)}
            className="text-[8px] font-black text-red-500 uppercase tracking-widest hover:text-red-400"
          >
            Clear DNA
          </button>
        )}
      </div>
      
      <div 
        className={`flex-1 min-h-[140px] bg-black/40 border-2 border-dashed border-white/5 rounded-[2.5rem] flex flex-col items-center justify-center transition-all relative overflow-hidden group ${injectedImage ? 'border-indigo-500/50' : ''}`}
      >
        {injectedImage ? (
          <>
            <img src={injectedImage} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-700" alt="Injected DNA" />
            <div className="absolute inset-0 bg-indigo-900/20 mix-blend-overlay" />
            <div className="relative z-10 flex gap-2">
               <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
                  <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest">DNA_ACTIVE</span>
               </div>
               <button onClick={() => onOpenVault()} className="bg-white/10 hover:bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 text-[8px] font-black text-white uppercase tracking-widest transition-all">Swap</button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-4 py-6">
            <div className="flex gap-3">
              <button 
                onClick={() => !isProcessing && fileRef.current?.click()}
                className="px-6 py-3 bg-zinc-900 border border-white/5 rounded-2xl text-[9px] font-black uppercase text-zinc-400 hover:text-white hover:border-indigo-500/40 transition-all flex items-center gap-2"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" strokeWidth={2}/></svg>
                Local
              </button>
              <button 
                onClick={() => onOpenVault()}
                className="px-6 py-3 bg-indigo-600/10 border border-indigo-500/20 rounded-2xl text-[9px] font-black uppercase text-indigo-400 hover:bg-indigo-600/20 transition-all flex items-center gap-2"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" strokeWidth={2}/></svg>
                Vault
              </button>
            </div>
            <p className="text-[8px] font-black uppercase tracking-[0.2em] text-zinc-700">Inject DNA Anchor</p>
          </div>
        )}
        <input 
          type="file" 
          ref={fileRef} 
          className="hidden" 
          accept="image/*" 
          onChange={handleFileChange} 
        />
      </div>

      <button 
        onClick={onProcess}
        disabled={isProcessing || !prompt.trim()}
        className="w-full py-10 bg-indigo-600 hover:bg-indigo-500 text-white rounded-[2rem] font-black uppercase tracking-[0.8em] text-[11px] shadow-2xl active:scale-95 transition-all"
      >
        {isProcessing ? 'SYNAPSING...' : 'EXECUTE MAD SYNTH V12.5'}
      </button>
    </div>
  );
};

export default CreationAction;
