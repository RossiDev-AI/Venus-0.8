
import React, { useState, useRef, useEffect } from 'react';
import { AgentStatus, LatentParams, VaultItem, VaultDomain, LatentGrading, VisualAnchor, DeliberationStep, AgentAuthority, PoseData, AppSettings } from '../../types';
import { extractDeepDNA, executeGroundedSynth, optimizeVisualPrompt } from '../../geminiService';
import AgentFeed from '../shared/AgentFeed';
import ZModeModal from '../modals/ZModeModal';
import LGNEditor from '../modals/LGNEditor';
import MetricsDashboard from '../shared/MetricsDashboard';
import ProcessingControl from '../shared/ProcessingControl';
import PoseControlPanel from '../PoseControlPanel';
import CinemaVaultModal from '../cinemaLab/CinemaVaultModal';

import StudioPreview from '../workspaceLab/StudioPreview';
import StudioSidebarHeader from '../workspaceLab/StudioSidebarHeader';
import StudioAuthorityPanel from '../workspaceLab/StudioAuthorityPanel';
import StudioConsensusReport from '../workspaceLab/StudioConsensusReport';
import StudioActionPanel from '../workspaceLab/StudioActionPanel';

interface WorkspaceProps {
  onSave: (item: VaultItem) => Promise<void>;
  vault: VaultItem[];
  prompt: string;
  setPrompt: (val: string) => void;
  currentImage: string | null;
  setCurrentImage: (val: string | null) => void;
  originalSource: string | null;
  setOriginalSource: (val: string | null) => void;
  logs: AgentStatus[];
  setLogs: React.Dispatch<React.SetStateAction<AgentStatus[]>>;
  params: LatentParams;
  setParams: React.Dispatch<React.SetStateAction<LatentParams>>;
  onReloadApp: () => void;
  grading?: LatentGrading;
  visualAnchor?: VisualAnchor;
  settings?: AppSettings;
}

