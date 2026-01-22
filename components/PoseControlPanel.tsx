
import React, { useRef, useState, useEffect } from 'react';
import { PoseData, VaultItem, AppSettings } from '../types';
import { extractDeepDNA } from '../geminiService';
import { env, pipeline } from '@xenova/transformers';

// Setup Transformers env
env.allowLocalModels = false;
env.useBrowserCache = true;

interface PoseControlPanelProps {
  poseControl?: PoseData;
  setPoseControl: (val?: PoseData) => void;
  vault: VaultItem[];
  sourceImage: string | null;
  onExecuteSurgical?: () => void;
  settings?: AppSettings;
  onOpenVault?: () => void;
}

declare var Pose: any;

const PoseControlPanel: React.FC<PoseControlPanelProps> = ({ 
  poseControl, setPoseControl, vault, sourceImage, onExecuteSurgical, settings, onOpenVault
}) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isStrippingBg, setIsStrippingBg] = useState(false);
  const [poseInstance, setPoseInstance] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'SKELETON' | 'ORIGINAL' | 'SEMANTIC'>('SKELETON');
  const [segmenter, setSegmenter] = useState<any>(null);

  // Initialize MediaPipe Pose
  useEffect(() => {
    if (typeof Pose !== 'undefined' && !poseInstance) {
      const p = new Pose({
        locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404/${file}`
      });
      p.setOptions({ modelComplexity: 1, smoothLandmarks: true, minDetectionConfidence: 0.5, minTrackingConfidence: 0.5 });
      setPoseInstance(p);
    }
  }, [poseInstance]);

  // Initialize Transformers Segmenter
  useEffect(() => {
    const loadSegmenter = async () => {
        try {
            const model = await pipeline('image-segmentation', 'Xenova/segformer-b0-finetuned-ade-512-512');
            setSegmenter(() => model);
        } catch (e) {
            console.warn("Transformers load failed, falling back to heuristic", e);
        }
    };
    loadSegmenter();
  }, []);

  // --- IMAGE PROCESSING UTILS ---

  const extractBackgroundContext = async (imgUrl: string) => {
      try {
          const dna = await extractDeepDNA(imgUrl, settings);
          const bgContext = dna.environment_context || dna.lighting_setup || "Neutral cinematic background";
          return bgContext;
      } catch (e) {
          return "Cinematic background";
      }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const result = ev.target?.result as string;
        const basePose: PoseData = {
          imageUrl: result, 
          strength: 1.0, 
          symmetry_strength: 1.0, 
          rigid_integrity: 1.0,
          preserveIdentity: true, 
          enabled: true, 
          warpMethod: 'thin_plate',
          ratioString: '16:9' // Default
        };
        setPoseControl(basePose);
        processSkeleton(basePose);
      };
      reader.readAsDataURL(file);
    }
  };

  // --- HYPER-RIG VISUALIZER V6 (Engineering Audit Grade) ---
  const drawHyperRig = (landmarks: any[], img: HTMLImageElement): string => {
    const width = img.width;
    const height = img.height;
    
    const canvas = document.createElement('canvas');
    canvas.width = width; canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';
    
    // 1. Absolute Black Background - Zero Noise
    ctx.fillStyle = '#000000'; ctx.fillRect(0, 0, width, height);
    
    // Config
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // Technical Vector Thickness
    const boneWidth = Math.max(3, width * 0.006); 
    const jointRadius = Math.max(4, width * 0.008);

    // Color Palette: Pure Computer Vision Colors
    const C_LEFT = '#00FF00';   // Pure Green (L)
    const C_RIGHT = '#FF00FF';  // Pure Magenta (R)
    const C_CORE = '#FFFFFF';   // Pure White (Core)

    const drawBone = (idx1: number, idx2: number, color: string) => {
        if (!landmarks[idx1] || !landmarks[idx2] || landmarks[idx1].visibility < 0.3 || landmarks[idx2].visibility < 0.3) return;
        
        // Zero Blur/Shadow for sharp edge detection in Audit Stage
        ctx.shadowBlur = 0; 

        // Draw Bone
        ctx.beginPath();
        ctx.moveTo(landmarks[idx1].x * width, landmarks[idx1].y * height);
        ctx.lineTo(landmarks[idx2].x * width, landmarks[idx2].y * height);
        ctx.strokeStyle = color;
        ctx.lineWidth = boneWidth;
        ctx.stroke();
    };

    const drawJoint = (idx: number, color: string) => {
        if (!landmarks[idx] || landmarks[idx].visibility < 0.3) return;
        
        ctx.shadowBlur = 0;
        
        ctx.beginPath();
        ctx.arc(landmarks[idx].x * width, landmarks[idx].y * height, jointRadius, 0, 2 * Math.PI);
        ctx.fillStyle = color;
        ctx.fill();
    };

    // 1. Torso Box
    drawBone(11, 12, C_CORE); // Shoulder Bridge
    drawBone(23, 24, C_CORE); // Hip Bridge
    drawBone(11, 23, C_LEFT); // Left Torso
    drawBone(12, 24, C_RIGHT); // Right Torso

    // 2. Arms (Left)
    drawBone(11, 13, C_LEFT); // Upper Arm
    drawBone(13, 15, C_LEFT); // Forearm
    
    // 3. Arms (Right)
    drawBone(12, 14, C_RIGHT); // Upper Arm
    drawBone(14, 16, C_RIGHT); // Forearm

    // 4. Legs (Left)
    drawBone(23, 25, C_LEFT); // Thigh
    drawBone(25, 27, C_LEFT); // Shin
    drawBone(27, 29, C_LEFT); // Foot heel
    drawBone(29, 31, C_LEFT); // Foot toe

    // 5. Legs (Right)
    drawBone(24, 26, C_RIGHT); // Thigh
    drawBone(26, 28, C_RIGHT); // Shin
    drawBone(28, 30, C_RIGHT); // Foot heel
    drawBone(30, 32, C_RIGHT); // Foot toe

    // 6. Head & Neck
    const midShoulderX = (landmarks[11].x + landmarks[12].x) / 2;
    const midShoulderY = (landmarks[11].y + landmarks[12].y) / 2;
    if (landmarks[0]) {
        ctx.beginPath();
        ctx.moveTo(midShoulderX * width, midShoulderY * height);
        ctx.lineTo(landmarks[0].x * width, landmarks[0].y * height);
        ctx.strokeStyle = C_CORE;
        ctx.lineWidth = boneWidth;
        ctx.stroke();
        
        drawJoint(0, C_CORE); // Nose
    }

    // 7. Joints
    const joints = [11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28];
    joints.forEach(j => {
        const color = (j % 2 !== 0) ? C_LEFT : C_RIGHT;
        drawJoint(j, color);
    });

    // 8. Machine Vision Anchors (For Auto-Crop stability)
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, 10, 10);
    ctx.fillRect(width-10, height-10, 10, 10);

    return canvas.toDataURL('image/png');
  };

  const processSkeleton = async (currentPoseControl: PoseData) => {
    if (!currentPoseControl.imageUrl || !poseInstance) return;
    setIsExtracting(true);
    try {
        const img = new Image();
        img.src = currentPoseControl.imageUrl;
        img.crossOrigin = "anonymous";
        await new Promise((resolve) => { img.onload = resolve; });

        const targetAspectRatio = { width: img.width, height: img.height };

        poseInstance.onResults(async (results: any) => {
            if (results.poseLandmarks) {
                // Generate the Hyper-Rig
                const hyperRig = drawHyperRig(results.poseLandmarks, img);
                
                let bgContext = "Studio Background";
                if (sourceImage) {
                    bgContext = await extractBackgroundContext(sourceImage);
                }

                setPoseControl({
                    ...currentPoseControl,
                    skeletonImage: hyperRig,
                    poseMaskImage: hyperRig, 
                    landmarks: results.poseLandmarks,
                    technicalDescription: `HYPER_RIG_V6 [Engineering Audit]`,
                    poseText: "", 
                    backgroundContext: bgContext,
                    targetAspectRatio
                });
                setIsExtracting(false);
            } else {
                setIsExtracting(false);
                alert("Pose extraction failed. Try a clearer image.");
            }
        });
        await poseInstance.send({ image: img });
    } catch (e) { setIsExtracting(false); }
  };

  useEffect(() => {
    if (poseControl && poseControl.imageUrl && !poseControl.skeletonImage && !isExtracting) {
        processSkeleton(poseControl);
    }
  }, [poseControl]);

  const handleExecute = async () => {
      if (!onExecuteSurgical) return;
      onExecuteSurgical();
  };

  const handleRatioChange = (ratio: '16:9' | '9:16' | '1:1') => {
      if (poseControl) {
          setPoseControl({ ...poseControl, ratioString: ratio });
      }
  };

  return (
    <div className="bg-[#0e0e11] border border-cyan-500/20 rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col p-6 space-y-6 relative group/rig">
      <div className="flex justify-between items-center border-b border-white/5 pb-4">
        <div className="flex flex-col">
          <h3 className="text-[10px] font-black uppercase text-cyan-400 tracking-[0.4em] flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
            Hyper-Rig V6
          </h3>
          <span className="text-[6px] text-zinc-600 font-bold uppercase mt-1">Audit-Ready Engineering Map</span>
        </div>
        {poseControl && (
          <button onClick={() => setPoseControl(undefined)} className="text-zinc-600 hover:text-white transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth={3}/></svg>
          </button>
        )}
      </div>

      {!poseControl ? (
        <div className="aspect-video bg-black/40 border-2 border-dashed border-cyan-500/10 rounded-[2rem] flex flex-col items-center justify-center gap-4 group hover:border-cyan-500/30 transition-all">
          <div className="flex gap-3">
            <button onClick={() => fileRef.current?.click()} className="px-6 py-3 bg-zinc-900 border border-white/5 rounded-2xl text-[9px] font-black uppercase text-zinc-400 hover:text-white transition-all hover:bg-zinc-800">Upload Pose</button>
            <button onClick={() => onOpenVault?.()} className="px-6 py-3 bg-cyan-600/10 border border-cyan-500/20 rounded-2xl text-[9px] font-black uppercase text-cyan-400 hover:bg-cyan-600/20">Vault</button>
          </div>
          <input type="file" ref={fileRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
          <p className="text-[8px] font-black uppercase tracking-[0.2em] text-zinc-700 group-hover:text-zinc-500 transition-colors">Select Skeleton Source</p>
        </div>
      ) : (
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
          <div className="relative aspect-[4/3] w-full rounded-[2rem] overflow-hidden border border-cyan-500/20 bg-black group/preview">
             <img 
               src={viewMode === 'SKELETON' ? poseControl.skeletonImage : poseControl.imageUrl} 
               className="w-full h-full object-contain" 
               alt="Pose Reference" 
             />
             {(isExtracting || isStrippingBg) && (
                <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-cyan-400 text-[8px] font-black uppercase tracking-widest animate-pulse gap-2">
                    <div className="w-4 h-4 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                    {isStrippingBg ? 'Removing Background...' : 'Mapping Joints...'}
                </div>
             )}
             <button onClick={() => setViewMode(v => v === 'SKELETON' ? 'ORIGINAL' : 'SKELETON')} className="absolute bottom-4 right-4 bg-black/80 hover:bg-cyan-600/40 text-white px-4 py-2 rounded-xl text-[8px] font-black uppercase border border-white/10 transition-all">
                {viewMode === 'SKELETON' ? 'Show Ref' : 'Show Rig'}
             </button>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
             <div className="p-4 bg-cyan-600/5 border border-cyan-500/20 rounded-2xl flex flex-col justify-between">
                 <span className="text-[7px] font-black text-cyan-400 uppercase tracking-widest">Rig Integrity</span>
                 <p className="text-[8px] text-zinc-300 mono font-bold leading-tight mt-1">Audit Level</p>
             </div>
             <div className="p-4 bg-indigo-600/5 border border-indigo-500/20 rounded-2xl flex flex-col justify-between">
                 <span className="text-[7px] font-black text-indigo-400 uppercase tracking-widest">Environment</span>
                 <p className="text-[9px] text-zinc-300 mono font-bold truncate" title={poseControl.backgroundContext}>
                    {poseControl.backgroundContext ? 'Context Locked' : 'Scanning...'}
                 </p>
             </div>
          </div>

          <div className="flex gap-2">
             {['16:9', '9:16', '1:1'].map((r) => (
                 <button 
                    key={r}
                    onClick={() => handleRatioChange(r as any)}
                    className={`flex-1 py-3 rounded-xl text-[8px] font-black uppercase transition-all ${poseControl.ratioString === r ? 'bg-cyan-600 text-white shadow-lg' : 'bg-zinc-800 text-zinc-500 hover:bg-zinc-700'}`}
                 >
                    {r}
                 </button>
             ))}
          </div>

          <button onClick={handleExecute} disabled={!sourceImage || isExtracting || isStrippingBg} className="w-full py-8 bg-gradient-to-r from-red-700 to-indigo-600 hover:from-red-600 hover:to-indigo-500 text-white rounded-[2rem] font-black uppercase tracking-[0.6em] text-[11px] shadow-[0_0_40px_rgba(220,38,38,0.3)] transition-all active:scale-[0.98] disabled:opacity-30 relative overflow-hidden group">
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            {isExtracting ? 'ANALYZING...' : 'INITIATE 5-STAGE PIPELINE'}
          </button>
        </div>
      )}
    </div>
  );
};

export default PoseControlPanel;
