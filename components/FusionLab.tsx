
import React, { useState, useEffect } from 'react';
import { VaultItem, FusionManifest, LatentParams, AgentStatus, AppSettings, AgentType } from '../types';
import { executeFusion, autoOptimizeFusion, visualAnalysisJudge, refinePromptDNA } from '../geminiService';
import AgentFeed from './AgentFeed';

// Subcomponents
import FusionHeader from './fusionLab/FusionHeader';
import FusionReactorControls from './fusionLab/FusionReactorControls';
import FusionSlots from './fusionLab/FusionSlots';
import FusionAction from './fusionLab/FusionAction';

interface FusionLabProps {
  vault: VaultItem[];
  onResult: (imageUrl: string, params: LatentParams, logs: any[]) => void;
  settings?: AppSettings;
}

const FusionLab: React.FC<FusionLabProps> = ({ vault, onResult, settings }) => {
  const [manifest, setManifest] = useState<FusionManifest>({
    pep_id: '',
    pop_id: '',
    pov_id: '',
    amb_id: '',
    weights: { pep: 1.0, pop: 1.0, pov: 1.0, amb: 1.0 },
    style_modifiers: [],
    surgicalSwap: false,
    fusionIntent: '',
    protectionStrength: 1.5
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAutoPilotActive, setIsAutoPilotActive] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [alchemistLogs, setAlchemistLogs] = useState<AgentStatus[]>([]);
  const [autoRefine, setAutoRefine] = useState(false);
  const [fusionResultUrl, setFusionResultUrl] = useState<string | null>(null);

  const handleFusion = async () => {
    if (!manifest.pep_id && !manifest.pop_id) {
      alert("PEP (Identity) and POP (Pose) nodes are required for a stable reactor start.");
      return;
    }
    setIsProcessing(true);
    // Added AgentStatus cast to prevent widening of string literals like 'Neural Alchemist' or 'processing'
    setAlchemistLogs([{ 
      type: 'Neural Alchemist' as AgentType, 
      status: 'processing' as const, 
      message: 'Warping Reactor for Identity Migration...', 
      timestamp: Date.now(), 
      department: 'Advanced' 
    } as AgentStatus]);
    
    try {
      const result = await executeFusion(manifest, vault, settings);
      setFusionResultUrl(result.imageUrl);
      setAlchemistLogs(prev => [...prev, ...result.logs]);

      if (autoRefine && result.imageUrl) {
        // Added AgentStatus cast to prevent widening of string literals
        setAlchemistLogs(prev => [...prev, { 
          type: 'Visual Quality Judge' as AgentType, 
          status: 'processing' as const, 
          message: 'Analyzing Character Migration Integrity...', 
          timestamp: Date.now(), 
          department: 'Advanced' 
        } as AgentStatus]);
        const popItem = vault.find(v => v.shortId === manifest.pop_id);
        const judgeResult = await visualAnalysisJudge(result.imageUrl, manifest.fusionIntent, popItem?.imageUrl, settings);
        
        // Added AgentStatus cast to prevent widening of string literals
        setAlchemistLogs(prev => [...prev, { 
          type: 'Visual Quality Judge' as AgentType, 
          status: 'completed' as const, 
          message: `Consensus Score: ${Math.round(judgeResult.score * 100)}%. ${judgeResult.critique}`, 
          timestamp: Date.now(), 
          department: 'Advanced' 
        } as AgentStatus]);

        if (judgeResult.score < 0.7) {
          // Added AgentStatus cast to prevent widening of string literals
          setAlchemistLogs(prev => [...prev, { 
            type: 'Latent Optimizer' as AgentType, 
            status: 'processing' as const, 
            message: `Refining character consistency: ${judgeResult.suggestion}`, 
            timestamp: Date.now(), 
            department: 'Advanced' 
          } as AgentStatus]);
          const refinedManifest = { ...manifest, fusionIntent: `${manifest.fusionIntent}. Ensure full character migration: ${judgeResult.suggestion}` };
          const refinedResult = await executeFusion(refinedManifest, vault, settings);
          if (refinedResult.imageUrl) {
            setFusionResultUrl(refinedResult.imageUrl);
            // Added AgentStatus cast to prevent widening of string literals
            setAlchemistLogs(prev => [...prev, { 
              type: 'Director' as AgentType, 
              status: 'completed' as const, 
              message: 'Identity Migration stabilized.', 
              timestamp: Date.now(), 
              department: 'Direction' 
            } as AgentStatus]);
            // Added fix: construct full LatentParams from partial result.params
            const finalRefinedParams: LatentParams = {
              z_anatomy: 1.0,
              z_structure: 1.0,
              z_lighting: 1.0,
              z_texture: 1.0,
              hz_range: 'Fusion-v10.2',
              structural_fidelity: 1.0,
              scale_factor: 1.0,
              neural_metrics: refinedResult.params.neural_metrics
            };
            onResult(refinedResult.imageUrl, finalRefinedParams, alchemistLogs);
            return;
          }
        }
      }

      if (result.imageUrl) {
        // Added fix: construct full LatentParams from partial result.params
        const finalParams: LatentParams = {
          z_anatomy: 1.0,
          z_structure: 1.0,
          z_lighting: 1.0,
          z_texture: 1.0,
          hz_range: 'Fusion-v10.2',
          structural_fidelity: 1.0,
          scale_factor: 1.0,
          neural_metrics: result.params.neural_metrics
        };
        onResult(result.imageUrl, finalParams, alchemistLogs);
      }

    } catch (e) {
      console.error(e);
      // Added AgentStatus cast to prevent widening of string literals
      setAlchemistLogs(prev => [...prev, { 
        type: 'Neural Alchemist' as AgentType, 
        status: 'error' as const, 
        message: 'Critical Reactor Melt.', 
        timestamp: Date.now(), 
        department: 'Advanced' 
      } as AgentStatus]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRefineIntent = async () => {
    if (!manifest.fusionIntent.trim() || isOptimizing) return;
    setIsOptimizing(true);
    // Added AgentStatus cast to prevent widening of string literals
    setAlchemistLogs(prev => [...prev, { 
      type: 'Meta-Prompt Translator' as AgentType, 
      status: 'processing' as const, 
      message: 'Expanding Intent...', 
      timestamp: Date.now(), 
      department: 'Advanced' 
    } as AgentStatus]);
    try {
      const result = await refinePromptDNA(manifest.fusionIntent, settings);
      setManifest(prev => ({ ...prev, fusionIntent: result.refined }));
      setAlchemistLogs(prev => [...prev, ...result.logs]);
    } catch (e) { console.error(e); } finally { setIsOptimizing(false); }
  };

  const handleAutoPilotTrigger = async () => {
    if (!manifest.fusionIntent.trim()) {
      alert("Neural intent required.");
      setIsAutoPilotActive(false);
      return;
    }
    setIsOptimizing(true);
    try {
      const { manifest: optimizedManifest } = await autoOptimizeFusion(manifest.fusionIntent, manifest, vault, settings);
      setManifest(optimizedManifest);
      // Added AgentStatus cast to prevent widening of string literals
      setAlchemistLogs(prev => [...prev, { 
        type: 'Visual Archivist' as AgentType, 
        status: 'completed' as const, 
        message: 'Optimal Character mapping identified.', 
        timestamp: Date.now(), 
        department: 'Direction' 
      } as AgentStatus]);
    } catch (e) { console.error(e); setIsAutoPilotActive(false); } finally { setIsOptimizing(false); }
  };

  useEffect(() => {
    if (isAutoPilotActive && manifest.fusionIntent.trim() && !isOptimizing) {
      handleAutoPilotTrigger();
    }
  }, [isAutoPilotActive]);

  const handleSelectSlot = (key: keyof FusionManifest, id: string) => {
    setManifest(prev => ({ ...prev, [key]: id }));
  };

  return (
    <div className="min-h-full bg-[#08080a] p-6 lg:p-12 flex flex-col lg:flex-row gap-12 pb-32 overflow-y-auto">
      <div className="flex-1 space-y-12 max-w-5xl">
        <FusionHeader />

        <FusionReactorControls 
          intent={manifest.fusionIntent}
          onIntentChange={(val) => setManifest(prev => ({ ...prev, fusionIntent: val }))}
          onRefine={handleRefineIntent}
          isOptimizing={isOptimizing}
          isAutoPilot={isAutoPilotActive}
          onAutoPilotToggle={() => setIsAutoPilotActive(!isAutoPilotActive)}
        />

        <FusionSlots 
          manifest={manifest} 
          vault={vault} 
          onSelectSlot={handleSelectSlot} 
          isOptimizing={isOptimizing} 
        />

        <FusionAction 
          onFusion={handleFusion} 
          isProcessing={isProcessing} 
          isOptimizing={isOptimizing} 
        />
      </div>

      <div className="w-full lg:w-[400px] space-y-8 h-fit lg:sticky lg:top-32">
        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 px-2">Reactor Log Telemetry</h3>
        <AgentFeed logs={alchemistLogs} isProcessing={isProcessing} />
      </div>
    </div>
  );
};

export default FusionLab;
