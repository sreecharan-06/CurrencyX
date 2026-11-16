import React from 'react';
import { Star, ArrowRight, BarChart2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getCurrencyFlagEmoji, getCurrencyFlagUrl, formatAmount } from '../utils/converter';

export const RateCard = ({
  baseCurrency = 'USD',
  quoteCurrency = 'EUR',
  quoteName = '',
  rate = 1,
  isFavorite = false,
  onToggleFavorite,
  precision = 4
}) => {
  const navigate = useNavigate();
  const flagEmoji = getCurrencyFlagEmoji(quoteCurrency);
  const flagUrl = getCurrencyFlagUrl(quoteCurrency);

  const numRate = parseFloat(rate);
  const inverse = numRate > 0 ? 1 / numRate : 0;

  const handleQuickConvert = () => {
    navigate(`/?from=${baseCurrency}&to=${quoteCurrency}`);
  };

  const handleViewAnalytics = () => {
    navigate(`/analytics?base=${baseCurrency}&quote=${quoteCurrency}`);
  };

  return (
    <div className="group p-5 rounded-2xl bg-white dark:bg-slate-900/60 hover:bg-slate-50 dark:hover:bg-slate-900/90 border border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700/80 transition-all duration-200 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 flex flex-col justify-between space-y-4">
      {/* Top Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
            {flagUrl ? (
              <img
                src={flagUrl}
                alt={quoteCurrency}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
            ) : null}
            <span className={flagUrl ? 'hidden text-xl' : 'text-xl'}>{flagEmoji}</span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">
                {quoteCurrency}
              </span>
              <span className="text-[11px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800/90 text-slate-600 dark:text-slate-400 font-mono">
                /{baseCurrency}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 max-w-[150px]">
              {quoteName || quoteCurrency}
            </p>
          </div>
        </div>

        {onToggleFavorite && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(quoteCurrency);
            }}
            className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-amber-500 transition-colors"
            title={isFavorite ? 'Remove favorite' : 'Add to favorites'}
          >
            <Star className={`w-4 h-4 ${isFavorite ? 'text-amber-400 fill-amber-400' : ''}`} />
          </button>
        )}
      </div>

      {/* Middle Rate Body */}
      <div className="space-y-1">
        <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono tracking-tight">
          {formatAmount(numRate, precision)}
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
          1 {quoteCurrency} = {formatAmount(inverse, precision)} {baseCurrency}
        </div>
      </div>

      {/* Bottom Action Footer */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs">
        <button
          type="button"
          onClick={handleQuickConvert}
          className="inline-flex items-center gap-1.5 font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors"
        >
          Convert <ArrowRight className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={handleViewAnalytics}
          className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
          title="View Chart & Historical Trend"
        >
          <BarChart2 className="w-3.5 h-3.5" /> Chart
        </button>
      </div>
    </div>
  );
};

export default RateCard;
