import React, { useState, useEffect } from 'react';
import { calculateAviatorSignal } from '../utils/aviatorFormula';
import {
  Calendar,
  Clock,
  TrendingUp,
  Zap,
  Copy,
  Check,
  RotateCcw,
  AlertTriangle,
  Loader2,
  Sparkles
} from 'lucide-react';
import { motion } from 'motion/react';

export const PredictionPage: React.FC = () => {
  const [inputTime, setInputTime] = useState<string>('');
  const [inputMultiplier, setInputMultiplier] = useState<string>('5.89');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);
  const [result, setResult] = useState<{
    targetTime: string;
    targetMultiplier: number;
    confidence: number;
    lastTime: string;
    lastMultiplier: number;
  } | null>({
    targetTime: '18:53:41',
    targetMultiplier: 14.39,
    confidence: 95.0,
    lastTime: '18:50:52',
    lastMultiplier: 5.89,
  });

  // Set default current time on mount if empty
  useEffect(() => {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    const s = String(now.getSeconds()).padStart(2, '0');
    setInputTime(`${h}:${m}:${s}`);
  }, []);

  const handleSetCurrentTime = () => {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    const s = String(now.getSeconds()).padStart(2, '0');
    setInputTime(`${h}:${m}:${s}`);
  };

  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputTime) return;

    setIsAnalyzing(true);
    setProgress(0);

    const multNum = parseFloat(inputMultiplier) || 2.0;

    // Simulation animation
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 25;
      });
    }, 120);

    setTimeout(() => {
      clearInterval(interval);
      try {
        const formulaRes = calculateAviatorSignal(inputTime, multNum);
        setResult({
          targetTime: formulaRes.heure_cible,
          targetMultiplier: formulaRes.cote_cible_num,
          confidence: formulaRes.confiance_num,
          lastTime: inputTime,
          lastMultiplier: multNum,
        });
      } catch (err) {
        // Safe fallback
        setResult({
          targetTime: inputTime,
          targetMultiplier: 12.5,
          confidence: 92.0,
          lastTime: inputTime,
          lastMultiplier: multNum,
        });
      }
      setIsAnalyzing(false);
      setProgress(100);
    }, 600);
  };

  const handleCopySignal = () => {
    if (!result) return;
    const text = `✈️ TOP GSS SIGNAL VIP
🕒 DERNIÈRE HEURE : ${result.lastTime}
📈 DERNIÈRE COTE : x${result.lastMultiplier.toFixed(2)}
----------------------------------------
🎯 HEURE CIBLE : ${result.targetTime}
💎 COTE CIBLE : x${result.targetMultiplier.toFixed(2)}
📊 CONFIANCE : ${result.confidence.toFixed(1)}%
----------------------------------------
⚠️ Gestion de bankroll stricte conseillée.`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-black border border-[#E50914] flex items-center justify-center text-xl shadow-[0_0_12px_rgba(229,9,20,0.35)]">
            🗓️
          </div>
          <div>
            <h1 className="text-xl font-black tracking-wide text-white flex items-center gap-2">
              PRÉDICTION
              <span className="text-[9px] px-2 py-0.5 rounded bg-[#E50914] text-white font-mono font-bold tracking-widest uppercase">
                VIP
              </span>
            </h1>
            <p className="text-[11px] text-white/60 font-mono">
              Analyse Télémétrique Haute Altitude
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSetCurrentTime}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#1a1a1a] hover:bg-[#252525] border border-white/10 text-[11px] font-mono text-white/80 transition-colors"
          title="Prendre l'heure actuelle"
        >
          <RotateCcw className="w-3 h-3 text-[#E50914]" />
          <span>Heure Actuelle</span>
        </button>
      </div>

      {/* Input Form Card */}
      <div className="bg-[#121212] border border-[#E50914]/40 rounded-2xl p-5 shadow-lg space-y-4">
        <form onSubmit={handleAnalyze} className="space-y-4">
          {/* Dernière Heure */}
          <div>
            <label className="block text-xs font-semibold text-white/80 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#E50914]" />
                Dernière heure (HH:MM:SS)
              </span>
              <span className="text-[10px] text-white/50 font-mono">Format 24h</span>
            </label>
            <input
              type="text"
              value={inputTime}
              onChange={(e) => setInputTime(e.target.value)}
              placeholder="18:50:52"
              pattern="^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$"
              required
              className="w-full bg-black border border-white/20 focus:border-[#E50914] rounded-xl px-3.5 py-3 text-sm text-white font-mono tracking-wider outline-none transition-all"
            />
          </div>

          {/* Dernière Cote */}
          <div>
            <label className="block text-xs font-semibold text-white/80 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-[#E50914]" />
                Dernière cote observée (X0.00)
              </span>
              <span className="text-[10px] text-white/50 font-mono">Ex: 5.89</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#E50914] font-mono font-bold">
                X
              </span>
              <input
                type="number"
                step="0.01"
                min="1.00"
                max="999.99"
                value={inputMultiplier}
                onChange={(e) => setInputMultiplier(e.target.value)}
                placeholder="5.89"
                required
                className="w-full bg-black border border-white/20 focus:border-[#E50914] rounded-xl pl-8 pr-3.5 py-3 text-sm text-white font-mono tracking-wider outline-none transition-all"
              />
            </div>

            {/* Quick Multiplier Buttons */}
            <div className="flex items-center gap-1.5 mt-2">
              {[2.5, 5.89, 10.42, 18.0].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setInputMultiplier(val.toFixed(2))}
                  className="flex-1 py-1 text-[11px] font-mono bg-black/60 hover:bg-[#1f1f1f] border border-white/10 rounded-lg text-white/70 hover:text-white transition-all"
                >
                  x{val.toFixed(2)}
                </button>
              ))}
            </div>
          </div>

          {/* Analyze Button */}
          <button
            type="submit"
            disabled={isAnalyzing}
            className="w-full py-4 px-4 bg-[#E50914] hover:bg-[#b8050f] active:scale-[0.98] text-white font-black tracking-wider rounded-xl text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(229,9,20,0.4)] disabled:opacity-60 cursor-pointer uppercase"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Analyse en cours...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 fill-white" />
                <span>ANALYSER LE PROCHAIN ENVOL</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Result Card */}
      {result && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-b from-[#180305] via-[#121212] to-black border-2 border-[#E50914] rounded-2xl p-5 shadow-[0_0_25px_rgba(229,9,20,0.25)] space-y-5"
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E50914] animate-pulse" />
              <span className="text-xs font-mono uppercase tracking-widest text-[#E50914] font-bold">
                SIGNAL CALCULÉ TOP GSS
              </span>
            </div>
            <button
              type="button"
              onClick={handleCopySignal}
              className="flex items-center gap-1 px-2.5 py-1 bg-black/60 hover:bg-black border border-[#E50914]/40 rounded-lg text-[11px] font-mono text-white/90 hover:text-white transition-all cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copié !</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[#E50914]" />
                  <span>Copier</span>
                </>
              )}
            </button>
          </div>

          {/* Three Key Metrics requested */}
          <div className="grid grid-cols-2 gap-3">
            {/* COTE CIBLE */}
            <div className="col-span-2 bg-black/70 border border-[#E50914]/50 rounded-xl p-4 text-center">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#E50914] font-bold">
                💎 COTE CIBLE
              </span>
              <p className="text-4xl font-mono font-black text-white tracking-tight my-1">
                X{result.targetMultiplier.toFixed(2)}
              </p>
              <span className="text-[10px] text-white/50 font-mono">
                Cashout suggéré sécurisé
              </span>
            </div>

            {/* HEURE CIBLE */}
            <div className="bg-black/60 border border-white/10 rounded-xl p-3 text-center">
              <span className="text-[10px] font-mono uppercase tracking-widest text-white/60 font-semibold">
                🎯 HEURE CIBLE
              </span>
              <p className="text-xl font-mono font-black text-[#ff5a64] mt-1">
                {result.targetTime}
              </p>
            </div>

            {/* POURCENTAGE */}
            <div className="bg-black/60 border border-white/10 rounded-xl p-3 text-center">
              <span className="text-[10px] font-mono uppercase tracking-widest text-white/60 font-semibold">
                📊 POURCENTAGE
              </span>
              <p className="text-xl font-mono font-black text-emerald-400 mt-1">
                {result.confidence.toFixed(0)}%
              </p>
            </div>
          </div>

          {/* Discretionary Disclaimer */}
          <div className="p-3 bg-black/60 rounded-xl border border-white/10 flex items-start gap-2.5 text-left">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-[11px] text-white/60 leading-relaxed font-sans">
              <strong>Avertissement responsable :</strong> Les prédictions sont générées par analyse télémétrique statistique et ne sont en aucun cas garanties à 100%. Gérez votre capital avec modération.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
};
