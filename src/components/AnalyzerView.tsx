import React, { useState, useEffect } from 'react';
import { AnalysisInput, AnalysisResult, ToastMessage } from '../types.ts';
import { useTranslation } from '../i18n/LanguageContext.tsx';
import { analyser_signal, AnalyseSignalResultat } from '../utils/aviatorFormula.ts';
import {
  Clock,
  Radio,
  RotateCcw,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Zap,
  Target,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface AnalyzerViewProps {
  onSaveResult: (result: AnalysisResult) => void;
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
}

export const AnalyzerView: React.FC<AnalyzerViewProps> = ({ onSaveResult, addToast }) => {
  const { t } = useTranslation();

  // Current system clock
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      const ss = String(now.getSeconds()).padStart(2, '0');
      setCurrentTime(`${hh}:${mm}:${ss}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Form input state initialized with prompt test data
  const [input, setInput] = useState<AnalysisInput>({
    lastTime: '18:50:52',
    lastMultiplier: 5.89,
    strategy: 'rose',
  });

  const [errors, setErrors] = useState<{ lastTime?: string; lastMultiplier?: string }>({});
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [copiedSignal, setCopiedSignal] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Compute baseline default result matching prompt's formula test
  const initialFormula = analyser_signal('18:50:52', 5.89);
  const [currentResult, setCurrentResult] = useState<AnalysisResult | null>({
    id: 'sig_initial_test',
    timestamp: '18:50:52',
    inputTime: initialFormula.derniere_heure || '18:50:52',
    inputMultiplier: initialFormula.derniere_cote_num || 5.89,
    targetTime: initialFormula.heure_cible || '18:53:41',
    targetMultiplierMin: 5.0,
    targetMultiplierMax: 49.99,
    confidenceScore: initialFormula.confiance_num || 95.0,
    riskLevel: 'high',
    recommendedCashout: initialFormula.cote_cible_num || 14.39,
    patternDetected: 'Signal Rose VIP',
    status: 'pending',
    isRoseSignal: true,
    categorie: initialFormula.categorie || 'ROSE',
    details: initialFormula.details,
  });

  // Web Audio synth beep on alert
  const playSignalSound = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch {
      // AudioContext unavailable in silent environments
    }
  };

  const validate = (): boolean => {
    const newErrors: { lastTime?: string; lastMultiplier?: string } = {};

    const testOutput = analyser_signal(input.lastTime, input.lastMultiplier);
    if (testOutput.erreur) {
      if (testOutput.erreur.includes('Format')) {
        newErrors.lastTime = testOutput.erreur;
      } else {
        newErrors.lastMultiplier = testOutput.erreur;
      }
      setErrors(newErrors);
      return false;
    }

    setErrors({});
    return true;
  };

  const handleAnalyze = () => {
    if (!validate()) return;

    setIsAnalyzing(true);
    setScanProgress(0);

    // Scanning progress animation
    let currentP = 0;
    const interval = setInterval(() => {
      currentP += 18;
      if (currentP >= 100) {
        clearInterval(interval);
        finalizeAnalysis();
      } else {
        setScanProgress(currentP);
      }
    }, 90);
  };

  const finalizeAnalysis = () => {
    setIsAnalyzing(false);
    setScanProgress(100);

    const res: AnalyseSignalResultat = analyser_signal(input.lastTime, input.lastMultiplier);

    if (res.erreur) {
      addToast({
        type: 'error',
        message: res.erreur,
      });
      return;
    }

    const coteCible = res.cote_cible_num || 14.39;
    const confianceNum = res.confiance_num || 95.0;

    const result: AnalysisResult = {
      id: 'sig_' + Date.now(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      inputTime: res.derniere_heure || input.lastTime,
      inputMultiplier: res.derniere_cote_num || Number(input.lastMultiplier),
      targetTime: res.heure_cible || '',
      targetMultiplierMin: Math.max(5.00, +(coteCible * 0.85).toFixed(2)),
      targetMultiplierMax: Math.min(49.99, +(coteCible * 1.35).toFixed(2)),
      confidenceScore: confianceNum,
      riskLevel: 'high',
      recommendedCashout: coteCible,
      patternDetected: 'Signal Rose VIP',
      status: 'pending',
      isRoseSignal: true,
      categorie: res.categorie || 'ROSE',
      details: res.details,
    };

    setCurrentResult(result);
    onSaveResult(result);
    playSignalSound();
    addToast({
      type: 'success',
      message: `🌸 SIGNAL ROSE CALCULÉ : ${res.cote_cible} à ${res.heure_cible}`,
    });
  };

  const handleReset = () => {
    setInput({
      lastTime: '18:50:52',
      lastMultiplier: 5.89,
      strategy: 'rose',
    });
    setErrors({});
  };

  const loadPromptTestCase = () => {
    setInput({
      lastTime: '18:50:52',
      lastMultiplier: 5.89,
      strategy: 'rose',
    });
    setErrors({});
    addToast({
      type: 'info',
      message: 'Exemple officiel de test chargé : 18:50:52 / x5.89',
    });
  };

  const setCurrentTimeToInput = () => {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    setInput((prev) => ({ ...prev, lastTime: `${hh}:${mm}:${ss}` }));
    if (errors.lastTime) setErrors((prev) => ({ ...prev, lastTime: undefined }));
  };

  const setTimeOffsetSeconds = (secondsAgo: number) => {
    const now = new Date();
    now.setSeconds(now.getSeconds() - secondsAgo);
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    setInput((prev) => ({ ...prev, lastTime: `${hh}:${mm}:${ss}` }));
    if (errors.lastTime) setErrors((prev) => ({ ...prev, lastTime: undefined }));
  };

  const setQuickMultiplier = (val: number) => {
    setInput((prev) => ({ ...prev, lastMultiplier: val }));
    if (errors.lastMultiplier) setErrors((prev) => ({ ...prev, lastMultiplier: undefined }));
  };

  const copyTelemetryOutput = () => {
    if (!currentResult) return;
    const textToCopy = `✈️ AVIATOR SIGNAL
========================================
🌸 CATÉGORIE : ${currentResult.categorie || 'ROSE'}
🕒 DERNIÈRE HEURE : ${currentResult.inputTime}
📈 DERNIÈRE CÔTE : x${currentResult.inputMultiplier.toFixed(2)}
----------------------------------------
🎯 HEURE CIBLE : ${currentResult.targetTime}
💎 CÔTE CIBLE : x${currentResult.recommendedCashout.toFixed(2)}
📊 CONFIANCE : ${currentResult.confidenceScore.toFixed(1)}%
========================================`;

    navigator.clipboard.writeText(textToCopy);
    setCopiedSignal(true);
    setTimeout(() => setCopiedSignal(false), 2500);
    addToast({
      type: 'success',
      message: 'Signal officiel copié dans le presse-papier !',
    });
  };

  // Calculate 5 segmented confidence ticks
  const confidenceBars = Math.min(5, Math.max(1, Math.round((currentResult?.confidenceScore || 95) / 20)));

  return (
    <div className="w-full text-white">
      {/* Top Telemetry Bar with Glass Effect & Gold Border */}
      <div className="border-b border-[#D4AF37]/30 px-6 sm:px-10 py-4 flex flex-wrap items-center justify-between gap-4 bg-black/65 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-[#E30613] animate-pulse shadow-[0_0_10px_#E30613]" />
          <span className="text-[11px] uppercase tracking-[0.25em] font-semibold text-[#D4AF37]">
            {t('analyzer.liveTelemetry')} • SIGNAL VIP ROSE (X5.00 → X49.99)
          </span>
          <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] bg-[#FF2A85]/20 text-[#ff80be] border border-[#FF2A85]/40 font-mono font-bold">
            <span>PRÉDICTION HAUTE ALTITUDE</span>
          </span>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-[#D4AF37]">
            <Clock className="w-4 h-4 text-[#D4AF37]" />
            <span className="font-mono text-base sm:text-lg tracking-wider text-white font-bold">
              {currentTime || '18:50:52'}
            </span>
          </div>

          <button
            type="button"
            id="toggle-sound-btn"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 border border-[#D4AF37]/40 rounded hover:border-[#D4AF37] hover:bg-[#D4AF37]/10 text-[#D4AF37] transition-all cursor-pointer"
            title="Alerte audio radar"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Glass Grid: 3-column architecture */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 sm:p-8 max-w-7xl mx-auto">
        {/* Section 1: Formulaire d'analyse (Col 4) */}
        <section className="lg:col-span-4 aviator-glass-card rounded-2xl p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-[#D4AF37]/25">
              <div>
                <h2 className="text-xs uppercase tracking-[0.3em] text-[#D4AF37] font-bold font-mono">
                  {t('analyzer.title')}
                </h2>
                <p className="text-[10px] text-white/60 font-mono mt-0.5">
                  Système Prédictif Aviator
                </p>
              </div>
              <span className="text-[10px] px-2.5 py-1 rounded bg-[#D4AF37]/20 border border-[#D4AF37]/50 text-[#D4AF37] font-mono tracking-wider font-bold">
                SIGNAL ROSE
              </span>
            </div>

            {/* Quick Test Preset Banner */}
            <div className="mb-6 p-3 bg-black/40 border border-[#D4AF37]/40 rounded-xl flex items-center justify-between gap-2">
              <div className="text-[11px] font-mono">
                <span className="text-[#D4AF37] font-bold">Test Test :</span>{' '}
                <span className="text-white/80">18:50:52 | x5.89</span>
              </div>
              <button
                type="button"
                onClick={loadPromptTestCase}
                className="px-2.5 py-1 text-[10px] uppercase tracking-wider font-mono font-bold bg-[#D4AF37]/25 text-white hover:bg-[#D4AF37]/40 rounded border border-[#D4AF37] transition-colors cursor-pointer"
              >
                Charger
              </button>
            </div>

            <div className="space-y-6">
              {/* 1. Dernière Heure (HH:MM:SS) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label
                    htmlFor="input-last-time"
                    className="block text-[11px] uppercase tracking-widest text-[#D4AF37] font-bold"
                  >
                    🕒 {t('analyzer.lastTime')}
                  </label>
                  <span className="text-[10px] text-[#D4AF37] font-mono font-bold">
                    Format HH:MM:SS
                  </span>
                </div>
                <input
                  type="text"
                  id="input-last-time"
                  value={input.lastTime}
                  onChange={(e) => {
                    setInput({ ...input, lastTime: e.target.value });
                    if (errors.lastTime) setErrors({ ...errors, lastTime: undefined });
                  }}
                  placeholder="18:50:52"
                  maxLength={8}
                  className="w-full bg-black/50 border-b-2 border-[#D4AF37]/60 focus:border-[#D4AF37] py-2.5 px-3 text-2xl font-mono text-white outline-none transition-colors rounded-t"
                />
                {errors.lastTime && (
                  <div className="flex items-center gap-1.5 text-xs text-[#ff5260] mt-2 font-mono font-bold">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.lastTime}</span>
                  </div>
                )}

                {/* Quick Time Presets */}
                <div className="flex flex-wrap items-center gap-1.5 mt-3">
                  <button
                    type="button"
                    onClick={setCurrentTimeToInput}
                    className="text-[10px] uppercase tracking-wider px-2.5 py-1 border border-[#D4AF37]/40 rounded hover:border-[#D4AF37] hover:bg-[#D4AF37]/20 text-white transition-all font-mono cursor-pointer"
                  >
                    ⏰ Actuelle
                  </button>
                  <button
                    type="button"
                    onClick={() => setTimeOffsetSeconds(60)}
                    className="text-[10px] px-2 py-1 border border-[#D4AF37]/30 rounded hover:border-[#D4AF37] text-white/80 transition-all font-mono cursor-pointer"
                  >
                    -60s
                  </button>
                  <button
                    type="button"
                    onClick={() => setTimeOffsetSeconds(120)}
                    className="text-[10px] px-2 py-1 border border-[#D4AF37]/30 rounded hover:border-[#D4AF37] text-white/80 transition-all font-mono cursor-pointer"
                  >
                    -2min
                  </button>
                  <button
                    type="button"
                    onClick={() => setTimeOffsetSeconds(300)}
                    className="text-[10px] px-2 py-1 border border-[#D4AF37]/30 rounded hover:border-[#D4AF37] text-white/80 transition-all font-mono cursor-pointer"
                  >
                    -5min
                  </button>
                </div>
              </div>

              {/* 2. Dernière Côte */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label
                    htmlFor="input-last-multiplier"
                    className="block text-[11px] uppercase tracking-widest text-[#D4AF37] font-bold"
                  >
                    📈 {t('analyzer.lastMultiplier')}
                  </label>
                  <span className="text-[10px] opacity-70 font-mono text-white">ex: 5.89</span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    id="input-last-multiplier"
                    value={input.lastMultiplier}
                    onChange={(e) => {
                      setInput({ ...input, lastMultiplier: parseFloat(e.target.value) || 0 });
                      if (errors.lastMultiplier) setErrors({ ...errors, lastMultiplier: undefined });
                    }}
                    placeholder="5.89"
                    className="w-full bg-black/50 border-b-2 border-[#D4AF37]/60 focus:border-[#D4AF37] py-2.5 px-3 text-2xl font-mono text-white outline-none transition-colors rounded-t"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xl font-bold text-[#E30613]">
                    x
                  </span>
                </div>
                {errors.lastMultiplier && (
                  <div className="flex items-center gap-1.5 text-xs text-[#ff5260] mt-2 font-mono font-bold">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.lastMultiplier}</span>
                  </div>
                )}

                {/* Multiplier Presets */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {[1.85, 2.45, 3.80, 5.89, 10.5, 24.0].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setQuickMultiplier(val)}
                      className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded transition-all cursor-pointer ${
                        input.lastMultiplier === val
                          ? 'border border-[#D4AF37] bg-[#D4AF37]/35 text-white shadow-[0_0_12px_rgba(212,175,55,0.5)]'
                          : val >= 5.0
                          ? 'border border-[#FF2A85]/50 bg-[#FF2A85]/15 text-[#ff80be] hover:border-[#FF2A85]'
                          : 'border border-[#D4AF37]/30 bg-black/40 text-white/80 hover:border-[#D4AF37]'
                      }`}
                    >
                      {val >= 5.0 ? `🌸 ${val.toFixed(2)}x` : `${val.toFixed(2)}x`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action: Analyser le Signal - MAIN BUTTON 🔴 ANALYSER */}
              <div className="space-y-3 pt-2">
                <button
                  type="button"
                  id="btn-analyze"
                  disabled={isAnalyzing}
                  onClick={handleAnalyze}
                  className="w-full py-4 sm:py-5 bg-[#E30613] hover:bg-[#b8050f] active:scale-[0.99] text-white text-sm font-black uppercase tracking-[0.25em] transition-all flex items-center justify-center gap-2.5 rounded-xl shadow-[0_0_35px_rgba(227,6,19,0.6)] border border-[#ff4d5a]/60 disabled:opacity-60 cursor-pointer"
                >
                  {isAnalyzing ? (
                    <>
                      <Radio className="w-5 h-5 animate-spin text-white" />
                      <span>{t('analyzer.btnAnalyzing')}</span>
                    </>
                  ) : (
                    <>
                      <span className="text-xl">🔴</span>
                      <span>ANALYSER</span>
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="py-1.5 px-3 text-[10px] uppercase tracking-widest text-[#D4AF37]/80 hover:text-[#D4AF37] transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{t('analyzer.btnReset')}</span>
                  </button>

                  <span className="text-[10px] font-mono text-[#D4AF37]">
                    Signal calibré
                  </span>
                </div>
              </div>

              {/* Scanning Progress Bar */}
              {isAnalyzing && (
                <div className="space-y-2 animate-in fade-in">
                  <div className="flex justify-between text-[10px] uppercase tracking-widest font-mono text-[#D4AF37]">
                    <span>SCAN ALGOMATIQUE EN COURS...</span>
                    <span>{scanProgress}%</span>
                  </div>
                  <div className="w-full h-2 bg-black/60 rounded-full overflow-hidden border border-[#D4AF37]/40">
                    <div
                      className="h-full bg-gradient-to-r from-[#E30613] via-[#D4AF37] to-[#E30613] transition-all duration-150"
                      style={{ width: `${scanProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Status Badge */}
          <div className="mt-6 p-4 bg-black/60 rounded-xl border border-[#D4AF37]/35 space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]" />
                <span className="text-[10px] uppercase tracking-widest text-[#D4AF37] font-mono font-bold">
                  Télémétrie Active
                </span>
              </div>
              <span className="text-[10px] font-mono text-[#ff80be] bg-[#FF2A85]/20 px-2 py-0.5 rounded border border-[#FF2A85]/40 font-bold">
                X5.00 → X49.99
              </span>
            </div>
            <p className="text-[11px] text-white/70 font-sans">
              Analyse prédictive continue des multiplicateurs haute altitude
            </p>
          </div>
        </section>

        {/* Section 2: RESULT CARD - 🟡 RÉSULTAT D'ANALYSE (Col 5) */}
        <section className="lg:col-span-5 aviator-glass-card-gold rounded-2xl p-6 sm:p-10 relative flex flex-col justify-between text-center min-h-[560px]">
          <div>
            {/* Top Result Card Header */}
            <div className="w-full flex items-center justify-between pb-3 mb-3 border-b border-[#D4AF37]/35">
              <div className="flex items-center gap-2">
                <span className="text-lg">🟡</span>
                <h2 className="text-xs sm:text-sm uppercase tracking-[0.25em] text-[#D4AF37] font-black font-mono">
                  RÉSULTAT D'ANALYSE
                </h2>
              </div>
              <button
                type="button"
                onClick={copyTelemetryOutput}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37] text-white text-[10px] font-mono font-bold hover:bg-[#D4AF37]/40 transition-colors cursor-pointer"
                title="Copier le signal"
              >
                {copiedSignal ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>COPIÉ !</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>COPIER</span>
                  </>
                )}
              </button>
            </div>

            {/* Rose Signal Alert Badge */}
            <div className="my-2 inline-flex items-center gap-2.5 px-5 py-2 rounded-full border-2 border-[#FF2A85] bg-[#FF2A85]/25 text-white font-black text-xs sm:text-sm tracking-[0.2em] uppercase shadow-[0_0_30px_rgba(255,42,133,0.6)] animate-pulse">
              <span className="text-base">🌸</span>
              <span>CATÉGORIE : ROSE</span>
              <span className="text-[10px] text-[#f3e5ab] font-mono font-medium tracking-normal border-l border-white/40 pl-2">
                X5.00 → X49.99
              </span>
            </div>

            {/* Input Context Summary */}
            <div className="grid grid-cols-2 gap-3 my-3 p-3 bg-black/40 rounded-xl border border-[#D4AF37]/25 text-xs font-mono">
              <div className="text-left">
                <span className="text-white/60 text-[10px] uppercase block tracking-wider">
                  🕒 Dernière Heure
                </span>
                <span className="text-white font-bold text-sm">
                  {currentResult ? currentResult.inputTime : '18:50:52'}
                </span>
              </div>
              <div className="text-right">
                <span className="text-white/60 text-[10px] uppercase block tracking-wider">
                  📈 Dernière Côte
                </span>
                <span className="text-[#D4AF37] font-bold text-sm">
                  x{currentResult ? currentResult.inputMultiplier.toFixed(2) : '5.89'}
                </span>
              </div>
            </div>

            {/* Huge Multiplier: 💎 CÔTE CIBLE */}
            <div className="my-3">
              <div className="text-[11px] uppercase tracking-[0.35em] text-[#D4AF37] font-black font-mono mb-1">
                💎 CÔTE CIBLE ESTIMÉE
              </div>
              <span className="text-[75px] sm:text-[100px] md:text-[115px] font-mono font-black leading-none tracking-tighter text-white drop-shadow-[0_0_35px_rgba(255,255,255,0.4)] select-all">
                x{currentResult ? currentResult.recommendedCashout.toFixed(2) : '14.39'}
              </span>
            </div>

            {/* Target Time: 🎯 HEURE CIBLE */}
            <div className="space-y-1 w-full max-w-sm mx-auto p-4 bg-black/45 rounded-xl border border-[#D4AF37]/40 shadow-inner">
              <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.25em] font-semibold text-[#D4AF37]">
                <span>🎯 HEURE CIBLE</span>
                <span className="font-mono text-[#ff80be] flex items-center gap-1 font-bold">
                  <Sparkles className="w-3 h-3 text-[#FF2A85]" />
                  <span>FENÊTRE VIP</span>
                </span>
              </div>
              <p className="text-3xl sm:text-4xl font-mono font-black text-white tracking-widest my-1">
                {currentResult ? currentResult.targetTime : '18:53:41'}
              </p>
              <p className="text-[10px] text-white/70 font-mono tracking-wide">
                Fenêtre de sortie optimale pour multiplicateur ROSE
              </p>
            </div>

            {/* Confidence Score: 📊 CONFIANCE */}
            <div className="mt-5 flex flex-col items-center w-full">
              <div className="flex items-center justify-between w-full max-w-xs mb-2">
                <span className="text-[10px] uppercase tracking-widest text-[#D4AF37] font-bold font-mono">
                  📊 CONFIANCE ALGORITHMIQUE
                </span>
                <span className="text-base font-mono font-black text-emerald-400">
                  {currentResult ? `${currentResult.confidenceScore.toFixed(1)}%` : '95.0%'}
                </span>
              </div>
              <div className="flex gap-2 w-full max-w-xs justify-center">
                {[1, 2, 3, 4, 5].map((idx) => (
                  <div
                    key={idx}
                    className={`flex-1 h-2 rounded-full transition-all ${
                      idx <= confidenceBars
                        ? 'bg-gradient-to-r from-[#D4AF37] to-[#E30613] shadow-[0_0_10px_rgba(212,175,55,0.5)]'
                        : 'bg-white/10'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Discrete Security / Status verification */}
          <div className="mt-4 pt-3 border-t border-[#D4AF37]/25 w-full flex items-center justify-between text-[10px] text-white/60 font-mono">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Signal calibré & prêt</span>
            </span>
            <span className="text-[#D4AF37]">Haute Précision</span>
          </div>
        </section>

        {/* Section 3: Terminal Télémétrique & Signaux (Col 3) */}
        <section className="lg:col-span-3 aviator-glass-card rounded-2xl p-6 sm:p-8 overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-[#D4AF37]/25">
              <h2 className="text-xs uppercase tracking-[0.3em] text-[#D4AF37] font-bold font-mono">
                TERMINAL ROSE
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-white font-mono">
                TELEMETRY
              </span>
            </div>

            {/* Visual Terminal preview */}
            <div className="bg-black/75 rounded-xl border border-[#D4AF37]/35 p-3.5 font-mono text-[11px] space-y-1.5 shadow-inner">
              <div className="flex items-center gap-1.5 text-[#D4AF37] font-bold border-b border-white/10 pb-1.5">
                <span>✈️ AVIATOR SIGNAL</span>
              </div>
              <div className="text-[#ff80be] font-bold">
                🌸 CATÉGORIE : {currentResult?.categorie || 'ROSE'}
              </div>
              <div className="text-white/80">
                🕒 DERNIÈRE HEURE : {currentResult?.inputTime || '18:50:52'}
              </div>
              <div className="text-white/80">
                📈 DERNIÈRE CÔTE : x{currentResult ? currentResult.inputMultiplier.toFixed(2) : '5.89'}
              </div>
              <div className="border-t border-dashed border-white/20 my-1 pt-1 text-white font-bold">
                🎯 HEURE CIBLE : {currentResult?.targetTime || '18:53:41'}
              </div>
              <div className="text-[#D4AF37] font-black text-sm">
                💎 CÔTE CIBLE : x{currentResult ? currentResult.recommendedCashout.toFixed(2) : '14.39'}
              </div>
              <div className="text-emerald-400 font-bold border-b border-white/10 pb-1.5">
                📊 CONFIANCE : {currentResult ? `${currentResult.confidenceScore.toFixed(1)}%` : '95.0%'}
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={copyTelemetryOutput}
                  className="w-full py-1.5 bg-[#D4AF37]/20 hover:bg-[#D4AF37]/35 border border-[#D4AF37]/50 rounded text-center text-[10px] text-white uppercase font-bold tracking-wider transition-colors cursor-pointer"
                >
                  {copiedSignal ? '✓ Signal Copié' : 'Copier ce Rapport'}
                </button>
              </div>
            </div>

            {/* Quick explanation box */}
            <div className="mt-6 p-3 bg-black/40 rounded-xl border border-[#D4AF37]/20 space-y-1 text-xs">
              <p className="text-[10px] uppercase font-mono font-bold text-[#D4AF37]">
                À propos du Signal Rose :
              </p>
              <p className="text-[11px] text-white/70 font-sans leading-relaxed">
                Le signal Rose anticipe les fenêtres d'envol haute altitude (x5.00 à x49.99) grâce à la corrélation des cotes antérieures.
              </p>
            </div>
          </div>

          {/* Safety note */}
          <div className="mt-6 pt-4 border-t border-[#D4AF37]/20 text-[10px] text-white/60 leading-relaxed font-sans">
            <p>{t('analyzer.safetyDisclaimer')}</p>
          </div>
        </section>
      </div>
    </div>
  );
};
