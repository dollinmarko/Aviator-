import React, { useState } from 'react';
import { AnalysisResult, ToastMessage } from '../types.ts';
import { useTranslation } from '../i18n/LanguageContext.tsx';
import {
  Download,
  Trash2,
  CheckCircle2,
  Clock,
  XCircle,
  HelpCircle,
  Search,
  Check
} from 'lucide-react';

interface HistoryViewProps {
  history: AnalysisResult[];
  onClearHistory: () => void;
  onUpdateStatus: (id: string, status: AnalysisResult['status']) => void;
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  history,
  onClearHistory,
  onUpdateStatus,
  addToast,
}) => {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<'all' | 'success'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredHistory = history.filter((item) => {
    if (filter === 'success' && item.status !== 'success') return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.targetTime.toLowerCase().includes(q) ||
        item.inputTime.toLowerCase().includes(q) ||
        item.confidenceScore.toString().includes(q)
      );
    }
    return true;
  });

  const exportCsv = () => {
    if (history.length === 0) return;

    const headers = [
      'ID',
      'Input Time',
      'Input Multiplier',
      'Target Time',
      'Target Min Odds',
      'Target Max Odds',
      'Confidence',
      'Cashout',
      'Status',
    ];

    const rows = history.map((item) => [
      item.id,
      item.inputTime,
      item.inputMultiplier,
      item.targetTime,
      item.targetMultiplierMin,
      item.targetMultiplierMax,
      `${item.confidenceScore}%`,
      item.recommendedCashout,
      item.status,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `aviator_signals_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast({
      type: 'info',
      message: 'Export CSV réussi.',
    });
  };

  const getStatusBadge = (status: AnalysisResult['status']) => {
    switch (status) {
      case 'success':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-950/40 text-emerald-400 border border-emerald-900/60 text-[10px] uppercase font-mono tracking-wider">
            <CheckCircle2 className="w-3 h-3" />
            <span>{t('history.statusSuccess')}</span>
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-rose-950/40 text-rose-400 border border-rose-900/60 text-[10px] uppercase font-mono tracking-wider">
            <XCircle className="w-3 h-3" />
            <span>{t('history.statusFailed')}</span>
          </span>
        );
      case 'missed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#1a1a1a] text-[#e2e2d5]/60 border border-[#3a3a3a] text-[10px] uppercase font-mono tracking-wider">
            <HelpCircle className="w-3 h-3" />
            <span>{t('history.statusMissed')}</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-950/40 text-amber-400 border border-amber-900/60 text-[10px] uppercase font-mono tracking-wider">
            <Clock className="w-3 h-3" />
            <span>{t('history.statusPending')}</span>
          </span>
        );
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-8 text-white">
      {/* Editorial Header bar with Glass & Gold borders */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-8 aviator-glass-card rounded-2xl">
        <div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#D4AF37] font-bold font-mono">
            Archive Télémétrique
          </span>
          <h1 className="text-3xl sm:text-4xl font-mono font-black text-white tracking-tight mt-1">
            {t('history.title')}
          </h1>
          <p className="text-xs text-white/70 mt-1 font-sans">{t('history.subtitle')}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {history.length > 0 && (
            <>
              <button
                type="button"
                id="btn-export-csv"
                onClick={exportCsv}
                className="flex items-center gap-2 px-4 py-2 border border-[#D4AF37]/50 rounded-full text-xs font-bold tracking-widest uppercase hover:bg-[#D4AF37]/20 hover:border-[#D4AF37] text-white transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>{t('history.exportCsv')}</span>
              </button>

              <button
                type="button"
                id="btn-clear-history"
                onClick={onClearHistory}
                className="flex items-center gap-2 px-4 py-2 border border-[#E30613]/50 rounded-full text-xs font-bold tracking-widest uppercase text-[#ff5260] hover:bg-[#E30613] hover:text-white transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{t('history.clearAll')}</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-full text-xs uppercase tracking-widest font-bold transition-all cursor-pointer ${
              filter === 'all'
                ? 'bg-[#E30613] text-white shadow-[0_0_15px_rgba(227,6,19,0.4)]'
                : 'border border-[#D4AF37]/40 bg-black/40 text-white/70 hover:text-white hover:border-[#D4AF37]'
            }`}
          >
            {t('history.filterAll')} ({history.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('success')}
            className={`px-4 py-2 rounded-full text-xs uppercase tracking-widest font-bold transition-all cursor-pointer ${
              filter === 'success'
                ? 'bg-[#E30613] text-white shadow-[0_0_15px_rgba(227,6,19,0.4)]'
                : 'border border-[#D4AF37]/40 bg-black/40 text-white/70 hover:text-white hover:border-[#D4AF37]'
            }`}
          >
            {t('history.filterSuccess')}
          </button>
        </div>

        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('common.search')}
            className="w-full sm:w-64 px-4 py-2 pl-9 bg-black/40 border-b-2 border-[#D4AF37]/50 text-xs font-mono text-white placeholder-white/40 focus:outline-none focus:border-[#D4AF37] transition-colors"
          />
          <Search className="w-3.5 h-3.5 text-[#D4AF37] absolute left-2 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Records Table / List with Aviator Glass */}
      {filteredHistory.length === 0 ? (
        <div className="p-16 text-center aviator-glass-card rounded-2xl space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-[#D4AF37] font-mono font-bold">
            {t('history.empty')}
          </p>
        </div>
      ) : (
        <div className="aviator-glass-card rounded-2xl overflow-hidden border border-[#D4AF37]/35">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-white">
              <thead className="bg-black/60 border-b border-[#D4AF37]/30 text-[10px] uppercase text-[#D4AF37] font-mono tracking-[0.2em]">
                <tr>
                  <th className="px-6 py-4">{t('history.colTime')}</th>
                  <th className="px-6 py-4">{t('history.colInput')}</th>
                  <th className="px-6 py-4">{t('history.colTarget')}</th>
                  <th className="px-6 py-4">{t('history.colTargetOdds')}</th>
                  <th className="px-6 py-4">{t('history.colConfidence')}</th>
                  <th className="px-6 py-4">{t('history.colCashout')}</th>
                  <th className="px-6 py-4">{t('history.colStatus')}</th>
                  <th className="px-6 py-4 text-right">{t('common.action')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-mono font-medium text-white">
                      {item.inputTime}
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-base text-white">
                      {item.inputMultiplier.toFixed(2)}x
                    </td>
                    <td className="px-6 py-4 font-mono text-base text-[#D4AF37]">
                      {item.targetTime}
                    </td>
                    <td className="px-6 py-4 font-mono text-white/80">
                      {item.targetMultiplierMin.toFixed(2)}x - {item.targetMultiplierMax.toFixed(2)}x
                    </td>
                    <td className="px-6 py-4 font-mono text-base text-emerald-400 font-bold">
                      {item.confidenceScore}%
                    </td>
                    <td className="px-6 py-4 font-mono text-base text-white font-black">
                      <div className="flex items-center gap-1.5">
                        <span>{item.recommendedCashout.toFixed(2)}x</span>
                        {(item.isRoseSignal || item.recommendedCashout >= 10) && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#FF2A85]/20 text-[#ff80be] border border-[#FF2A85]/40 font-mono font-bold">
                            🌸
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(item.status)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => onUpdateStatus(item.id, 'success')}
                          title="Marquer Gagné"
                          className="p-1.5 border border-[#D4AF37]/40 hover:border-emerald-500 rounded text-emerald-400 hover:bg-emerald-950/40 transition-colors cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onUpdateStatus(item.id, 'failed')}
                          title="Marquer Perdu"
                          className="p-1.5 border border-[#D4AF37]/40 hover:border-rose-500 rounded text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
