
import React from 'react';
import { VaultItem } from '../../types';

interface VaultNodeInspectorProps {
  item: VaultItem;
  onReload: (item: VaultItem) => void;
  onClose: () => void;
}

const VaultNodeInspector: React.FC<VaultNodeInspectorProps> = ({ item, onReload, onClose }) => {
  const dna = item.dna;

  // Safe helper for rendering potential objects
  const safeRender = (val: any, fallback: string = 'N/A') => {
    if (!val) return fallback;
    if (typeof val === 'object') {
      return Object.values(val).join(', ');
    }
    return val;
  };

  return (
    <div className="flex-1 bg-zinc-950 p-8 flex flex-col md:flex-row gap-8 animate-in slide-in-from-bottom-4 duration-500 relative rounded-[3rem] border border-white/10 shadow-3xl">
      <div className="flex-1 space-y-6">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h4 className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Rigorous Biopsy Results (v12.2)</h4>
            <p className="text-[14px] text-white font-black uppercase leading-tight">{safeRender(dna?.human_description, 'Node Analyzed')}</p>
          </div>
          {item.sourceNodeId && (
            <div className="px-3 py-1 bg-pink-600/10 border border-pink-500/20 rounded-lg flex flex-col items-end group cursor-help">
               <span className="text-[6px] font-black text-pink-400 uppercase tracking-tighter">DNA Lineage Active</span>
               <span className="text-[8px] mono text-zinc-400 font-bold uppercase truncate max-w-[80px]">Ancestor_{item.sourceNodeId.split('-')[0]}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2">
            <span className="text-[7px] font-black text-zinc-500 uppercase tracking-widest">Character / Identity DNA</span>
            <p className="text-[10px] text-zinc-300 italic leading-relaxed">"{safeRender(dna?.character_details || dna?.character || 'Identity Stable')}"</p>
          </div>
          <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2">
            <span className="text-[7px] font-black text-zinc-500 uppercase tracking-widest">Environment / Context</span>
            <p className="text-[10px] text-zinc-300 italic leading-relaxed">"{safeRender(dna?.environment_context || dna?.environment || 'Latent Space Neutral')}"</p>
          </div>
        </div>

        <div className="space-y-3">
          <span className="text-[7px] font-black text-zinc-500 uppercase tracking-widest block px-1">Synthesis Directive (Prompt)</span>
          <div className="p-4 bg-black/40 border border-white/5 rounded-2xl text-[10px] mono text-zinc-500 leading-relaxed italic max-h-24 overflow-y-auto custom-scrollbar">
             "{item.prompt}"
          </div>
        </div>

        <div className="space-y-3">
          <span className="text-[7px] font-black text-zinc-500 uppercase tracking-widest block px-1">Forensic Spec Tags</span>
          <div className="flex flex-wrap gap-2">
            {dna?.technical_tags?.map((tag: any, i: number) => (
              <span key={i} className="px-3 py-1 bg-zinc-900 border border-white/10 rounded-full text-[8px] mono text-zinc-400 font-bold uppercase">
                {typeof tag === 'object' ? Object.values(tag).join(' ') : tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="w-full md:w-[220px] space-y-6 border-l border-white/5 pl-0 md:pl-8 flex flex-col justify-between">
         <div className="space-y-4">
            <div className="space-y-1">
              <span className="text-[7px] font-black text-zinc-600 uppercase block">Camera Calibration</span>
              <p className="text-[10px] text-indigo-400 mono font-bold uppercase">{safeRender(dna?.camera_specs || dna?.spatial_metadata?.camera_angle || 'Eye-Level')}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[7px] font-black text-zinc-600 uppercase block">Lighting Profile</span>
              <p className="text-[10px] text-indigo-400 mono font-bold uppercase">{safeRender(dna?.lighting_setup || dna?.aesthetic_dna?.lighting_setup || 'Natural')}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[7px] font-black text-zinc-600 uppercase block">Pose DNA</span>
              <p className="text-[10px] text-white mono font-bold uppercase truncate">{safeRender(dna?.pose_attribute, 'Static_Equilibrium')}</p>
            </div>
            <div className="space-y-1 pt-2">
              <span className="text-[7px] font-black text-zinc-600 uppercase block">Neural Integrity</span>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500" style={{ width: `${item.neuralPreferenceScore}%` }} />
                </div>
                <span className="text-[10px] mono text-emerald-400">{item.neuralPreferenceScore}</span>
              </div>
            </div>
         </div>

         <div className="pt-8 border-t border-white/5 space-y-3">
            <button onClick={() => onReload(item)} className="w-full py-4 bg-white text-black hover:bg-zinc-100 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl transition-all">Inject to Studio</button>
            <button onClick={onClose} className="w-full py-3 bg-white/5 border border-white/10 text-zinc-500 hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all">Collapse</button>
         </div>
      </div>
    </div>
  );
};

export default VaultNodeInspector;