const Workspace: React.FC<WorkspaceProps> = ({ 
  onSave, vault, prompt, setPrompt, currentImage, setCurrentImage,
  originalSource, setOriginalSource, logs, setLogs, params, setParams,
  onReloadApp, grading: initialGrading, settings
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [isZModeOpen, setIsZModeOpen] = useState(false);
  const [isLGNOpen, setIsLGNOpen] = useState(false);
  const [isPoseOpen, setIsPoseOpen] = useState(false);
  const [isBiopsyActive, setIsBiopsyActive] = useState(false);
  const [showVaultPicker, setShowVaultPicker] = useState(false);
  const [activePickerDomain, setActivePickerDomain] = useState<VaultDomain | 'BASE' | 'POSE'>('BASE');
  
  const [activeSourceNodeId, setActiveSourceNodeId] = useState<string | undefined>(undefined);
  const [lastEnhancedPrompt, setLastEnhancedPrompt] = useState<string>('');
  
  const [collisionReport, setCollisionReport] = useState<{logic: string, prompt: string} | null>(null);
  const [localGrading, setLocalGrading] = useState<LatentGrading | undefined>(initialGrading);
  const [deliberationFlow, setDeliberationFlow] = useState<DeliberationStep[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const agentMessages = [
    "Kernel Initiating: Calling Meta-Prompt Translator...", 
    "Consulting Visual Scout for Optical Truth...", 
    "Lighting Architect calculating photon bounce...", 
    "Texture Master biopsying material surfaces...",
    "Merging consensus into Final Directive..."
  ];

  const loadingMessages = params.pose_control?.enabled 
    ? ["COMPOSITION_LOCK_ACTIVE", "ALIGNING_VECTORS", "SYNTHESIZING_PIXELS"] 
    : agentMessages;

  useEffect(() => {
    setLocalGrading(initialGrading);
  }, [initialGrading]);

  useEffect(() => {
    let interval: any;
    if (isProcessing || isBiopsyActive || isOptimizing || isSaving) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep(prev => (prev + 1) % loadingMessages.length);
      }, 2500);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isProcessing, isBiopsyActive, isOptimizing, isSaving, loadingMessages.length]);

  const runNeuralBiopsy = async (imgUrl: string, silent: boolean = false) => {
    if (!silent) setIsBiopsyActive(true);
    if (!silent) setLogs(prev => [...prev, { 
      type: 'Attribute Mapper', 
      status: 'processing', 
      message: 'V12.5 Rigorous Forensic Biopsy (English Standard)...', 
      timestamp: Date.now(), 
      department: 'Advanced' 
    }]);

    try {
      const dna = await extractDeepDNA(imgUrl, settings);
      
      let detectedDomain: VaultDomain = 'Z';
      if (dna.character_details && dna.character_details.length > 5) detectedDomain = 'X';
      else if (dna.environment_context && dna.environment_context.length > 5) detectedDomain = 'Y';
      else if (dna.lighting_setup && String(dna.lighting_setup).toLowerCase().includes('light')) detectedDomain = 'L';

      setParams(prev => ({ ...prev, dna, vault_domain: detectedDomain }));
      
      if (!silent) setLogs(prev => [...prev, { 
        type: 'Attribute Mapper', 
        status: 'completed', 
        message: `DNA Sequenced: ${dna.human_description}`, 
        timestamp: Date.now(), 
        department: 'Advanced' 
      }]);
      
      return { dna, detectedDomain };
    } catch (err: any) {
      console.error("Biopsy Error:", err);
      const isQuota = err?.message?.includes('429') || JSON.stringify(err).includes('429') || JSON.stringify(err).includes('RESOURCE_EXHAUSTED');
      if (!silent) setLogs(prev => [...prev, { 
        type: 'Attribute Mapper', 
        status: 'error', 
        message: isQuota ? 'Quota Limit Reached. Try later.' : 'Rigorous Sequence Fault.', 
        timestamp: Date.now() 
      }]);
      return null;
    } finally {
      if (!silent) setIsBiopsyActive(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const result = ev.target?.result as string;
        setCurrentImage(result);
        setOriginalSource(result);
        setActiveSourceNodeId(undefined); 
        runNeuralBiopsy(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVaultSelect = (item: VaultItem) => {
    if (activePickerDomain === 'BASE') {
      setCurrentImage(item.imageUrl);
      setOriginalSource(item.imageUrl);
      setActiveSourceNodeId(item.id); 
      runNeuralBiopsy(item.imageUrl);
    } else if (activePickerDomain === 'POSE') {
      const basePose: PoseData = {
        imageUrl: item.imageUrl,
        strength: 1.0, 
        symmetry_strength: 0.5,
        rigid_integrity: 1.0,
        preserveIdentity: true,
        enabled: true,
        warpMethod: 'thin_plate',
        dna: item.dna,
        technicalDescription: `[COMPOSITION_REFERENCE] Vault Source: ${item.shortId}`
      };
      setParams(prev => ({ ...prev, pose_control: basePose }));
      setLogs(prev => [...prev, { 
        type: 'Puppeteer Agent', 
        status: 'completed', 
        message: `COMPOSITION_REFERENCE_LOADED.`, 
        timestamp: Date.now(), 
        department: 'Casting' 
      }]);
    } else {
      setParams(prev => ({
        ...prev,
        active_slots: {
          ...(prev.active_slots || {}),
          [activePickerDomain as VaultDomain]: item.shortId
        }
      }));
    }
    setShowVaultPicker(false);
  };

  const handleOptimizePrompt = async () => {
    if (!prompt.trim() || isOptimizing) return;
    setIsOptimizing(true);
    setLogs(prev => [...prev, { 
      type: 'Meta-Prompt Translator', 
      status: 'processing', 
      message: 'Upleveling user intent to Industrial Meta-Prompt...', 
      timestamp: Date.now(), 
      department: 'Advanced' 
    }]);
    try {
      const optimized = await optimizeVisualPrompt(prompt, settings, currentImage || undefined);
      setPrompt(optimized);
      setLastEnhancedPrompt(optimized);
      setLogs(prev => [...prev, { type: 'Meta-Prompt Translator', status: 'completed', message: 'Ready for surgical synth.', timestamp: Date.now(), department: 'Advanced' }]);
    } catch (e) {
      console.error(e);
      setLogs(prev => [...prev, { type: 'Meta-Prompt Translator', status: 'error', message: 'Optimization Fault.', timestamp: Date.now() }]);
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleProcess = async () => {
    const isBypassMode = params.pose_control?.enabled && params.pose_control?.poseMaskImage;
    if (!prompt.trim() && !isBypassMode) return;
    
    setIsProcessing(true);
    setLogs([]);
    setDeliberationFlow([]);
    try {
      const auth = params.agent_authority || { lighting: 50, texture: 50, structure: 50, anatomy: 50 };
      
      const poseMask = params.pose_control?.enabled ? params.pose_control.poseMaskImage : undefined;
      const poseLandmarks = params.pose_control?.enabled ? params.pose_control.landmarks : undefined;
      const poseText = params.pose_control?.enabled ? params.pose_control.poseText : undefined;
      const ratioString = params.pose_control?.enabled ? params.pose_control.ratioString : undefined;
      
      let result = await executeGroundedSynth(
        prompt, 
        {}, 
        vault, 
        auth, 
        settings, 
        originalSource || undefined,
        undefined, 
        poseLandmarks,
        poseMask,
        poseText,
        ratioString
      );

      if (result.imageUrl) {
        setCurrentImage(result.imageUrl);
        setLogs(result.logs);
        setLastEnhancedPrompt(result.enhancedPrompt || prompt);
        setDeliberationFlow(result.deliberation_flow || []);
        setParams(prev => ({ ...prev, agent_authority: auth }));
        setCollisionReport({ logic: result.collision_logic || (isBypassMode ? 'Direct Composition Lock' : 'Multi-Agent Consensus'), prompt: result.enhancedPrompt || '' });
        
        if (result.grading && !poseMask) setLocalGrading(result.grading);
      }
    } catch (error: any) { 
        console.error("Workspace Process Error:", error);
        const errorMessage = error.message || 'Kernel Deliberation Fault.';
        setLogs(prev => [...prev, { type: 'Director', status: 'error', message: errorMessage, timestamp: Date.now() }]);
    } finally { 
        setIsProcessing(false); 
    }
  };

  const handleCommit = async () => {
    if (!currentImage || isSaving) return;
    setIsSaving(true);
    setLogs(prev => [...prev, { 
        type: 'Visual Archivist', 
        status: 'processing', 
        message: 'ARCHIVAL_PROTOCOL: Triggering post-synth forensic biopsy...', 
        timestamp: Date.now(), 
        department: 'Advanced' 
    }]);

    try {
      const biopsyResult = await runNeuralBiopsy(currentImage, true);
      if (!biopsyResult) throw new Error("Biopsy Failed");

      const { dna, detectedDomain } = biopsyResult;
      const nodeName = dna.human_description?.split(',').slice(0, 2).join('_').replace(/\s/g, '_').replace(/[^a-zA-Z0-9_]/g, '').substring(0, 30) || `MAD_${Math.floor(Date.now()/1000)}`;
      
      const item: VaultItem = {
        id: crypto.randomUUID(),
        shortId: `LCP-${Math.floor(10000 + Math.random() * 90000)}`,
        name: nodeName,
        imageUrl: currentImage,
        originalImageUrl: originalSource || currentImage,
        prompt: lastEnhancedPrompt || prompt, 
        agentHistory: logs,
        params: { ...params, dna },
        dna: dna,
        rating: 5,
        timestamp: Date.now(),
        usageCount: 0,
        neuralPreferenceScore: 50,
        isFavorite: false,
        vaultDomain: detectedDomain || params.vault_domain || 'X',
        grading: localGrading,
        sourceNodeId: activeSourceNodeId 
      };
      
      await onSave(item);
      setLogs(prev => [...prev, { 
        type: 'Visual Archivist', 
        status: 'completed', 
        message: `NODE_COMMITTED: ${nodeName}. Full DNA indexed in Vault ${item.vaultDomain}.`, 
        timestamp: Date.now() 
      }]);
      window.alert(`Vault Commit Successful.\nNode: ${nodeName}\nDomain: ${item.vaultDomain}`);
    } catch (e: any) { 
        console.error(e);
        setLogs(prev => [...prev, { type: 'Visual Archivist', status: 'error', message: 'Archival sequence failed.', timestamp: Date.now() }]);
    } finally { 
        setIsSaving(false); 
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#0c0c0e] relative overflow-hidden min-h-full">
      <div className="hidden md:block">
        <MetricsDashboard params={params} />
      </div>
      
      <div className="flex-1 flex flex-col md:flex-row relative">
        <StudioPreview 
          currentImage={currentImage} 
          isProcessing={isProcessing || isSaving} 
          isBiopsyActive={isBiopsyActive} 
          loadingMessage={isSaving ? "ARCHIVING FORENSIC DATA..." : loadingMessages[loadingStep]} 
          localGrading={localGrading} 
          params={params} 
          vault={vault} 
          onUploadClick={() => fileInputRef.current?.click()} 
          onOpenVault={(domain) => {
            setActivePickerDomain(domain || 'BASE');
            setShowVaultPicker(true);
          }}
          onSlotClick={() => {}} 
        />
        
        <div className="w-full md:w-[380px] lg:w-[440px] flex flex-col bg-[#0e0e11] border-l border-white/5 shadow-2xl relative overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-5 md:space-y-8 custom-scrollbar">
            <StudioSidebarHeader 
              onPurge={onReloadApp} 
              onZMode={() => setIsZModeOpen(true)} 
              onPose={() => setIsPoseOpen(!isPoseOpen)} 
              onLGN={() => setIsLGNOpen(true)} 
              isPoseOpen={isPoseOpen} 
              hasGrading={!!localGrading} 
            />

            {isPoseOpen ? (
              <PoseControlPanel 
                poseControl={params.pose_control} 
                setPoseControl={(pose) => setParams(prev => ({ ...prev, pose_control: pose }))} 
                vault={vault} 
                sourceImage={currentImage} 
                onExecuteSurgical={handleProcess}
                settings={settings}
                onOpenVault={() => {
                  setActivePickerDomain('POSE');
                  setShowVaultPicker(true);
                }}
              />
            ) : (
              <>
                <StudioAuthorityPanel 
                  authority={params.agent_authority || { lighting: 50, texture: 50, structure: 50, anatomy: 50 }} 
                  onChange={(key, val) => setParams(prev => ({ ...prev, agent_authority: { ...(prev.agent_authority || { lighting: 50, texture: 50, structure: 50, anatomy: 50 }), [key]: val } }))} 
                />
                <StudioConsensusReport report={collisionReport} />
                <ProcessingControl speed={params.processing_speed || 'Balanced'} setSpeed={(val) => setParams(prev => ({ ...prev, processing_speed: val }))} />
                <AgentFeed logs={logs} isProcessing={isProcessing || isOptimizing || isSaving} deliberation_flow={deliberationFlow} />
              </>
            )}
          </div>
          
          <div className="flex-shrink-0">
            <StudioActionPanel 
              prompt={prompt} 
              setPrompt={setPrompt} 
              onProcess={handleProcess} 
              onCommit={handleCommit} 
              onOptimize={handleOptimizePrompt}
              isProcessing={isProcessing} 
              isSaving={isSaving} 
              isOptimizing={isOptimizing}
              hasImage={!!currentImage} 
              targetDomain={params.vault_domain || 'X'}
              setTargetDomain={(d) => setParams(prev => ({ ...prev, vault_domain: d }))}
            />
          </div>
        </div>
      </div>

      <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />

      {showVaultPicker && (
        <CinemaVaultModal 
          items={vault} 
          onClose={() => setShowVaultPicker(false)} 
          onSelect={handleVaultSelect} 
        />
      )}

      <ZModeModal isOpen={isZModeOpen} onClose={() => setIsZModeOpen(false)} params={params} setParams={setParams} onAutoTune={() => {}} />
      {localGrading && <LGNEditor isOpen={isLGNOpen} onClose={() => setIsLGNOpen(false)} grading={localGrading} onChange={setLocalGrading} />}
    </div>
  );
};

export default Workspace;
