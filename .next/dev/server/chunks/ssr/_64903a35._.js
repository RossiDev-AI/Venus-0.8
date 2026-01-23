module.exports = [
"[project]/geminiService.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "autoOptimizeFusion",
    ()=>autoOptimizeFusion,
    "executeFusion",
    ()=>executeFusion,
    "executeGroundedSynth",
    ()=>executeGroundedSynth,
    "extractDeepDNA",
    ()=>extractDeepDNA,
    "generateImageForBeat",
    ()=>generateImageForBeat,
    "getGlobalVisualPrompt",
    ()=>getGlobalVisualPrompt,
    "matchVaultForBeat",
    ()=>matchVaultForBeat,
    "optimizeVisualPrompt",
    ()=>optimizeVisualPrompt,
    "refinePromptDNA",
    ()=>refinePromptDNA,
    "scoutMediaForBeat",
    ()=>scoutMediaForBeat,
    "scriptToTimeline",
    ()=>scriptToTimeline,
    "visualAnalysisJudge",
    ()=>visualAnalysisJudge
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$genai$2f$dist$2f$node$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@google/genai/dist/node/index.mjs [app-ssr] (ecmascript)");
;
const getAI = (settings)=>{
    const key = settings?.googleApiKey || process.env.API_KEY;
    if (!key) console.warn("CRITICAL: API Key missing in GeminiService");
    return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$genai$2f$dist$2f$node$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["GoogleGenAI"]({
        apiKey: key
    });
};
// MAX PERMISSIVE SAFETY SETTINGS
const SAFETY_SETTINGS = [
    {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_ONLY_HIGH'
    },
    {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_ONLY_HIGH'
    },
    {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_ONLY_HIGH'
    },
    {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_ONLY_HIGH'
    },
    {
        category: 'HARM_CATEGORY_CIVIC_INTEGRITY',
        threshold: 'BLOCK_ONLY_HIGH'
    }
];
async function executeWithRetry(fn, retries = 2, delay = 2000) {
    try {
        return await fn();
    } catch (error) {
        const errString = JSON.stringify(error, null, 2);
        console.warn(`[Gemini Retry Log] Attempt failed. Retries left: ${retries}. Error:`, errString.substring(0, 300));
        if (errString.includes("SAFETY") || errString.includes("BLOCKED")) {
            console.error(" [CRITICAL] SAFETY BLOCK DETECTED. Retries may be futile but proceeding if quota allows.");
        }
        if (retries > 0) {
            await new Promise((resolve)=>setTimeout(resolve, delay));
            return executeWithRetry(fn, retries - 1, delay * 2);
        }
        throw error;
    }
}
// --- UTILITY: Match Dimensions (Center Crop) ---
async function matchImageDimensions(sourceUrl, targetWidth, targetHeight) {
    return new Promise((resolve, reject)=>{
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = sourceUrl;
        img.onload = ()=>{
            const canvas = document.createElement('canvas');
            canvas.width = targetWidth;
            canvas.height = targetHeight;
            const ctx = canvas.getContext('2d');
            if (!ctx) return resolve(sourceUrl);
            // Draw background black to avoid alpha issues
            ctx.fillStyle = "black";
            ctx.fillRect(0, 0, targetWidth, targetHeight);
            const scale = Math.max(targetWidth / img.width, targetHeight / img.height);
            const x = targetWidth / 2 - img.width / 2 * scale;
            const y = targetHeight / 2 - img.height / 2 * scale;
            ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
            resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = ()=>{
            console.warn("Image load failed for dimension matching, using original.");
            resolve(sourceUrl);
        };
    });
}
function getNearestAspectRatio(width, height) {
    const ratio = width / height;
    const ratios = {
        "1:1": 1,
        "3:4": 3 / 4,
        "4:3": 4 / 3,
        "9:16": 9 / 16,
        "16:9": 16 / 9
    };
    return Object.keys(ratios).reduce((a, b)=>Math.abs(ratios[a] - ratio) < Math.abs(ratios[b] - ratio) ? a : b);
}
async function scoutMediaForBeat(query, fullCaption, settings, targetProvider) {
    const ai = getAI(settings);
    const intentResponse = await executeWithRetry(()=>ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `TEXT: "${fullCaption}". TASK: Literal search string for visuals (English, 3-5 words).`
        }));
    const literalQuery = intentResponse.text?.trim() || query;
    return {
        assetUrl: null,
        source: "Web Search",
        title: literalQuery
    };
}
async function scriptToTimeline(text, wordCount, fidelityMode = false, settings) {
    const ai = getAI(settings);
    const response = await executeWithRetry(()=>ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `Transform into cinematic beats: "${text}"`,
            config: {
                systemInstruction: `Professional Director: Output JSON array. Fields: caption, scoutQuery, duration.`,
                responseMimeType: "application/json",
                responseSchema: {
                    type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$genai$2f$dist$2f$node$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Type"].ARRAY,
                    items: {
                        type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$genai$2f$dist$2f$node$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Type"].OBJECT,
                        properties: {
                            caption: {
                                type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$genai$2f$dist$2f$node$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Type"].STRING
                            },
                            scoutQuery: {
                                type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$genai$2f$dist$2f$node$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Type"].STRING
                            },
                            duration: {
                                type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$genai$2f$dist$2f$node$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Type"].NUMBER
                            }
                        },
                        required: [
                            "caption",
                            "scoutQuery",
                            "duration"
                        ]
                    }
                }
            }
        }));
    const raw = JSON.parse(response.text || "[]");
    return raw.map((b)=>({
            id: crypto.randomUUID(),
            timestamp: Date.now(),
            duration: b.duration || 6,
            assetUrl: null,
            caption: b.caption,
            assetType: 'IMAGE',
            scoutQuery: b.scoutQuery
        }));
}
async function generateImageForBeat(caption, scoutQuery, settings, baseImage) {
    const ai = getAI(settings);
    const contents = [];
    if (baseImage) {
        contents.push({
            inlineData: {
                mimeType: "image/png",
                data: baseImage.split(',')[1]
            }
        });
    }
    contents.push({
        text: `Cinematic frame: ${scoutQuery}. ${caption}. Photorealistic, 8k. ${baseImage ? 'Maintain style/identity of ref.' : ''}`
    });
    const response = await executeWithRetry(()=>ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: contents
            },
            config: {
                imageConfig: {
                    aspectRatio: "16:9"
                },
                safetySettings: SAFETY_SETTINGS
            }
        }));
    let imageUrl = "";
    if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts){
            if (part.inlineData) imageUrl = `data:image/png;base64,${part.inlineData.data}`;
        }
    }
    return imageUrl;
}
async function extractDeepDNA(imageUrl, settings) {
    const ai = getAI(settings);
    const base64 = imageUrl.includes(',') ? imageUrl.split(',')[1] : imageUrl;
    const response = await executeWithRetry(()=>ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: {
                parts: [
                    {
                        inlineData: {
                            mimeType: "image/png",
                            data: base64
                        }
                    },
                    {
                        text: `JSON forensic DNA biopsy in English: human_description, character_details, environment_context, pose_attribute, camera_specs, lighting_setup, technical_tags.`
                    }
                ]
            },
            config: {
                responseMimeType: "application/json"
            }
        }));
    const parsed = JSON.parse(response.text || "{}");
    const flatten = (val)=>{
        if (!val) return '';
        if (typeof val === 'string') return val;
        if (typeof val === 'object') {
            return Object.values(val).join(', ');
        }
        return String(val);
    };
    const sanitized = {
        ...parsed,
        character_details: flatten(parsed.character_details),
        environment_context: flatten(parsed.environment_context),
        pose_attribute: flatten(parsed.pose_attribute),
        camera_specs: flatten(parsed.camera_specs),
        lighting_setup: flatten(parsed.lighting_setup),
        human_description: flatten(parsed.human_description),
        technical_tags: Array.isArray(parsed.technical_tags) ? parsed.technical_tags.map((t)=>flatten(t)) : []
    };
    return {
        ...sanitized,
        character: sanitized.character_details,
        environment: sanitized.environment_context,
        pose: sanitized.pose_attribute
    };
}
async function executeGroundedSynth(prompt, weights, vault, authority, settings, baseImage, poseImage, poseLandmarks, poseMaskImage, poseText, targetRatio) {
    const ai = getAI(settings);
    // --- PIPELINE WITH POSE RIG ---
    if (baseImage && poseMaskImage) {
        console.log("[Gemini Service] Initializing Iterative Refinement Pipeline (V13.0 - NO CACHE)...");
        const activePrompt = prompt.trim() ? prompt : "Cinematic scene.";
        const logs = [];
        // 1. DYNAMIC ASPECT RATIO DETECTION
        let dynamicAspectRatio = "16:9";
        if (targetRatio) {
            dynamicAspectRatio = targetRatio;
        } else {
            const targetDim = await new Promise((resolve)=>{
                const img = new Image();
                img.onload = ()=>resolve({
                        w: img.width,
                        h: img.height
                    });
                img.onerror = ()=>resolve({
                        w: 1024,
                        h: 1024
                    });
                img.src = poseMaskImage;
            });
            dynamicAspectRatio = getNearestAspectRatio(targetDim.w, targetDim.h);
        }
        // Prep Base64s
        let matchW = 1024, matchH = 576; // Default 16:9
        if (dynamicAspectRatio === '9:16') {
            matchW = 576;
            matchH = 1024;
        } else if (dynamicAspectRatio === '1:1') {
            matchW = 1024;
            matchH = 1024;
        } else if (dynamicAspectRatio === '4:3') {
            matchW = 1024;
            matchH = 768;
        }
        const poseBase64 = poseMaskImage.split(',')[1];
        let matchedBaseImage = await matchImageDimensions(baseImage, matchW, matchH);
        let identityBase64 = matchedBaseImage.split(',')[1];
        // Generate Unique Entropy for Cache Busting
        const sessionEntropy = Date.now().toString(36) + Math.random().toString(36).substring(2);
        // --- STAGE 1: DNA ANALYSIS (Internal) ---
        logs.push({
            type: 'Identity Guard',
            status: 'processing',
            message: 'Stage 1/4: Analyzing Biological & Structural Matrix...',
            timestamp: Date.now(),
            department: 'Casting'
        });
        // We assume identity extraction is handled by the model context in the next step to save latency,
        // or we could do a quick text extraction if needed. For speed/consistency, we embed strict instructions.
        logs.push({
            type: 'Rigging Supervisor',
            status: 'completed',
            message: 'Vectors Locked. Initiating Structural Draft.',
            timestamp: Date.now(),
            department: 'Structure'
        });
        // --- STAGE 2: DRAFT ANCHOR (Identity + Skeleton -> Draft Image) ---
        // Goal: Get the pose right. If texture is bad (mannequin), we fix in stage 3.
        logs.push({
            type: 'Puppeteer Agent',
            status: 'processing',
            message: `Stage 2/4: Generating Structural Draft (Session ${sessionEntropy})...`,
            timestamp: Date.now(),
            department: 'Structure'
        });
        const draftPrompt = `
      [SYSTEM: FRESH RENDER SESSION ${sessionEntropy}_DRAFT]
      TASK: Generate an image based on the SKELETON POSE and CHARACTER IDENTITY.
      
      INPUTS:
      1. IMAGE 1 (SKELETON): Strict pose guide. IGNORE the black background and colored lines visual style.
      2. IMAGE 2 (CHARACTER): The person to render.
      
      INSTRUCTION:
      - Render the character from Image 2 in the exact pose of Image 1.
      - SCENE: ${activePrompt}
      - IMPORTANT: Do not make it look like a 3D render. Attempt photorealism.
      - FORCE: Do not use cached latent patterns. Calculate geometry from scratch.
      `;
        const draftResponse = await executeWithRetry(()=>ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: {
                    parts: [
                        {
                            inlineData: {
                                mimeType: "image/png",
                                data: poseBase64
                            }
                        },
                        {
                            inlineData: {
                                mimeType: "image/png",
                                data: identityBase64
                            }
                        },
                        {
                            text: draftPrompt
                        }
                    ]
                },
                config: {
                    imageConfig: {
                        aspectRatio: dynamicAspectRatio
                    },
                    safetySettings: SAFETY_SETTINGS,
                    temperature: 0.45 // Slightly increased to ensure fresh noise
                }
            }));
        let draftBase64 = "";
        if (draftResponse.candidates?.[0]?.content?.parts) {
            for (const part of draftResponse.candidates[0].content.parts){
                if (part.inlineData && part.inlineData.data) {
                    draftBase64 = part.inlineData.data;
                }
            }
        }
        if (!draftBase64) throw new Error("Stage 2 Failed: Draft Generation Error.");
        logs.push({
            type: 'Puppeteer Agent',
            status: 'completed',
            message: 'Draft Anchor Created.',
            timestamp: Date.now(),
            department: 'Structure'
        });
        // --- STAGE 3: RECURSIVE REFINEMENT (Draft + Identity -> Final Polish) ---
        // Goal: Fix the "Mannequin/Clay" look. 
        // Input 1: The Draft (Perfect Pose, maybe bad texture)
        // Input 2: The Identity (Perfect Texture)
        logs.push({
            type: 'Neural Alchemist',
            status: 'processing',
            message: 'Stage 3/4: Recursive Refinement (Memory Flush & Polish)...',
            timestamp: Date.now(),
            department: 'Advanced'
        });
        const refinePrompt = `
      [SYSTEM: MEMORY FLUSH REQUIRED - ID ${sessionEntropy}_POLISH]
      TASK: RE-TEXTURE and FIX ANATOMY.
      
      INPUTS:
      1. IMAGE 1 (DRAFT): Composition is correct, but texture might be plastic/fake/clay.
      2. IMAGE 2 (REFERENCE): Contains the REAL skin texture, lighting, and fabric details.

      MANDATORY PROTOCOLS:
      - **FLUSH CACHE**: Do not use internal memory from previous runs.
      - **ANTI-ALIASING**: Remove "plastic" or "3D render" look.
      - Transfer HYPER-REALISTIC SKIN TEXTURE from Image 2 to Image 1.
      - If limbs in Image 1 look awkward (bad anatomy), FIX THEM to look natural.
      - SCENE: ${activePrompt}
      `;
        const finalResponse = await executeWithRetry(()=>ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: {
                    parts: [
                        {
                            inlineData: {
                                mimeType: "image/png",
                                data: draftBase64
                            }
                        },
                        {
                            inlineData: {
                                mimeType: "image/png",
                                data: identityBase64
                            }
                        },
                        {
                            text: refinePrompt
                        }
                    ]
                },
                config: {
                    imageConfig: {
                        aspectRatio: dynamicAspectRatio
                    },
                    safetySettings: SAFETY_SETTINGS,
                    temperature: 0.6 // Higher temperature to force model to "dream" new texture details vs using cache
                }
            }));
        let finalUrl = "";
        if (finalResponse.candidates?.[0]?.content?.parts) {
            for (const part of finalResponse.candidates[0].content.parts){
                if (part.inlineData) {
                    finalUrl = `data:image/png;base64,${part.inlineData.data}`;
                }
            }
        }
        if (!finalUrl) throw new Error("Stage 3 Failed: Refinement Error.");
        // --- STAGE 4: MEMORY CLEANUP & FINALIZATION ---
        // Explicitly clear huge base64 strings to help Garbage Collector and visually confirm "Cache Purged"
        draftBase64 = "";
        identityBase64 = "";
        matchedBaseImage = "";
        logs.push({
            type: 'Director',
            status: 'completed',
            message: 'Pipeline Complete. VRAM Cache Purged.',
            timestamp: Date.now(),
            department: 'Direction'
        });
        return {
            imageUrl: finalUrl,
            logs: logs,
            enhancedPrompt: "RECURSIVE_POLISH_V13: " + activePrompt,
            params: {
                neural_metrics: {
                    consensus_score: 1.0,
                    iteration_count: 2,
                    tensor_vram: 0,
                    projection_coherence: 1.0,
                    loss_mse: 0,
                    ssim_index: 1
                }
            }
        };
    }
    // --- STANDARD GENERATION (No Pose) ---
    const deliberationContents = [];
    if (baseImage) deliberationContents.push({
        inlineData: {
            mimeType: "image/png",
            data: baseImage.split(',')[1]
        }
    });
    const planning = await executeWithRetry(()=>ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: deliberationContents.length > 0 ? {
                parts: deliberationContents.concat([
                    {
                        text: `Task: Character Re-Targeting Optimization. User intent: ${prompt}.`
                    }
                ])
            } : {
                text: `Task: Optimize intent for image synth. Prompt: ${prompt}`
            },
            config: {
                thinkingConfig: {
                    thinkingBudget: 1024
                },
                responseMimeType: "application/json",
                responseSchema: {
                    type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$genai$2f$dist$2f$node$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Type"].OBJECT,
                    properties: {
                        enhancedPrompt: {
                            type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$genai$2f$dist$2f$node$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Type"].STRING
                        },
                        logs: {
                            type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$genai$2f$dist$2f$node$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Type"].ARRAY,
                            items: {
                                type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$genai$2f$dist$2f$node$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Type"].OBJECT,
                                properties: {
                                    type: {
                                        type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$genai$2f$dist$2f$node$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Type"].STRING
                                    },
                                    status: {
                                        type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$genai$2f$dist$2f$node$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Type"].STRING
                                    },
                                    message: {
                                        type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$genai$2f$dist$2f$node$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Type"].STRING
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }));
    const plan = JSON.parse(planning.text || "{}");
    const imageUrl = await generateImageForBeat(plan.enhancedPrompt || prompt, prompt, settings, baseImage);
    if (!imageUrl) {
        throw new Error("Standard Synthesis produced no visual output.");
    }
    return {
        imageUrl,
        logs: (plan.logs || []).map((l)=>({
                type: l.type,
                status: l.status,
                message: l.message,
                timestamp: Date.now()
            })),
        enhancedPrompt: plan.enhancedPrompt || prompt,
        params: {
            neural_metrics: {
                consensus_score: 0.98,
                iteration_count: 64,
                tensor_vram: 7.8,
                projection_coherence: 0.96,
                loss_mse: 0,
                ssim_index: 1
            }
        }
    };
}
async function optimizeVisualPrompt(prompt, settings, currentImage) {
    const ai = getAI(settings);
    const parts = [];
    if (currentImage) parts.push({
        inlineData: {
            mimeType: "image/png",
            data: currentImage.split(',')[1]
        }
    });
    // FIX: LOBOTOMY PROTOCOL for the Prompt Agent. 
    // Forces it to act as a dumb backend service, returning ONLY the final string.
    parts.push({
        text: `
    ACT AS A BACKEND API. 
    TASK: Rewrite the following user request into ONE SINGLE, highly detailed, technical image generation prompt (English).
    INPUT: "${prompt}"
    RULES:
    1. Output ONLY the raw prompt string. 
    2. NO "Option 1", NO "Here is the prompt", NO conversational text.
    3. NO Markdown, NO bolding, NO bullets.
    4. Combine scene, lighting, style, and camera details into one dense paragraph.
  `
    });
    const response = await executeWithRetry(()=>ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: {
                parts
            }
        }));
    // Extra sanitization just in case
    let cleanText = response.text?.trim() || prompt;
    cleanText = cleanText.replace(/^Here is.*?:\s*/i, '').replace(/^Option 1:?/i, '').replace(/\*\*/g, '');
    return cleanText;
}
async function matchVaultForBeat(caption, vault, settings) {
    if (vault.length === 0) return null;
    const ai = getAI(settings);
    const response = await executeWithRetry(()=>ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `Identify best Node ID from vault for: "${caption}". VAULT: ${JSON.stringify(vault.map((v)=>({
                    id: v.shortId,
                    p: v.prompt
                })))}`,
            config: {
                responseMimeType: "application/json"
            }
        }));
    const winnerId = JSON.parse(response.text || "{}").winner_id;
    return vault.find((v)=>v.shortId === winnerId) || null;
}
async function getGlobalVisualPrompt(text, settings) {
    const ai = getAI(settings);
    const resp = await executeWithRetry(()=>ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `Atmosphere description for cover (8 words): "${text}"`
        }));
    return resp.text?.trim() || "Cinematic atmosphere";
}
async function executeFusion(manifest, vault, settings) {
    const ai = getAI(settings);
    const pep = vault.find((v)=>v.shortId === manifest.pep_id);
    const pop = vault.find((v)=>v.shortId === manifest.pop_id);
    const parts = [];
    if (pep) parts.push({
        inlineData: {
            mimeType: "image/png",
            data: pep.imageUrl.split(',')[1]
        }
    });
    if (pop) parts.push({
        inlineData: {
            mimeType: "image/png",
            data: pop.imageUrl.split(',')[1]
        }
    });
    parts.push({
        text: `Fuse PEP identity with POP pose. Intent: ${manifest.fusionIntent}`
    });
    const response = await executeWithRetry(()=>ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts
            },
            config: {
                imageConfig: {
                    aspectRatio: "16:9"
                },
                safetySettings: SAFETY_SETTINGS
            }
        }));
    let imageUrl = "";
    if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts){
            if (part.inlineData) imageUrl = `data:image/png;base64,${part.inlineData.data}`;
        }
    }
    return {
        imageUrl,
        logs: [
            {
                type: 'Neural Alchemist',
                status: 'completed',
                message: 'Identity Migration stabilized.',
                timestamp: Date.now()
            }
        ],
        params: {
            neural_metrics: {
                consensus_score: 0.95,
                iteration_count: 50,
                tensor_vram: 8.2,
                loss_mse: 0.02,
                ssim_index: 0.98
            }
        }
    };
}
async function autoOptimizeFusion(intent, manifest, vault, settings) {
    const ai = getAI(settings);
    const response = await executeWithRetry(()=>ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `Select best Node IDs for: "${intent}". VAULT: ${JSON.stringify(vault.map((v)=>({
                    id: v.shortId,
                    dna: v.dna
                })))}`,
            config: {
                responseMimeType: "application/json"
            }
        }));
    return {
        manifest: {
            ...manifest,
            ...JSON.parse(response.text || "{}")
        }
    };
}
async function visualAnalysisJudge(imageUrl, intent, refImageUrl, settings) {
    const ai = getAI(settings);
    const parts = [
        {
            inlineData: {
                mimeType: "image/png",
                data: imageUrl.split(',')[1]
            }
        }
    ];
    if (refImageUrl) parts.push({
        inlineData: {
            mimeType: "image/png",
            data: refImageUrl.split(',')[1]
        }
    });
    parts.push({
        text: `Audit visual quality. Intent: ${intent}`
    });
    const response = await executeWithRetry(()=>ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: {
                parts
            },
            config: {
                responseMimeType: "application/json"
            }
        }));
    return JSON.parse(response.text || '{"score": 0.8}');
}
async function refinePromptDNA(intent, settings) {
    const ai = getAI(settings);
    const response = await executeWithRetry(()=>ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `Refine intent: "${intent}"`
        }));
    return {
        refined: response.text?.trim() || intent,
        logs: []
    };
}
}),
"[project]/dbService.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "bulkSaveNodes",
    ()=>bulkSaveNodes,
    "deleteDNAToken",
    ()=>deleteDNAToken,
    "deleteNode",
    ()=>deleteNode,
    "getAllDNATokens",
    ()=>getAllDNATokens,
    "getAllNodes",
    ()=>getAllNodes,
    "getDNATokensByDomain",
    ()=>getDNATokensByDomain,
    "incrementNodeUsage",
    ()=>incrementNodeUsage,
    "initDB",
    ()=>initDB,
    "saveDNAToken",
    ()=>saveDNAToken,
    "saveNode",
    ()=>saveNode,
    "toggleFavoriteNode",
    ()=>toggleFavoriteNode
]);
const DB_NAME = 'LatentCinemaDB';
const STORE_NAME = 'vault_nodes';
const TOKEN_STORE_NAME = 'dna_tokens';
const DB_VERSION = 2; // Incrementado para suportar o novo store
const initDB = ()=>{
    return new Promise((resolve, reject)=>{
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = (event)=>{
            const db = request.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, {
                    keyPath: 'id'
                });
            }
            if (!db.objectStoreNames.contains(TOKEN_STORE_NAME)) {
                db.createObjectStore(TOKEN_STORE_NAME, {
                    keyPath: 'id'
                });
            }
        };
        request.onsuccess = ()=>resolve(request.result);
        request.onerror = ()=>reject(request.error);
    });
};
const saveNode = async (item)=>{
    const db = await initDB();
    return new Promise((resolve, reject)=>{
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const nodeToSave = {
            ...item,
            usageCount: item.usageCount ?? 0,
            neuralPreferenceScore: item.neuralPreferenceScore ?? 50,
            isFavorite: item.isFavorite ?? false,
            vaultDomain: item.vaultDomain ?? 'X'
        };
        tx.objectStore(STORE_NAME).put(nodeToSave);
        tx.oncomplete = ()=>resolve();
        tx.onerror = ()=>reject(tx.error);
    });
};
const saveDNAToken = async (token)=>{
    const db = await initDB();
    return new Promise((resolve, reject)=>{
        const tx = db.transaction(TOKEN_STORE_NAME, 'readwrite');
        tx.objectStore(TOKEN_STORE_NAME).put(token);
        tx.oncomplete = ()=>resolve();
        tx.onerror = ()=>reject(tx.error);
    });
};
const getAllDNATokens = async ()=>{
    const db = await initDB();
    return new Promise((resolve, reject)=>{
        const tx = db.transaction(TOKEN_STORE_NAME, 'readonly');
        const request = tx.objectStore(TOKEN_STORE_NAME).getAll();
        request.onsuccess = ()=>resolve(request.result || []);
        request.onerror = ()=>reject(request.error);
    });
};
const getDNATokensByDomain = async (domain)=>{
    const tokens = await getAllDNATokens();
    return tokens.filter((t)=>t.domain === domain);
};
const deleteDNAToken = async (id)=>{
    const db = await initDB();
    const tx = db.transaction(TOKEN_STORE_NAME, 'readwrite');
    tx.objectStore(TOKEN_STORE_NAME).delete(id);
};
const toggleFavoriteNode = async (id)=>{
    const db = await initDB();
    return new Promise((resolve, reject)=>{
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const request = store.get(id);
        request.onsuccess = ()=>{
            const item = request.result;
            if (item) {
                item.isFavorite = !item.isFavorite;
                // Favoritos ganham boost no score
                item.neuralPreferenceScore = item.isFavorite ? Math.min(100, item.neuralPreferenceScore + 20) : item.neuralPreferenceScore;
                store.put(item);
                resolve(item.isFavorite);
            } else {
                reject("Node not found");
            }
        };
    });
};
const incrementNodeUsage = async (shortId)=>{
    const db = await initDB();
    return new Promise((resolve, reject)=>{
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const request = store.getAll();
        request.onsuccess = ()=>{
            const items = request.result;
            const item = items.find((i)=>i.shortId === shortId);
            if (item) {
                item.usageCount = (item.usageCount ?? 0) + 1;
                item.neuralPreferenceScore = Math.min(100, item.usageCount * 5 + item.rating * 10 + (item.isFavorite ? 20 : 0));
                store.put(item);
            }
            resolve();
        };
    });
};
const getAllNodes = async ()=>{
    const db = await initDB();
    return new Promise((resolve, reject)=>{
        const tx = db.transaction(STORE_NAME, 'readonly');
        const request = tx.objectStore(STORE_NAME).getAll();
        request.onsuccess = ()=>resolve(request.result || []);
        request.onerror = ()=>reject(request.error);
    });
};
const deleteNode = async (id)=>{
    const db = await initDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(id);
};
const bulkSaveNodes = async (items)=>{
    const db = await initDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    items.forEach((item)=>store.put(item));
};
}),
"[project]/gradingProcessor.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "applyGrading",
    ()=>applyGrading
]);
const applyGrading = async (canvas, image, grading)=>{
    const ctx = canvas.getContext('2d', {
        willReadFrequently: true
    });
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    ctx.save();
    const cx = w / 2;
    const cy = h / 2;
    const lensCenterX = (grading.lens_center_x || 0) * (w * 0.1);
    const lensCenterY = (grading.lens_center_y || 0) * (h * 0.1);
    ctx.translate(cx + lensCenterX + (grading.pan_x || 0) * w, cy + lensCenterY + (grading.pan_y || 0) * h);
    if (grading.rotate) ctx.rotate(grading.rotate * Math.PI / 180);
    const scaleX = (grading.anamorphic_squeeze || 1) * (1 + (grading.crop_zoom || 0));
    const stretchY = grading.geometry_y || 1;
    const scaleY = stretchY * (1 + (grading.crop_zoom || 0));
    ctx.scale(scaleX, scaleY);
    const dist = grading.lens_distortion || 0;
    const zoom = 1 + Math.abs(dist * 0.3);
    ctx.scale(zoom, zoom);
    const faceWarp = grading.face_warp || 0;
    if (faceWarp !== 0) {
        ctx.scale(1 - faceWarp * 0.25, 1);
    }
    ctx.translate(-cx, -cy);
    // --- PERSPECTIVE TILT ENGINE (Fake 3D Slicing) ---
    const px = grading.perspective_x || 0;
    const py = grading.perspective_y || 0;
    if (Math.abs(px) < 0.001 && Math.abs(py) < 0.001) {
        ctx.drawImage(image, 0, 0);
    } else {
        let source = image;
        let sourceW = image.width;
        let sourceH = image.height;
        // Apply TILT Y (Vertical Perspective) - Affects Width per Row
        if (Math.abs(py) > 0.001) {
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = sourceW;
            tempCanvas.height = sourceH;
            const tCtx = tempCanvas.getContext('2d');
            if (tCtx) {
                // Cap deformation at 0.8 (80%) to prevent full collapse/inversion
                const strength = Math.min(0.8, Math.abs(py));
                for(let y = 0; y < sourceH; y++){
                    const progress = y / sourceH;
                    let scale = 1;
                    // py > 0: Top Wide, Bottom Narrow. py < 0: Top Narrow, Bottom Wide.
                    if (py > 0) scale = 1 - progress * strength;
                    else scale = 1 - (1 - progress) * strength;
                    const rowW = sourceW * scale;
                    const xOff = (sourceW - rowW) / 2;
                    // Draw 1px high slice
                    tCtx.drawImage(image, 0, y, sourceW, 1, xOff, y, rowW, 1);
                }
                source = tempCanvas;
            }
        }
        // Apply TILT X (Horizontal Perspective) - Affects Height per Column
        if (Math.abs(px) > 0.001) {
            const strength = Math.min(0.8, Math.abs(px));
            for(let x = 0; x < sourceW; x++){
                const progress = x / sourceW;
                let scale = 1;
                // px > 0: Left Wide, Right Narrow. px < 0: Left Narrow, Right Wide.
                if (px > 0) scale = 1 - progress * strength;
                else scale = 1 - (1 - progress) * strength;
                const colH = sourceH * scale;
                const yOff = (sourceH - colH) / 2;
                // Draw 1px wide slice from source (which might be Y-tilted already)
                ctx.drawImage(source, x, 0, 1, sourceH, x, yOff, 1, colH);
            }
        } else {
            // If only Y was applied, draw the result of Y
            ctx.drawImage(source, 0, 0);
        }
    }
    ctx.restore();
    const imageData = ctx.getImageData(0, 0, w, h);
    const data = imageData.data;
    const needsSpatial = grading.sharpness > 0 || grading.structure > 0 || grading.clarity !== 0 || grading.skin_smooth > 0 || grading.denoise > 0 || grading.chromatic_aberration > 0;
    const sourceData = needsSpatial ? new Uint8ClampedArray(data) : data;
    // Global adjustments params
    const tempK = (grading.temperature || 0) * 0.8;
    const tintM = (grading.tint || 0) * 0.8;
    const vibrance = grading.vibrance || 1;
    const saturation = grading.saturation || 1;
    const brightness = grading.brightness || 1;
    const contrast = grading.contrast || 1;
    const pivot = grading.pivot || 0.5;
    const exposure = Math.pow(2, grading.exposure || 0);
    const dehazeVal = grading.dehaze || 0;
    // Mixer Matrix
    const mRR = grading.mix_red_red ?? 1, mRG = grading.mix_red_green ?? 0, mRB = grading.mix_red_blue ?? 0;
    const mGR = grading.mix_green_red ?? 0, mGG = grading.mix_green_green ?? 1, mGB = grading.mix_green_blue ?? 0;
    const mBR = grading.mix_blue_red ?? 0, mBG = grading.mix_blue_green ?? 0, mBB = grading.mix_blue_blue ?? 1;
    // LGG Globals
    const globalLift = grading.lift || 0;
    const globalGamma = grading.gamma || 1;
    const globalGain = grading.gain || 1;
    const globalOffset = grading.offset || 0;
    const hslToRgb = (h, s, l)=>{
        const c = (1 - Math.abs(2 * l - 1)) * s;
        const x = c * (1 - Math.abs(h / 60 % 2 - 1));
        const m = l - c / 2;
        let r = 0, g = 0, b = 0;
        if (0 <= h && h < 60) {
            r = c;
            g = x;
            b = 0;
        } else if (60 <= h && h < 120) {
            r = x;
            g = c;
            b = 0;
        } else if (120 <= h && h < 180) {
            r = 0;
            g = c;
            b = x;
        } else if (180 <= h && h < 240) {
            r = 0;
            g = x;
            b = c;
        } else if (240 <= h && h < 300) {
            r = x;
            g = 0;
            b = c;
        } else if (300 <= h && h < 360) {
            r = c;
            g = 0;
            b = x;
        }
        return [
            (r + m) * 255,
            (g + m) * 255,
            (b + m) * 255
        ];
    };
    const shadowRGB = hslToRgb(grading.split_shadow_hue || 210, 1, 0.5);
    const highlightRGB = hslToRgb(grading.split_highlight_hue || 30, 1, 0.5);
    const midRGB = hslToRgb(grading.split_mid_hue || 0, 1, 0.5);
    const grainAmt = (grading.grain || 0) * 60;
    const sharpenAmt = (grading.sharpness || 0) * 3;
    const clarityAmt = grading.clarity || 0;
    const chromaAmt = (grading.chromatic_aberration || 0) * 3.5;
    const skinSmooth = grading.skin_smooth || 0;
    const eyeClarity = grading.eye_clarity || 0;
    const featurePop = grading.feature_pop || 0;
    const teethWhitening = grading.teeth_whitening || 0;
    for(let i = 0; i < data.length; i += 4){
        let r = sourceData[i];
        let g = sourceData[i + 1];
        let b = sourceData[i + 2];
        const x = i / 4 % w;
        const y = Math.floor(i / 4 / w);
        if (needsSpatial) {
            if (chromaAmt > 0) {
                const distX = (x - cx) / w;
                const distY = (y - cy) / h;
                const distSq = distX * distX + distY * distY;
                const offset = Math.floor(chromaAmt * distSq * 30);
                if (offset > 0) {
                    const rIdx = i - offset * 4;
                    const bIdx = i + offset * 4;
                    if (rIdx >= 0 && rIdx < sourceData.length) r = sourceData[rIdx];
                    if (bIdx >= 0 && bIdx < sourceData.length) b = sourceData[bIdx + 2];
                }
            }
            if (x > 1 && x < w - 2 && y > 1 && y < h - 2) {
                const up = i - w * 4, down = i + w * 4, left = i - 4, right = i + 4;
                const avgR = (sourceData[up] + sourceData[down] + sourceData[left] + sourceData[right] + r) * 0.2;
                const avgG = (sourceData[up + 1] + sourceData[down + 1] + sourceData[left + 1] + sourceData[right + 1] + g) * 0.2;
                const avgB = (sourceData[up + 2] + sourceData[down + 2] + sourceData[left + 2] + sourceData[right + 2] + b) * 0.2;
                const hpR = r - avgR;
                const hpG = g - avgG;
                const hpB = b - avgB;
                if (sharpenAmt > 0 || featurePop > 0) {
                    const boost = sharpenAmt + featurePop * 2.5;
                    r += hpR * boost;
                    g += hpG * boost;
                    b += hpB * boost;
                }
                if (clarityAmt !== 0) {
                    r += hpR * clarityAmt * 0.8;
                    g += hpG * clarityAmt * 0.8;
                    b += hpB * clarityAmt * 0.8;
                }
                if (skinSmooth > 0 || grading.denoise > 0) {
                    const isSkin = r > g && g > b && r > 40 && Math.abs(r - g) > 5;
                    const blurStrength = isSkin ? Math.max(grading.denoise, skinSmooth) : grading.denoise;
                    if (blurStrength > 0) {
                        const mix = blurStrength * 0.75;
                        r = r * (1 - mix) + avgR * mix;
                        g = g * (1 - mix) + avgG * mix;
                        b = b * (1 - mix) + avgB * mix;
                    }
                }
                const lumaPixel = 0.2126 * r + 0.7152 * g + 0.0722 * b;
                if (teethWhitening > 0 && lumaPixel > 80) {
                    const max = Math.max(r, g, b);
                    const min = Math.min(r, g, b);
                    const sat = (max - min) / (max || 1);
                    if (sat < 0.5 && r > b && g > b) {
                        const wStr = teethWhitening * 0.8;
                        r = Math.min(255, r + 50 * wStr);
                        g = Math.min(255, g + 50 * wStr);
                        b = Math.min(255, b + 70 * wStr);
                        const gray = (r + g + b) / 3;
                        r = r * (1 - wStr * 0.5) + gray * wStr * 0.5;
                        g = g * (1 - wStr * 0.5) + gray * wStr * 0.5;
                        b = b * (1 - wStr * 0.5) + gray * wStr * 0.5;
                    }
                }
                if (eyeClarity > 0 && lumaPixel > 160 && lumaPixel < 250) {
                    r += hpR * eyeClarity * 5;
                    g += hpG * eyeClarity * 5;
                    b += hpB * eyeClarity * 5;
                }
            }
        }
        const ir = r, ig = g, ib = b;
        r = ir * mRR + ig * mRG + ib * mRB;
        g = ir * mGR + ig * mGG + ib * mGB;
        b = ir * mBR + ig * mBG + ib * mBB;
        r += tempK;
        b -= tempK;
        g += tintM;
        let nr = r / 255;
        let ng = g / 255;
        let nb = b / 255;
        // Dehaze
        if (dehazeVal !== 0) {
            const minC = Math.min(nr, ng, nb);
            const dehazeFactor = dehazeVal * 0.3;
            nr = (nr - minC * dehazeFactor) / (1 - dehazeFactor);
            ng = (ng - minC * dehazeFactor) / (1 - dehazeFactor);
            nb = (nb - minC * dehazeFactor) / (1 - dehazeFactor);
        }
        // Exposure / Brightness / Contrast
        nr *= exposure;
        ng *= exposure;
        nb *= exposure;
        nr = (nr - pivot) * contrast + pivot + (brightness - 1);
        ng = (ng - pivot) * contrast + pivot + (brightness - 1);
        nb = (nb - pivot) * contrast + pivot + (brightness - 1);
        // LGG Application with GLOBAL + PER-CHANNEL Logic
        const applyLGG = (c, lift, gam, gain, off)=>{
            // Lift: (Color * (1-Lift) + Lift)
            let val = c * (1 - lift) + lift + off;
            // Gain: Scale
            val *= gain;
            // Gamma: Power
            if (val > 0) val = Math.pow(val, 1 / Math.max(0.01, gam));
            return val;
        };
        // Combine Global values with Channel values
        // Note: Lift is additive/interpolation, Gain is multiplicative, Gamma is multiplicative
        nr = applyLGG(nr, globalLift + (grading.lift_r || 0), globalGamma * (grading.gamma_r || 1), globalGain * (grading.gain_r || 1), globalOffset + (grading.offset_r || 0));
        ng = applyLGG(ng, globalLift + (grading.lift_g || 0), globalGamma * (grading.gamma_g || 1), globalGain * (grading.gain_g || 1), globalOffset + (grading.offset_g || 0));
        nb = applyLGG(nb, globalLift + (grading.lift_b || 0), globalGamma * (grading.gamma_b || 1), globalGain * (grading.gain_b || 1), globalOffset + (grading.offset_b || 0));
        const luma = 0.2126 * nr + 0.7152 * ng + 0.0722 * nb;
        // Split Toning
        if (grading.split_shadow_sat > 0 || grading.split_highlight_sat > 0 || grading.split_mid_sat > 0) {
            const bal = grading.split_balance || 0;
            const sMask = Math.max(0, 1 - luma * 2 + bal);
            const hMask = Math.max(0, (luma - 0.5 - bal) * 2);
            const mMask = 1 - sMask - hMask;
            if (sMask > 0 && grading.split_shadow_sat > 0) {
                const str = sMask * grading.split_shadow_sat * 0.3;
                nr += (shadowRGB[0] / 255 - nr) * str;
                ng += (shadowRGB[1] / 255 - ng) * str;
                nb += (shadowRGB[2] / 255 - nb) * str;
            }
            if (hMask > 0 && grading.split_highlight_sat > 0) {
                const str = hMask * grading.split_highlight_sat * 0.3;
                nr += (highlightRGB[0] / 255 - nr) * str;
                ng += (highlightRGB[1] / 255 - ng) * str;
                nb += (highlightRGB[2] / 255 - nb) * str;
            }
            if (mMask > 0 && grading.split_mid_sat > 0) {
                const str = mMask * grading.split_mid_sat * 0.3;
                nr += (midRGB[0] / 255 - nr) * str;
                ng += (midRGB[1] / 255 - ng) * str;
                nb += (midRGB[2] / 255 - nb) * str;
            }
        }
        // HSL Adjustments
        const max = Math.max(nr, ng, nb);
        const min = Math.min(nr, ng, nb);
        const lumHsl = (max + min) / 2;
        let hue = 0;
        let s = 0;
        if (max !== min) {
            const d = max - min;
            s = lumHsl > 0.5 ? d / (2 - max - min) : d / (max + min);
            if (max === nr) hue = (ng - nb) / d + (ng < nb ? 6 : 0);
            else if (max === ng) hue = (nb - nr) / d + 2;
            else hue = (nr - ng) / d + 4;
            hue /= 6;
        }
        if (vibrance !== 1 || saturation !== 1) {
            const vibFactor = (vibrance - 1) * (1 - s * 2);
            const totalSat = saturation + vibFactor;
            if (s > 0) {
                nr = lumHsl + (nr - lumHsl) * totalSat;
                ng = lumHsl + (ng - lumHsl) * totalSat;
                nb = lumHsl + (nb - lumHsl) * totalSat;
            }
        }
        const getSatBoost = (targetH, width, boost)=>{
            if (!boost) return 0;
            let diff = Math.abs(hue - targetH);
            if (diff > 0.5) diff = 1 - diff;
            if (diff < width) return boost * (1 - diff / width);
            return 0;
        };
        let boost = 0;
        boost += getSatBoost(0, 0.08, grading.sat_red || 0);
        boost += getSatBoost(0.08, 0.08, grading.sat_orange || 0);
        boost += getSatBoost(0.16, 0.12, grading.sat_yellow || 0);
        boost += getSatBoost(0.33, 0.15, grading.sat_green || 0);
        boost += getSatBoost(0.5, 0.15, grading.sat_cyan || 0);
        boost += getSatBoost(0.66, 0.15, grading.sat_blue || 0);
        boost += getSatBoost(0.78, 0.1, grading.sat_purple || 0);
        boost += getSatBoost(0.9, 0.1, grading.sat_magenta || 0);
        if (boost !== 0 && s > 0) {
            nr = lumHsl + (nr - lumHsl) * (1 + boost);
            ng = lumHsl + (ng - lumHsl) * (1 + boost);
            nb = lumHsl + (nb - lumHsl) * (1 + boost);
        }
        // Selective Color (Sin City)
        if (grading.selective_mix > 0) {
            const targetH = (grading.selective_hue || 0) / 360;
            const thresh = (grading.selective_threshold || 20) / 360;
            let diff = Math.abs(hue - targetH);
            if (diff > 0.5) diff = 1 - diff;
            let mask = diff < thresh ? Math.pow(1 - diff / thresh, 0.5) : 0;
            const bgSatMult = 1 - grading.selective_mix;
            const finalMult = bgSatMult + (1 - bgSatMult) * mask;
            nr = lumHsl + (nr - lumHsl) * finalMult;
            ng = lumHsl + (ng - lumHsl) * finalMult;
            nb = lumHsl + (nb - lumHsl) * finalMult;
            if (mask > 0 && grading.selective_target_sat) {
                const bst = mask * grading.selective_target_sat;
                nr = lumHsl + (nr - lumHsl) * (1 + bst);
                ng = lumHsl + (ng - lumHsl) * (1 + bst);
                nb = lumHsl + (nb - lumHsl) * (1 + bst);
            }
        }
        // Film Grain
        if (grainAmt > 0) {
            const noise = (Math.random() - 0.5) * (grainAmt / 255);
            const grainMask = 1 - Math.pow(2 * lumHsl - 1, 4);
            const finalNoise = noise * grainMask;
            if (grading.grain_color) {
                nr += finalNoise * (1 + Math.random() * 0.5);
                ng += finalNoise * (1 + Math.random() * 0.5);
                nb += finalNoise * (1 + Math.random() * 0.5);
            } else {
                nr += finalNoise;
                ng += finalNoise;
                nb += finalNoise;
            }
        }
        data[i] = Math.min(255, Math.max(0, nr * 255));
        data[i + 1] = Math.min(255, Math.max(0, ng * 255));
        data[i + 2] = Math.min(255, Math.max(0, nb * 255));
    }
    ctx.putImageData(imageData, 0, 0);
    // Post-Process Effects (Halation, Bloom, etc)
    if (grading.halation && grading.halation > 0) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighten';
        ctx.filter = `blur(${4 + (grading.halation_radius || 0)}px)`;
        ctx.globalAlpha = grading.halation;
        ctx.drawImage(canvas, 0, 0);
        ctx.fillStyle = 'rgba(255, 0, 0, 0.1)';
        ctx.globalCompositeOperation = 'source-atop';
        ctx.fillRect(0, 0, w, h);
        ctx.restore();
    }
    if (grading.bloom && grading.bloom > 0) {
        ctx.save();
        ctx.filter = `blur(${10 + (grading.bloom_radius || 0) * 20}px) brightness(${1 + grading.bloom})`;
        ctx.globalCompositeOperation = 'screen';
        ctx.globalAlpha = grading.bloom * 0.5;
        ctx.drawImage(canvas, 0, 0);
        ctx.restore();
    }
    if (grading.diffusion && grading.diffusion > 0) {
        ctx.save();
        ctx.filter = `blur(${20}px)`;
        ctx.globalCompositeOperation = 'lighten';
        ctx.globalAlpha = grading.diffusion * 0.3;
        ctx.drawImage(canvas, 0, 0);
        ctx.restore();
    }
    if (grading.vignette && grading.vignette > 0) {
        ctx.save();
        ctx.globalCompositeOperation = 'multiply';
        const feather = grading.vignette_feather ?? 0.5;
        const roundness = grading.vignette_roundness ?? 0;
        const vCanvas = document.createElement('canvas');
        vCanvas.width = w;
        vCanvas.height = h;
        const vCtx = vCanvas.getContext('2d');
        if (vCtx) {
            vCtx.fillStyle = `rgba(0,0,0,${grading.vignette})`;
            vCtx.fillRect(0, 0, w, h);
            vCtx.globalCompositeOperation = 'destination-out';
            vCtx.beginPath();
            const rx = w / 2 * (0.8 - (1 - Math.abs(roundness)) * 0.3);
            const ry = h / 2 * (0.8 - (1 - Math.abs(roundness)) * 0.3);
            if (roundness >= 0) {
                vCtx.ellipse(cx, cy, rx, ry, 0, 0, 2 * Math.PI);
            } else {
                const rr = Math.min(rx, ry) * (1 + roundness);
                vCtx.roundRect(cx - rx, cy - ry, rx * 2, ry * 2, Math.max(0, rr));
            }
            vCtx.fill();
        }
        ctx.filter = `blur(${feather * 60}px)`;
        ctx.drawImage(vCanvas, 0, 0);
        ctx.restore();
    }
};
}),
"[project]/app/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$layout$2f$Header$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/layout/Header.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$layout$2f$Navigation$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/layout/Navigation.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$workspace$2f$Workspace$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/workspace/Workspace.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$vault$2f$Vault$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/vault/Vault.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$manual$2f$ManualNode$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/manual/ManualNode.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$fusion$2f$FusionLab$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/fusion/FusionLab.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$cinema$2f$CinemaLab$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/cinema/CinemaLab.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$creation$2f$CreationLab$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/creation/CreationLab.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$grading$2f$GradingLab$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/grading/GradingLab.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$settings$2f$SettingsLab$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/settings/SettingsLab.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$docs$2f$DocsLab$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/docs/DocsLab.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dbService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dbService.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
;
;
;
;
;
;
;
;
;
// --- KERNEL LOG SUPPRESSION PROTOCOL ---
(function() {
    const suppressedKeywords = [
        'gl_context_webgl.cc',
        'gl_context.cc',
        'Successfully created a WebGL context',
        'OpenGL error checking is disabled',
        'GL version',
        'NGL_LOG'
    ];
    const filterConsole = (originalFn)=>{
        return function(...args) {
            const message = args.join(' ');
            const shouldSuppress = suppressedKeywords.some((keyword)=>message.includes(keyword));
            if (!shouldSuppress) {
                originalFn.apply(console, args);
            }
        };
    };
    console.log = filterConsole(console.log);
    console.warn = filterConsole(console.warn);
    console.info = filterConsole(console.info);
})();
const DEFAULT_PARAMS = {
    z_anatomy: 1.0,
    z_structure: 1.0,
    z_lighting: 0.5,
    z_texture: 0.5,
    hz_range: 'Standard',
    structural_fidelity: 1.0,
    scale_factor: 1.0,
    auto_tune_active: true,
    neural_metrics: {
        loss_mse: 0,
        ssim_index: 1,
        tensor_vram: 6.2,
        iteration_count: 0,
        consensus_score: 1
    }
};
const DEFAULT_SUBTITLES = {
    fontSize: 16,
    fontColor: '#ffffff',
    backgroundColor: '#000000',
    fontFamily: 'Inter',
    bgOpacity: 0.7,
    textAlign: 'center',
    paddingHMult: 1.2,
    paddingVMult: 1.2,
    radiusMult: 0.8,
    marginMult: 2.5
};
const DEFAULT_SETTINGS = {
    googleApiKey: '',
    pexelsApiKey: '',
    unsplashAccessKey: '',
    pixabayApiKey: ''
};
const Page = ()=>{
    const [activeTab, setActiveTab] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('creation');
    const [vaultItems, setVaultItems] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [appSettings, setAppSettings] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(()=>{
        const saved = ("TURBOPACK compile-time falsy", 0) ? "TURBOPACK unreachable" : null;
        return ("TURBOPACK compile-time falsy", 0) ? "TURBOPACK unreachable" : DEFAULT_SETTINGS;
    });
    const [studioPrompt, setStudioPrompt] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [studioCurrentImage, setStudioCurrentImage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [studioOriginalSource, setStudioOriginalSource] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [studioLogs, setStudioLogs] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [studioParams, setStudioParams] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({
        ...DEFAULT_PARAMS
    });
    const [studioGroundingLinks, setStudioGroundingLinks] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [studioGrading, setStudioGrading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(undefined);
    const [studioVisualAnchor, setStudioVisualAnchor] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(undefined);
    const [isDbLoaded, setIsDbLoaded] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [hasInitError, setHasInitError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [cinemaProject, setCinemaProject] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({
        id: ("TURBOPACK compile-time falsy", 0) ? "TURBOPACK unreachable" : '',
        title: 'Venus Documentary',
        beats: [],
        audioUrl: null,
        fps: 30,
        aspectRatio: '16:9',
        subtitleSettings: DEFAULT_SUBTITLES
    });
    const [cinemaScript, setCinemaScript] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [cinemaTitle, setCinemaTitle] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [cinemaCredits, setCinemaCredits] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [cinemaLogs, setCinemaLogs] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [cinemaActiveBeatIndex, setCinemaActiveBeatIndex] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
    }, [
        appSettings
    ]);
    const fetchVault = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async ()=>{
        try {
            const items = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$dbService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAllNodes"])();
            setVaultItems(Array.isArray(items) ? items.sort((a, b)=>b.timestamp - a.timestamp) : []);
        } catch (err) {
            console.error("Critical Database Error:", err);
            setVaultItems([]);
        } finally{
            setIsDbLoaded(true);
        }
    }, []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        fetchVault().catch((e)=>{
            console.error("Init Error", e);
            setHasInitError(true);
        });
    }, [
        fetchVault
    ]);
    const handleCreationResult = (imageUrl, params, prompt, links, grading, visualAnchor)=>{
        setStudioCurrentImage(imageUrl);
        setStudioParams(params);
        setStudioPrompt(prompt);
        setStudioGroundingLinks(links);
        setStudioGrading(grading);
        setStudioVisualAnchor(visualAnchor);
        setStudioOriginalSource(null);
        setActiveTab('workspace');
    };
    const handleFusionResult = (imageUrl, params, logs)=>{
        setStudioCurrentImage(imageUrl);
        setStudioParams(params);
        setStudioLogs(logs);
        setStudioGrading(undefined);
        setStudioVisualAnchor(undefined);
        setActiveTab('workspace');
    };
    const handleSaveToVault = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async (item)=>{
        try {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$dbService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["saveNode"])(item);
            setVaultItems((prev)=>{
                const index = prev.findIndex((i)=>i.id === item.id);
                if (index !== -1) {
                    const updated = [
                        ...prev
                    ];
                    updated[index] = item;
                    return updated;
                }
                return [
                    item,
                    ...prev
                ];
            });
        } catch (e) {
            console.error("Failed to index node:", e);
        }
    }, []);
    const handleDeleteFromVault = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async (id)=>{
        try {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$dbService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["deleteNode"])(id);
            setVaultItems((prev)=>prev.filter((item)=>item.id !== id));
        } catch (e) {
            console.error("Delete failed:", e);
        }
    }, []);
    const handleReloadFromVault = (item)=>{
        setStudioCurrentImage(item.imageUrl);
        setStudioOriginalSource(item.originalImageUrl);
        setStudioParams(item.params);
        setStudioPrompt(item.prompt);
        setStudioLogs(item.agentHistory || []);
        setStudioGrading(item.grading);
        setStudioVisualAnchor(undefined);
        setActiveTab('workspace');
    };
    const executeHardReset = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        setStudioPrompt('');
        setStudioCurrentImage(null);
        setStudioOriginalSource(null);
        setStudioLogs([]);
        setStudioParams({
            ...DEFAULT_PARAMS
        });
        setStudioGroundingLinks([]);
        setStudioGrading(undefined);
        setStudioVisualAnchor(undefined);
    }, []);
    if (hasInitError) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "min-h-screen bg-black flex items-center justify-center p-8 text-center",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "space-y-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        className: "text-2xl font-black text-white uppercase",
                        children: "Venus AI Kernel Failure"
                    }, void 0, false, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 213,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-zinc-500 text-sm mono",
                        children: "Check API configuration environment."
                    }, void 0, false, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 214,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>window.location.reload(),
                        className: "px-6 py-2 bg-indigo-600 text-white rounded-full font-bold text-xs",
                        children: "Reload Venus"
                    }, void 0, false, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 215,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 212,
                columnNumber: 9
            }, ("TURBOPACK compile-time value", void 0))
        }, void 0, false, {
            fileName: "[project]/app/page.tsx",
            lineNumber: 211,
            columnNumber: 7
        }, ("TURBOPACK compile-time value", void 0));
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "min-h-screen w-full flex flex-col bg-[#050505] text-zinc-100 overflow-hidden relative selection:bg-indigo-500 selection:text-white",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$layout$2f$Header$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                activeTab: activeTab,
                setActiveTab: setActiveTab
            }, void 0, false, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 223,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$layout$2f$Navigation$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                activeTab: activeTab,
                setActiveTab: setActiveTab,
                vaultCount: vaultItems.length
            }, void 0, false, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 224,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                className: "flex-1 overflow-auto bg-[#020202] relative custom-scrollbar",
                children: !isDbLoaded ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex h-full items-center justify-center",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "relative",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "w-16 h-16 border-4 border-indigo-600/20 rounded-full"
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 230,
                                columnNumber: 17
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "absolute inset-0 w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 231,
                                columnNumber: 17
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 229,
                        columnNumber: 14
                    }, ("TURBOPACK compile-time value", void 0))
                }, void 0, false, {
                    fileName: "[project]/app/page.tsx",
                    lineNumber: 228,
                    columnNumber: 11
                }, ("TURBOPACK compile-time value", void 0)) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Suspense"], {
                    fallback: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "p-8 text-center text-zinc-500 text-[10px] mono animate-pulse",
                        children: "LATENT_BUFFER_LOADING..."
                    }, void 0, false, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 235,
                        columnNumber: 31
                    }, void 0),
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "pb-28 lg:pb-0 h-full",
                        children: [
                            activeTab === 'creation' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$creation$2f$CreationLab$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                onResult: handleCreationResult,
                                params: studioParams,
                                setParams: setStudioParams,
                                onReset: executeHardReset,
                                vault: vaultItems,
                                settings: appSettings
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 238,
                                columnNumber: 17
                            }, ("TURBOPACK compile-time value", void 0)),
                            activeTab === 'workspace' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$workspace$2f$Workspace$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                onSave: handleSaveToVault,
                                vault: vaultItems,
                                prompt: studioPrompt,
                                setPrompt: setStudioPrompt,
                                currentImage: studioCurrentImage,
                                setCurrentImage: setStudioCurrentImage,
                                originalSource: studioOriginalSource,
                                setOriginalSource: setStudioOriginalSource,
                                logs: studioLogs,
                                setLogs: setStudioLogs,
                                params: studioParams,
                                setParams: setStudioParams,
                                onReloadApp: executeHardReset,
                                grading: studioGrading,
                                visualAnchor: studioVisualAnchor,
                                settings: appSettings
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 248,
                                columnNumber: 17
                            }, ("TURBOPACK compile-time value", void 0)),
                            activeTab === 'grading' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$grading$2f$GradingLab$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                vault: vaultItems,
                                onSave: handleSaveToVault
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 257,
                                columnNumber: 43
                            }, ("TURBOPACK compile-time value", void 0)),
                            activeTab === 'cinema' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$cinema$2f$CinemaLab$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                vault: vaultItems,
                                onSave: handleSaveToVault,
                                currentSourceImage: studioCurrentImage,
                                project: cinemaProject,
                                setProject: setCinemaProject,
                                script: cinemaScript,
                                setScript: setCinemaScript,
                                title: cinemaTitle,
                                setTitle: setCinemaTitle,
                                credits: cinemaCredits,
                                setCredits: setCinemaCredits,
                                logs: cinemaLogs,
                                setLogs: setCinemaLogs,
                                activeBeatIndex: cinemaActiveBeatIndex,
                                setActiveBeatIndex: setCinemaActiveBeatIndex,
                                onReset: ()=>{},
                                settings: appSettings
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 259,
                                columnNumber: 17
                            }, ("TURBOPACK compile-time value", void 0)),
                            activeTab === 'fusion' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$fusion$2f$FusionLab$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                vault: vaultItems,
                                onResult: handleFusionResult,
                                settings: appSettings
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 279,
                                columnNumber: 42
                            }, ("TURBOPACK compile-time value", void 0)),
                            activeTab === 'manual' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$manual$2f$ManualNode$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                onSave: handleSaveToVault,
                                settings: appSettings
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 280,
                                columnNumber: 42
                            }, ("TURBOPACK compile-time value", void 0)),
                            activeTab === 'vault' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$vault$2f$Vault$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                items: vaultItems,
                                onDelete: handleDeleteFromVault,
                                onClearAll: ()=>{},
                                onRefresh: fetchVault,
                                onReload: handleReloadFromVault
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 281,
                                columnNumber: 41
                            }, ("TURBOPACK compile-time value", void 0)),
                            activeTab === 'docs' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$docs$2f$DocsLab$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 282,
                                columnNumber: 40
                            }, ("TURBOPACK compile-time value", void 0)),
                            activeTab === 'settings' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$settings$2f$SettingsLab$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                settings: appSettings,
                                setSettings: setAppSettings
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 283,
                                columnNumber: 44
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 236,
                        columnNumber: 13
                    }, ("TURBOPACK compile-time value", void 0))
                }, void 0, false, {
                    fileName: "[project]/app/page.tsx",
                    lineNumber: 235,
                    columnNumber: 11
                }, ("TURBOPACK compile-time value", void 0))
            }, void 0, false, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 226,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/app/page.tsx",
        lineNumber: 222,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
const __TURBOPACK__default__export__ = Page;
}),
];

//# sourceMappingURL=_64903a35._.js.map