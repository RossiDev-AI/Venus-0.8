
import React, { useEffect, useState } from 'react';
import { LatentParams, LatentGrading, VaultDomain, VaultItem } from '../../types';

interface StudioPreviewProps {
  currentImage: string | null;
  isProcessing: boolean;
  isBiopsyActive: boolean;
  loadingMessage: string;
  localGrading?: LatentGrading;
  params: LatentParams;
  vault: VaultItem[];
  onUploadClick: () => void;
  onOpenVault: (domain?: VaultDomain) => void;
  onSlotClick: (domain: VaultDomain) => void;
}

const StudioPreview: React.FC<StudioPreviewProps> = ({
  currentImage, isProcessing, isBiopsyActive, loadingMessage, localGrading, params, vault, onUploadClick, onOpenVault, onSlotClick
}) => {
  const [flash, setFlash] = useState(false);

  // Trigger flash quando a imagem muda para confirmar a atualização
  useEffect(() => {
    if (currentImage) {
      setFlash(true);
      const t = setTimeout(() => setFlash(false), 500);
      return () => clearTimeout(t);
    }
  }, [currentImage]);

  const renderSlot = (domain: VaultDomain, label: string, color: string) => {
    const activeId = params.active_slots?.[domain];
    const item = vault.find(v => v.shortId === activeId);
    
    return (
      <div className={`relative flex flex-col items-center gap-1 group`}>
        <div 
          className={`w-12 h-12 md:w-16 md:h-16 rounded-xl border-2 transition-all cursor-pointer overflow-hidden bg-black/40 flex items-center justify-center ${item ? `border-${color}-500 shadow-[0_0_15px_rgba(0,0,0,0.5)]` : 'border-white/5 hover:border-indigo-500/40'}`}
          onClick={() => onOpenVault(domain)}
        >
           {item ? (
              <img src={item.imageUrl} className="w-full h-full object-cover" alt={label} />
           ) : (
              <div className="flex flex-col items-center opacity-20 group-hover:opacity-100 transition-opacity">
                 <span className={`text-[10px] font-black uppercase text-white`}>{domain}</span>
                 <svg className="w-3 h-3 text-white mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" strokeWidth={3}/></svg>
              </div>
           )}
        </div>
        <span className={`text-[6px] font-black uppercase tracking-tighter ${item ? `text-${color}-400` : 'text-zinc-600'}`}>{label}</span>
      </div>
    );
  };

  const safeRender = (val: any) => {
    if (typeof val === 'object' && val !== null) {
      return Object.values(val).join(', ');
    }
    return val;
  };

  return (
    <div className={`flex-[1.4] relative bg-[#08080a] flex flex-col items-center justify-center border-r border-white/5 overflow-hidden min-h-[300px] md:min-h-0`}>
      {(isProcessing || isBiopsyActive) && (
        <div className="absolute inset-0 z-[160] bg-black/80 backdrop-blur-md flex flex-col items-center justify-center space-y-4 text-center px-6 transition-opacity duration-300">
          <div className="relative w-12 h-12 md:w-32 md:h-32">
              <div className="absolute inset-0 border-2 border-indigo-500/20 rounded-full" />
              <div className="absolute inset-0 border-2 border-t-indigo-500 rounded-full animate-spin" />
          </div>
          <p className="text-indigo-400 font-black text-[8px] md:text-xs uppercase tracking-[0.3em] animate-pulse">
            {loadingMessage}
          </p>
        </div>
      )}

      <div className="flex-1 w-full relative flex items-center justify-center overflow-hidden">
        {!currentImage ? (
          <div className="w-full h-full bg-zinc-900/10 border-2 border-dashed border-white/5 flex flex-col items-center justify-center p-8 space-y-8">
                <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center border border-white/5 shadow-inner">
                   <svg className="w-10 h-10 text-zinc-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                </div>
                <div className="flex flex-col items-center gap-4">
                  <span className="text-[11px] mono uppercase text-zinc-600 font-bold tracking-[0.4em]">Inject Base DNA Reference</span>
                  <div className="flex gap-4">
                    <button onClick={onUploadClick} className="px-8 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest border border-white/5 transition-all">Upload Local</button>
                    <button onClick={() => onOpenVault()} className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-xl transition-all">Choose Vault</button>
                  </div>
                </div>
          </div>
        ) : (
          <div className={`relative w-full h-full flex items-center justify-center bg-[#050505]`}>
            <div className="relative max-w-full max-h-full flex items-center justify-center overflow-hidden">
                {/* A chave `key` força a re-renderização quando a URL da imagem muda, prevenindo frames antigos */}
                <img 
                  key={currentImage}
                  src={currentImage} 
                  className={`max-w-full max-h-full w-auto h-auto object-contain transition-all duration-1000 shadow-2xl relative z-10 ${flash ? 'brightness-125 scale-[1.01]' : 'brightness-100 scale-100'}`}
                  style={{ filter: localGrading?.css_filter_string || 'none' }}
                />
                
                {/* Overlay de Flash para Confirmação */}
                <div className={`absolute inset-0 bg-white mix-blend-overlay transition-opacity duration-500 pointer-events-none z-50 ${flash ? 'opacity-30' : 'opacity-0'}`} />
            </div>
            
            <div className="absolute top-8 left-8 flex flex-col gap-2 z-[100]">
                <div className="bg-black/80 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 flex items-center gap-2">
                   <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
                   <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest">MAD_v12.2 RIGOROUS_MAPPER</span>
                </div>
                {params.dna && (
                  <div className="flex flex-col gap-1.5 animate-in slide-in-from-left-4 duration-500">
                    {params.dna.camera_specs && (
                      <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/5 flex flex-col">
                         <span className="text-[6px] font-black text-zinc-500 uppercase tracking-tighter">Camera Sync</span>
                         <span className="text-[8px] font-black text-white uppercase">{safeRender(params.dna.camera_specs)}</span>
                      </div>
                    )}
                    {params.dna.lighting_setup && (
                      <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/5 flex flex-col">
                         <span className="text-[6px] font-black text-zinc-500 uppercase tracking-tighter">Lighting Setup</span>
                         <span className="text-[8px] font-black text-white uppercase">{safeRender(params.dna.lighting_setup)}</span>
                      </div>
                    )}
                  </div>
                )}
            </div>

            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4 bg-black/80 backdrop-blur-3xl p-4 rounded-[2.5rem] border border-white/10 z-[150] shadow-2xl">
               {renderSlot('X', 'Identity', 'emerald')}
               {renderSlot('Y', 'Env', 'pink')}
               {renderSlot('Z', 'Style', 'cyan')}
               {renderSlot('L', 'Light', 'amber')}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudioPreview;
