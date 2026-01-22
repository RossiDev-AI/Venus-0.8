
import React from 'react';
import { CategorizedDNA } from '../../types';

interface IndexerDnaBiopsyProps {
  dna: CategorizedDNA | null;
}

const IndexerDnaBiopsy: React.FC<IndexerDnaBiopsyProps> = ({ dna }) => {
  if (!dna) return null;

  // Safe renderer for potential objects
  const safeRender = (val: any, fallback: string = 'N/A') => {
    if (!val) return fallback;
    if (typeof val === 'object') {
      return Object.values(val).join(', ');
    }
    return val;
  };

  return (
    <div className="flex-1 bg-zinc-950/40 border border-white/5 rounded-[3rem] p-8 space-y-6 max-h-[500px] overflow-y-auto custom-scrollbar">
      <div className="space-y-1">
        <h4 className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Neural Biopsy Results (v12.2)</h4>
        <p className="text-[14px] text-white font-black uppercase leading-tight">{safeRender(dna.human_description, 'Node Analyzed')}</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="p-5 rounded-3xl bg-white/5 border border-white/5 space-y-2">
          <span className="text-[7px] font-black text-zinc-500 uppercase tracking-widest">Character / Identity DNA</span>
          <p className="text-[10px] text-zinc-300 italic leading-relaxed uppercase">{safeRender(dna.character_details)}</p>
        </div>

        <div className="p-5 rounded-3xl bg-white/5 border border-white/5 space-y-2">
          <span className="text-[7px] font-black text-zinc-500 uppercase tracking-widest">Environment / Context</span>
          <p className="text-[10px] text-zinc-300 italic leading-relaxed uppercase">{safeRender(dna.environment_context)}</p>
        </div>

        <div className="p-5 rounded-3xl bg-white/5 border border-white/5 space-y-2">
          <span className="text-[7px] font-black text-zinc-500 uppercase tracking-widest">Core Attribute / Pose</span>
          <p className="text-[10px] text-zinc-300 italic leading-relaxed uppercase">{safeRender(dna.pose_attribute)}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
            <span className="text-[7px] font-black text-zinc-600 uppercase">Camera Sync</span>
            <p className="text-[9px] text-indigo-400 mono font-bold uppercase">{safeRender(dna.camera_specs)}</p>
          </div>
          <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
            <span className="text-[7px] font-black text-zinc-600 uppercase">Lighting Setup</span>
            <p className="text-[9px] text-indigo-400 mono font-bold uppercase">{safeRender(dna.lighting_setup)}</p>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <span className="text-[7px] font-black text-zinc-500 uppercase tracking-widest block px-1">Technical Taxonomy</span>
          <div className="flex flex-wrap gap-2">
            {dna.technical_tags?.map((tag: any, i) => (
              <span key={i} className="px-3 py-1 bg-zinc-900 border border-white/10 rounded-full text-[8px] mono text-zinc-400 font-bold uppercase">
                {typeof tag === 'object' ? Object.values(tag).join(' ') : tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IndexerDnaBiopsy;
