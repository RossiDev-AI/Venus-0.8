
import React, { useState, useEffect } from 'react';
import { LatentGrading } from '../../types';

interface GradingControlsProps {
  activeCategory: string;
  grading: LatentGrading;
  updateParam: (key: keyof LatentGrading, val: any) => void;
  applyPreset: (preset: any) => void;
  filmStocks: any[];
  customLuts: any[];
  handleSaveLut: () => void;
  handleRemoveLut: (name: string) => void;
  newLutName: string;
  setNewLutName: (val: string) => void;
  controls?: any[];
}

const GradingControls: React.FC<GradingControlsProps> = ({
  activeCategory, grading, updateParam, applyPreset, filmStocks, customLuts, handleSaveLut, handleRemoveLut, newLutName, setNewLutName
}) => {

  // --- STEALTH SLIDER COMPONENT ---
  const StealthSlider = ({ keyName, label, min, max, step = 0.001, color = 'indigo' }: { keyName: string, label: string, min: number, max: number, step?: number, color?: string }) => {
    const val = (grading as any)[keyName] || 0;
    
    // Internal state for input typing to avoid jitter
    const [inputValue, setInputValue] = useState(val);

    useEffect(() => {
        setInputValue(val);
    }, [val]);

    // Calculate percentages
    const range = max - min;
    const rawPercent = ((val - min) / range) * 100;
    const thumbPercent = Math.min(100, Math.max(0, rawPercent));

    // Bipolar Bar Logic
    let barLeft = '0%';
    let barWidth = `${thumbPercent}%`;
    const isBipolar = min < 0 && max > 0;

    if (isBipolar) {
        const zeroPercent = ((0 - min) / range) * 100;
        if (val >= 0) {
            barLeft = `${zeroPercent}%`;
            barWidth = `${Math.max(0, thumbPercent - zeroPercent)}%`;
        } else {
            barLeft = `${thumbPercent}%`;
            barWidth = `${Math.max(0, zeroPercent - thumbPercent)}%`;
        }
    }
    
    // Color mapping
    let barClass = 'bg-indigo-500';
    let textClass = 'text-indigo-400';
    let glowClass = 'shadow-[0_0_8px_rgba(99,102,241,0.3)]';
    
    if (color === 'red') { barClass = 'bg-red-500'; textClass = 'text-red-400'; glowClass = 'shadow-[0_0_8px_rgba(239,68,68,0.3)]'; }
    if (color === 'green') { barClass = 'bg-emerald-500'; textClass = 'text-emerald-400'; glowClass = 'shadow-[0_0_8px_rgba(16,185,129,0.3)]'; }
    if (color === 'blue') { barClass = 'bg-blue-500'; textClass = 'text-blue-400'; glowClass = 'shadow-[0_0_8px_rgba(59,130,246,0.3)]'; }
    if (color === 'amber') { barClass = 'bg-amber-500'; textClass = 'text-amber-400'; glowClass = 'shadow-[0_0_8px_rgba(245,158,11,0.3)]'; }
    if (color === 'pink') { barClass = 'bg-pink-500'; textClass = 'text-pink-400'; glowClass = 'shadow-[0_0_8px_rgba(236,72,153,0.3)]'; }
    if (color === 'zinc') { barClass = 'bg-zinc-400'; textClass = 'text-zinc-300'; glowClass = ''; }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
        const num = parseFloat(e.target.value);
        if (!isNaN(num)) {
            updateParam(keyName as keyof LatentGrading, num);
        }
    };

    return (
      <div className="group py-1.5 w-full">
        {/* Header Row: Label and Editable Value */}
        <div className="flex justify-between items-end mb-1 px-1">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest group-hover:text-zinc-300 transition-colors">
            {label}
          </span>
          <input 
            type="number" 
            step={step}
            value={typeof inputValue === 'number' ? parseFloat(inputValue.toFixed(3)) : inputValue}
            onChange={handleInputChange}
            className={`w-16 bg-transparent text-right text-[10px] mono font-bold outline-none border-none p-0 focus:text-white transition-all ${textClass}`}
          />
        </div>
        
        {/* Slider Row: Ultra Thin Track */}
        <div className="relative h-3 w-full flex items-center">
          {/* Background Track (Thin Line) */}
          <div className="absolute inset-x-0 h-[2px] bg-white/10 rounded-full overflow-hidden">
             {/* Center Tick for Bipolar */}
             {isBipolar && <div className="absolute top-0 bottom-0 left-[50%] w-[1px] bg-white/30 z-0" />}
             {/* Active Bar */}
             <div 
                className={`absolute top-0 bottom-0 ${barClass} opacity-80 group-hover:opacity-100 ${glowClass}`}
                style={{ left: barLeft, width: barWidth }}
             />
          </div>

          {/* Visual Thumb (Only visible on hover/active) */}
          <div 
            className={`absolute w-2 h-2 bg-white rounded-full shadow-sm pointer-events-none transition-transform duration-100 z-10 opacity-0 group-hover:opacity-100 scale-0 group-hover:scale-100 ${glowClass}`}
            style={{ left: `calc(${thumbPercent}% - 4px)` }}
          />

          {/* Invisible Interactive Range Input (Full Hitbox) */}
          <input 
            type="range" min={min} max={max} step={step} value={val}
            onChange={(e) => {
                const v = parseFloat(e.target.value);
                setInputValue(v);
                updateParam(keyName as keyof LatentGrading, v);
            }}
            className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
          />
        </div>
      </div>
    );
  };

  const SectionHeader = ({ title, icon }: { title: string, icon?: React.ReactNode }) => (
    <div className="pt-6 pb-2 border-b border-white/5 mb-3 flex items-center gap-3">
      {icon || <div className="w-1 h-1 bg-zinc-600 rounded-full" />}
      <span className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.3em]">{title}</span>
    </div>
  );

  const getCategoryContent = () => {
    switch(activeCategory) {
      case 'MASTER': return (
        <div className="flex flex-col gap-1 pb-10">
            <SectionHeader title="Primary Correction" />
            <StealthSlider keyName="exposure" label="Exposure" min={-3} max={3} step={0.01} />
            <StealthSlider keyName="contrast" label="Contrast" min={0} max={2.5} step={0.01} />
            <StealthSlider keyName="brightness" label="Brightness" min={0} max={2} step={0.01} />
            <StealthSlider keyName="gamma" label="Gamma" min={0.1} max={3} step={0.01} />
            <StealthSlider keyName="pivot" label="Pivot" min={0} max={1} step={0.01} />
          
            <SectionHeader title="Signal Balance" />
            <StealthSlider keyName="offset" label="Offset" min={-0.2} max={0.2} step={0.001} />
            <StealthSlider keyName="lift" label="Lift (Blacks)" min={-0.5} max={0.5} step={0.001} />
            <StealthSlider keyName="gain" label="Gain (Whites)" min={0} max={3} step={0.01} />
            <StealthSlider keyName="invert" label="Invert Signal" min={0} max={1} step={1} />

            <SectionHeader title="Global Color" />
            <StealthSlider keyName="saturation" label="Saturation" min={0} max={3} step={0.01} color="pink" />
            <StealthSlider keyName="vibrance" label="Vibrance" min={0} max={3} step={0.01} color="pink" />
            <StealthSlider keyName="temperature" label="Temp (K)" min={-100} max={100} step={1} color="amber" />
            <StealthSlider keyName="tint" label="Tint" min={-100} max={100} step={1} color="green" />
            <StealthSlider keyName="hueRotate" label="Global Hue" min={-180} max={180} step={1} color="blue" />
        </div>
      );
      
      case 'LGG': return (
        <div className="flex flex-col gap-8 pb-12">
           {/* LIFT */}
           <div className="space-y-1">
              <div className="flex items-center gap-3 pb-2 border-b border-white/5 mb-2">
                 <div className="w-2 h-2 rounded-full bg-zinc-800 border border-zinc-600 shadow-[0_0_10px_black]" />
                 <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Lift (Shadows)</span>
              </div>
              <StealthSlider keyName="lift_r" label="Red Lift" min={-0.5} max={0.5} color="red" />
              <StealthSlider keyName="lift_g" label="Green Lift" min={-0.5} max={0.5} color="green" />
              <StealthSlider keyName="lift_b" label="Blue Lift" min={-0.5} max={0.5} color="blue" />
              <div className="h-1"/>
              <StealthSlider keyName="offset" label="Master Offset" min={-0.2} max={0.2} color="zinc" />
           </div>

           {/* GAMMA */}
           <div className="space-y-1">
              <div className="flex items-center gap-3 pb-2 border-b border-white/5 mb-2">
                 <div className="w-2 h-2 rounded-full bg-zinc-600 border border-zinc-400" />
                 <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Gamma (Midtones)</span>
              </div>
              <StealthSlider keyName="gamma_r" label="Red Gamma" min={0.1} max={3} color="red" />
              <StealthSlider keyName="gamma_g" label="Green Gamma" min={0.1} max={3} color="green" />
              <StealthSlider keyName="gamma_b" label="Blue Gamma" min={0.1} max={3} color="blue" />
           </div>

           {/* GAIN */}
           <div className="space-y-1">
              <div className="flex items-center gap-3 pb-2 border-b border-white/5 mb-2">
                 <div className="w-2 h-2 rounded-full bg-zinc-300 border border-white shadow-[0_0_10px_white]" />
                 <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Gain (Highlights)</span>
              </div>
              <StealthSlider keyName="gain_r" label="Red Gain" min={0} max={3} color="red" />
              <StealthSlider keyName="gain_g" label="Green Gain" min={0} max={3} color="green" />
              <StealthSlider keyName="gain_b" label="Blue Gain" min={0} max={3} color="blue" />
           </div>
        </div>
      );

      case 'MIXER': return (
        <div className="flex flex-col gap-8">
           <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 mb-2"><div className="w-1.5 h-1.5 bg-red-500 rounded-full"/> <span className="text-[10px] font-black text-red-400 uppercase tracking-widest">Red Output</span></div>
              <StealthSlider keyName="mix_red_red" label="Red In" min={-2} max={2} color="red" />
              <StealthSlider keyName="mix_red_green" label="Green In" min={-2} max={2} color="green" />
              <StealthSlider keyName="mix_red_blue" label="Blue In" min={-2} max={2} color="blue" />
           </div>
           <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 mb-2"><div className="w-1.5 h-1.5 bg-green-500 rounded-full"/> <span className="text-[10px] font-black text-green-400 uppercase tracking-widest">Green Output</span></div>
              <StealthSlider keyName="mix_green_red" label="Red In" min={-2} max={2} color="red" />
              <StealthSlider keyName="mix_green_green" label="Green In" min={-2} max={2} color="green" />
              <StealthSlider keyName="mix_green_blue" label="Blue In" min={-2} max={2} color="blue" />
           </div>
           <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 mb-2"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full"/> <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Blue Output</span></div>
              <StealthSlider keyName="mix_blue_red" label="Red In" min={-2} max={2} color="red" />
              <StealthSlider keyName="mix_blue_green" label="Green In" min={-2} max={2} color="green" />
              <StealthSlider keyName="mix_blue_blue" label="Blue In" min={-2} max={2} color="blue" />
           </div>
        </div>
      );

      case 'HSL': return (
        <div className="flex flex-col gap-1 pb-10">
            <SectionHeader title="Vector Saturation" />
            <StealthSlider keyName="sat_red" label="Red" min={-1} max={2} color="red" />
            <StealthSlider keyName="sat_orange" label="Orange" min={-1} max={2} color="amber" />
            <StealthSlider keyName="sat_yellow" label="Yellow" min={-1} max={2} color="amber" />
            <StealthSlider keyName="sat_green" label="Green" min={-1} max={2} color="green" />
            <StealthSlider keyName="sat_cyan" label="Cyan" min={-1} max={2} color="blue" />
            <StealthSlider keyName="sat_blue" label="Blue" min={-1} max={2} color="blue" />
            <StealthSlider keyName="sat_purple" label="Purple" min={-1} max={2} color="pink" />
            <StealthSlider keyName="sat_magenta" label="Magenta" min={-1} max={2} color="pink" />
           
            <SectionHeader title="Split Toning" />
            <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest block mt-2 mb-1">Shadows (Cold)</span>
            <StealthSlider keyName="split_shadow_hue" label="Hue" min={0} max={360} step={1} color="blue" />
            <StealthSlider keyName="split_shadow_sat" label="Sat" min={0} max={2} color="blue" />
            
            <span className="text-[9px] font-black text-amber-400 uppercase tracking-widest block mt-4 mb-1">Highlights (Warm)</span>
            <StealthSlider keyName="split_highlight_hue" label="Hue" min={0} max={360} step={1} color="amber" />
            <StealthSlider keyName="split_highlight_sat" label="Sat" min={0} max={2} color="amber" />
            
            <div className="mt-4">
                <StealthSlider keyName="split_balance" label="Split Balance" min={-1} max={1} />
            </div>
        </div>
      );

      case 'PHYSICS': return (
        <div className="flex flex-col gap-1 pb-10">
             <SectionHeader title="Lens Geometry" />
             <StealthSlider keyName="lens_distortion" label="Distortion" min={-1} max={1} />
             <StealthSlider keyName="anamorphic_squeeze" label="Anamorphic" min={0.5} max={2} />
             <StealthSlider keyName="geometry_y" label="Stretch Y" min={0.5} max={2} />
             <StealthSlider keyName="rotate" label="Roll" min={-45} max={45} step={0.1} />
             <StealthSlider keyName="crop_zoom" label="Sensor Crop" min={0} max={1} />
             <StealthSlider keyName="perspective_x" label="Tilt X" min={-1} max={1} />
             <StealthSlider keyName="perspective_y" label="Tilt Y" min={-1} max={1} />

             <SectionHeader title="Optical Phenomena" />
             <StealthSlider keyName="bloom" label="Bloom" min={0} max={1} color="amber" />
             <StealthSlider keyName="bloom_radius" label="Bloom Radius" min={0} max={2} color="amber" />
             <StealthSlider keyName="halation" label="Halation" min={0} max={1} color="red" />
             <StealthSlider keyName="chromatic_aberration" label="Chromatic" min={0} max={2} color="pink" />
             <StealthSlider keyName="diffusion" label="Mist" min={0} max={1} />
             <StealthSlider keyName="vignette" label="Vignette" min={0} max={1} />
             <StealthSlider keyName="vignette_roundness" label="Roundness" min={-1} max={1} />
             <StealthSlider keyName="vignette_feather" label="Feather" min={0} max={2} />
        </div>
      );

      case 'FILM': return (
        <div className="flex flex-col gap-1 pb-10">
             <SectionHeader title="Film Emulsion" />
             <StealthSlider keyName="grain" label="Grain Amount" min={0} max={1} />
             <StealthSlider keyName="grain_size" label="Grain Size" min={0.5} max={3} />
             <StealthSlider keyName="grain_roughness" label="Roughness" min={0} max={1} />
             <StealthSlider keyName="grain_color" label="Color Noise" min={0} max={1} color="pink" />

             <SectionHeader title="Spatial Detail" />
             <StealthSlider keyName="sharpness" label="Sharpness" min={0} max={2} />
             <StealthSlider keyName="structure" label="Structure" min={0} max={2} />
             <StealthSlider keyName="clarity" label="Clarity" min={0} max={2} />
             <StealthSlider keyName="dehaze" label="Dehaze" min={-1} max={1} />
             <StealthSlider keyName="denoise" label="Denoise" min={0} max={1} />
             <StealthSlider keyName="blur" label="Blur" min={0} max={10} step={0.1} />
        </div>
      );

      case 'FX': return (
        <div className="flex flex-col gap-1 pb-10">
             <SectionHeader title="Selective Color" />
             <StealthSlider keyName="selective_hue" label="Target Hue" min={0} max={360} step={1} color="pink" />
             <StealthSlider keyName="selective_threshold" label="Range" min={0} max={100} step={1} />
             <StealthSlider keyName="selective_mix" label="Desat BG" min={0} max={1} />
             <StealthSlider keyName="selective_target_sat" label="Boost Target" min={0} max={1} color="pink" />

             <SectionHeader title="Portrait Engine" />
             <StealthSlider keyName="skin_smooth" label="Skin Smooth" min={0} max={1} color="amber" />
             <StealthSlider keyName="face_warp" label="Face Slim" min={-1} max={1} />
             <StealthSlider keyName="eye_clarity" label="Eye Clarity" min={0} max={1} color="blue" />
             <StealthSlider keyName="teeth_whitening" label="Teeth White" min={0} max={1} />
             <StealthSlider keyName="feature_pop" label="Feature Pop" min={0} max={1} />
        </div>
      );

      case 'LUT': return (
        <div className="flex flex-col gap-8 pb-10">
            <div className="space-y-4">
              <SectionHeader title="Film Stocks (Emulation)" />
              <div className="grid grid-cols-2 gap-4">
                  {filmStocks.map(s => (
                    <button key={s.name} onClick={() => applyPreset(s)} className={`h-12 rounded-lg border transition-all flex items-center justify-between px-6 ${grading.preset_name === s.name ? 'border-indigo-500 bg-indigo-500/20 shadow-lg' : 'border-white/5 bg-zinc-900/40 hover:bg-zinc-800'}`}>
                      <span className={`text-[10px] font-black uppercase tracking-widest ${grading.preset_name === s.name ? 'text-white' : 'text-zinc-400'}`}>{s.name.replace('_', ' ')}</span>
                      {grading.preset_name === s.name && <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full shadow-[0_0_8px_indigo]" />}
                    </button>
                  ))}
               </div>

               <div className="pt-6 border-t border-white/5">
                  <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest px-1 mb-3 block">Save Current Profile</label>
                  <div className="flex gap-2">
                      <input type="text" value={newLutName} onChange={(e) => setNewLutName(e.target.value.toUpperCase())} placeholder="PROFILE NAME..." className="flex-1 bg-zinc-900/50 border border-white/10 rounded-lg px-4 py-3 text-[10px] mono text-white outline-none font-bold focus:border-indigo-500/50 transition-colors h-12" />
                      <button onClick={handleSaveLut} disabled={!newLutName.trim()} className="px-6 bg-indigo-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-indigo-500 active:scale-95 transition-all shadow-lg h-12">Save</button>
                  </div>
               </div>
            </div>

            {customLuts.length > 0 && (
              <div className="space-y-4">
                <SectionHeader title="User Profiles" />
                <div className="grid grid-cols-2 gap-4">
                    {customLuts.map((l, i) => (
                      <div key={i} className="flex gap-2 group relative">
                        <button onClick={() => applyPreset(l)} className={`flex-1 h-12 rounded-lg border transition-all flex items-center justify-between px-4 bg-zinc-900/60 ${grading.preset_name === l.name ? 'border-indigo-500 shadow-md' : 'border-white/5 hover:border-white/20'}`}>
                           <span className="text-[9px] font-black uppercase tracking-widest text-zinc-300 truncate">{l.name}</span>
                           {grading.preset_name === l.name && <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />}
                        </button>
                        <button onClick={() => handleRemoveLut(l.name)} className="w-12 h-12 bg-red-900/10 border border-red-500/10 rounded-lg flex items-center justify-center text-red-500/50 hover:text-red-500 hover:bg-red-900/20 transition-all">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth={2.5}/></svg>
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            )}
        </div>
      );
      default: return null;
    }
  };

  return (
    <div className="h-full overflow-y-auto custom-scrollbar p-8 md:p-12 bg-[#08080a]">
       {getCategoryContent()}
    </div>
  );
};

export default GradingControls;
