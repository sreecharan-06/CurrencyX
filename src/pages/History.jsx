import React, { useState, useEffect } from 'react';
import { History as HistoryIcon, Download, Trash2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import HistoryTable from '../components/HistoryTable';
import Toast from '../components/Toast';
import { getHistory, deleteHistoryItem, clearHistory } from '../utils/storage';

export const History = () => {
  const navigate = useNavigate();
  const [historyList, setHistoryList] = useState([]);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    setHistoryList(getHistory());
  }, []);

  const handleDeleteItem = (id) => {
    const updated = deleteHistoryItem(id);
    setHistoryList(updated);
    setToastMessage({ message: 'Conversion record deleted', type: 'info' });
  };

  const handleClearAll = () => {
    clearHistory();
    setHistoryList([]);
    setToastMessage({ message: 'All conversion history cleared', type: 'info' });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {toastMessage && (
        <Toast
          message={toastMessage.message}
          type={toastMessage.type}
          onClose={() => setToastMessage(null)}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Conversion History
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
              {historyList.length} Records
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Persisted locally in your browser storage with audit trail and CSV export.
          </p>
        </div>

        {historyList.length > 0 && (
          <button
            type="button"
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition-all self-start sm:self-auto"
          >
            New Conversion <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* History Table Component */}
      <HistoryTable
        history={historyList}
        onDelete={handleDeleteItem}
        onClear={handleClearAll}
        onCopySuccess={(msg) => setToastMessage({ message: msg, type: 'success' })}
      />
    </div>
  );
};

export default History;
