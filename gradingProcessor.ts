
import { LatentGrading } from './types';

export const applyGrading = async (
  canvas: HTMLCanvasElement, 
  image: HTMLImageElement, 
  grading: LatentGrading
): Promise<void> => {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
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
  const stretchY = (grading as any).geometry_y || 1; 
  const scaleY = stretchY * (1 + (grading.crop_zoom || 0));
  
  ctx.scale(scaleX, scaleY);
  
  const dist = grading.lens_distortion || 0;
  const zoom = 1 + Math.abs(dist * 0.3); 
  ctx.scale(zoom, zoom);
  
  const faceWarp = grading.face_warp || 0; 
  if (faceWarp !== 0) {
      ctx.scale(1 - (faceWarp * 0.25), 1); 
  }

  ctx.translate(-cx, -cy);

  // --- PERSPECTIVE TILT ENGINE (Fake 3D Slicing) ---
  const px = grading.perspective_x || 0;
  const py = grading.perspective_y || 0;

  if (Math.abs(px) < 0.001 && Math.abs(py) < 0.001) {
      ctx.drawImage(image, 0, 0);
  } else {
      let source: CanvasImageSource = image;
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
              
              for (let y = 0; y < sourceH; y++) {
                  const progress = y / sourceH;
                  let scale = 1;
                  
                  // py > 0: Top Wide, Bottom Narrow. py < 0: Top Narrow, Bottom Wide.
                  if (py > 0) scale = 1 - (progress * strength);
                  else scale = 1 - ((1 - progress) * strength);
                  
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
           
           for (let x = 0; x < sourceW; x++) {
               const progress = x / sourceW;
               let scale = 1;
               
               // px > 0: Left Wide, Right Narrow. px < 0: Left Narrow, Right Wide.
               if (px > 0) scale = 1 - (progress * strength);
               else scale = 1 - ((1 - progress) * strength);
               
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
  
  const needsSpatial = grading.sharpness > 0 || grading.structure > 0 || 
                       grading.clarity !== 0 || grading.skin_smooth > 0 || grading.denoise > 0 ||
                       grading.chromatic_aberration > 0;
                       
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

  const hslToRgb = (h: number, s: number, l: number) => {
     const c = (1 - Math.abs(2 * l - 1)) * s;
     const x = c * (1 - Math.abs((h / 60) % 2 - 1));
     const m = l - c / 2;
     let r=0,g=0,b=0;
     if(0<=h&&h<60){r=c;g=x;b=0}else if(60<=h&&h<120){r=x;g=c;b=0}else if(120<=h&&h<180){r=0;g=c;b=x}
     else if(180<=h&&h<240){r=0;g=x;b=c}else if(240<=h&&h<300){r=x;g=0;b=c}else if(300<=h&&h<360){r=c;g=0;b=x}
     return [(r+m)*255, (g+m)*255, (b+m)*255];
  };
  const shadowRGB = hslToRgb(grading.split_shadow_hue || 210, 1, 0.5);
  const highlightRGB = hslToRgb(grading.split_highlight_hue || 30, 1, 0.5);
  const midRGB = hslToRgb(grading.split_mid_hue || 0, 1, 0.5);

  const grainAmt = (grading.grain || 0) * 60; 
  const sharpenAmt = (grading.sharpness || 0) * 3;
  const clarityAmt = (grading.clarity || 0);
  const chromaAmt = (grading.chromatic_aberration || 0) * 3.5;

  const skinSmooth = grading.skin_smooth || 0;
  const eyeClarity = grading.eye_clarity || 0;
  const featurePop = grading.feature_pop || 0;
  const teethWhitening = grading.teeth_whitening || 0;

  for (let i = 0; i < data.length; i += 4) {
     let r = sourceData[i];
     let g = sourceData[i+1];
     let b = sourceData[i+2];
     
     const x = (i / 4) % w;
     const y = Math.floor((i / 4) / w);

     if (needsSpatial) {
         if (chromaAmt > 0) {
             const distX = (x - cx) / w;
             const distY = (y - cy) / h;
             const distSq = distX*distX + distY*distY;
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
             const avgG = (sourceData[up+1] + sourceData[down+1] + sourceData[left+1] + sourceData[right+1] + g) * 0.2;
             const avgB = (sourceData[up+2] + sourceData[down+2] + sourceData[left+2] + sourceData[right+2] + b) * 0.2;
             const hpR = r - avgR; const hpG = g - avgG; const hpB = b - avgB;
             
             if (sharpenAmt > 0 || featurePop > 0) {
                 const boost = sharpenAmt + (featurePop * 2.5);
                 r += hpR * boost; g += hpG * boost; b += hpB * boost;
             }
             if (clarityAmt !== 0) {
                 r += hpR * clarityAmt * 0.8;
                 g += hpG * clarityAmt * 0.8;
                 b += hpB * clarityAmt * 0.8;
             }
             if (skinSmooth > 0 || grading.denoise > 0) {
                 const isSkin = (r > g && g > b && r > 40 && Math.abs(r-g) > 5);
                 const blurStrength = isSkin ? Math.max(grading.denoise, skinSmooth) : grading.denoise;
                 if (blurStrength > 0) {
                    const mix = blurStrength * 0.75; 
                    r = r * (1 - mix) + avgR * mix;
                    g = g * (1 - mix) + avgG * mix;
                    b = b * (1 - mix) + avgB * mix;
                 }
             }
             
             const lumaPixel = 0.2126*r + 0.7152*g + 0.0722*b;
             if (teethWhitening > 0 && lumaPixel > 80) { 
                 const max = Math.max(r,g,b);
                 const min = Math.min(r,g,b);
                 const sat = (max - min) / (max || 1);
                 if (sat < 0.5 && r > b && g > b) {
                     const wStr = teethWhitening * 0.8;
                     r = Math.min(255, r + 50 * wStr);
                     g = Math.min(255, g + 50 * wStr);
                     b = Math.min(255, b + 70 * wStr); 
                     const gray = (r+g+b)/3;
                     r = r * (1 - wStr*0.5) + gray * wStr*0.5;
                     g = g * (1 - wStr*0.5) + gray * wStr*0.5;
                     b = b * (1 - wStr*0.5) + gray * wStr*0.5;
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
     r += tempK; b -= tempK; g += tintM;

     let nr = r / 255; let ng = g / 255; let nb = b / 255;
     
     // Dehaze
     if (dehazeVal !== 0) {
         const minC = Math.min(nr, ng, nb);
         const dehazeFactor = dehazeVal * 0.3;
         nr = (nr - minC * dehazeFactor) / (1 - dehazeFactor);
         ng = (ng - minC * dehazeFactor) / (1 - dehazeFactor);
         nb = (nb - minC * dehazeFactor) / (1 - dehazeFactor);
     }

     // Exposure / Brightness / Contrast
     nr *= exposure; ng *= exposure; nb *= exposure;
     nr = (nr - pivot) * contrast + pivot + (brightness - 1);
     ng = (ng - pivot) * contrast + pivot + (brightness - 1);
     nb = (nb - pivot) * contrast + pivot + (brightness - 1);

     // LGG Application with GLOBAL + PER-CHANNEL Logic
     const applyLGG = (c: number, lift: number, gam: number, gain: number, off: number) => {
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
     nr = applyLGG(nr, 
        globalLift + (grading.lift_r || 0), 
        globalGamma * (grading.gamma_r || 1), 
        globalGain * (grading.gain_r || 1), 
        globalOffset + (grading.offset_r || 0)
     );
     ng = applyLGG(ng, 
        globalLift + (grading.lift_g || 0), 
        globalGamma * (grading.gamma_g || 1), 
        globalGain * (grading.gain_g || 1), 
        globalOffset + (grading.offset_g || 0)
     );
     nb = applyLGG(nb, 
        globalLift + (grading.lift_b || 0), 
        globalGamma * (grading.gamma_b || 1), 
        globalGain * (grading.gain_b || 1), 
        globalOffset + (grading.offset_b || 0)
     );

     const luma = 0.2126*nr + 0.7152*ng + 0.0722*nb;
     
     // Split Toning
     if (grading.split_shadow_sat > 0 || grading.split_highlight_sat > 0 || grading.split_mid_sat > 0) {
         const bal = grading.split_balance || 0;
         const sMask = Math.max(0, 1 - (luma * 2) + bal);
         const hMask = Math.max(0, (luma - 0.5 - bal) * 2);
         const mMask = 1 - sMask - hMask;

         if (sMask > 0 && grading.split_shadow_sat > 0) {
             const str = sMask * grading.split_shadow_sat * 0.3;
             nr += (shadowRGB[0]/255 - nr) * str;
             ng += (shadowRGB[1]/255 - ng) * str;
             nb += (shadowRGB[2]/255 - nb) * str;
         }
         if (hMask > 0 && grading.split_highlight_sat > 0) {
             const str = hMask * grading.split_highlight_sat * 0.3;
             nr += (highlightRGB[0]/255 - nr) * str;
             ng += (highlightRGB[1]/255 - ng) * str;
             nb += (highlightRGB[2]/255 - nb) * str;
         }
         if (mMask > 0 && grading.split_mid_sat > 0) {
             const str = mMask * grading.split_mid_sat * 0.3;
             nr += (midRGB[0]/255 - nr) * str;
             ng += (midRGB[1]/255 - ng) * str;
             nb += (midRGB[2]/255 - nb) * str;
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

     const getSatBoost = (targetH: number, width: number, boost: number) => {
         if (!boost) return 0;
         let diff = Math.abs(hue - targetH);
         if (diff > 0.5) diff = 1 - diff;
         if (diff < width) return boost * (1 - diff/width);
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
         let mask = diff < thresh ? Math.pow(1 - (diff / thresh), 0.5) : 0;
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
             nr += finalNoise * (1 + Math.random()*0.5);
             ng += finalNoise * (1 + Math.random()*0.5);
             nb += finalNoise * (1 + Math.random()*0.5);
         } else {
             nr += finalNoise; ng += finalNoise; nb += finalNoise;
         }
     }

     data[i] = Math.min(255, Math.max(0, nr * 255));
     data[i+1] = Math.min(255, Math.max(0, ng * 255));
     data[i+2] = Math.min(255, Math.max(0, nb * 255));
  }
  
  ctx.putImageData(imageData, 0, 0);

  // Post-Process Effects (Halation, Bloom, etc)
  if (grading.halation && grading.halation > 0) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighten';
      ctx.filter = `blur(${4 + (grading.halation_radius||0)}px)`;
      ctx.globalAlpha = grading.halation;
      ctx.drawImage(canvas, 0, 0);
      ctx.fillStyle = 'rgba(255, 0, 0, 0.1)'; 
      ctx.globalCompositeOperation = 'source-atop';
      ctx.fillRect(0, 0, w, h);
      ctx.restore();
  }

  if (grading.bloom && grading.bloom > 0) {
      ctx.save();
      ctx.filter = `blur(${10 + (grading.bloom_radius||0)*20}px) brightness(${1 + grading.bloom})`;
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
      vCanvas.width = w; vCanvas.height = h;
      const vCtx = vCanvas.getContext('2d');
      if (vCtx) {
          vCtx.fillStyle = `rgba(0,0,0,${grading.vignette})`;
          vCtx.fillRect(0, 0, w, h);
          vCtx.globalCompositeOperation = 'destination-out';
          vCtx.beginPath();
          const rx = w/2 * (0.8 - (1-Math.abs(roundness))*0.3); 
          const ry = h/2 * (0.8 - (1-Math.abs(roundness))*0.3); 
          if (roundness >= 0) {
             vCtx.ellipse(cx, cy, rx, ry, 0, 0, 2 * Math.PI);
          } else {
             const rr = Math.min(rx, ry) * (1 + roundness); 
             vCtx.roundRect(cx - rx, cy - ry, rx*2, ry*2, Math.max(0, rr));
          }
          vCtx.fill();
      }
      ctx.filter = `blur(${feather * 60}px)`;
      ctx.drawImage(vCanvas, 0, 0);
      ctx.restore();
  }
};
