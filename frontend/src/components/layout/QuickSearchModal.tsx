'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Code2, Database, Workflow, Terminal, Box, ArrowRight } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { MOCK_ENDPOINTS, MOCK_TABLES } from '../../lib/mockData';

export interface QuickSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickSearchModal: React.FC<QuickSearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Open signal
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const filteredEndpoints = MOCK_ENDPOINTS.filter(
    (ep) =>
      ep.name.toLowerCase().includes(query.toLowerCase()) ||
      ep.path.toLowerCase().includes(query.toLowerCase())
  );

  const filteredTables = MOCK_TABLES.filter((t) =>
    t.name.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelectRoute = (path: string) => {
    router.push(path);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="xl">
      <div className="space-y-4">
        {/* Input header */}
        <div className="relative flex items-center">
          <Search className="absolute left-3.5 w-5 h-5 text-cyan-400" />
          <input
            type="text"
            placeholder="Search API endpoints, database schemas, system modules..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl pl-11 pr-4 py-3 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
            autoFocus
          />
        </div>

        {/* Quick Navigation Shortcuts */}
        <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
          {/* Section: Quick Jump */}
          <div>
            <div className="px-2 py-1 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              Quick Navigation
            </div>
            <div className="grid grid-cols-2 gap-2 mt-1">
              <button
                onClick={() => handleSelectRoute('/api-builder')}
                className="flex items-center gap-2.5 p-2.5 bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/80 rounded-lg text-xs text-slate-200 transition-colors text-left"
              >
                <Workflow className="w-4 h-4 text-cyan-400" />
                <span>API Builder</span>
              </button>
              <button
                onClick={() => handleSelectRoute('/schema')}
                className="flex items-center gap-2.5 p-2.5 bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/80 rounded-lg text-xs text-slate-200 transition-colors text-left"
              >
                <Database className="w-4 h-4 text-purple-400" />
                <span>Schema Studio</span>
              </button>
              <button
                onClick={() => handleSelectRoute('/3d-twin')}
                className="flex items-center gap-2.5 p-2.5 bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/80 rounded-lg text-xs text-slate-200 transition-colors text-left"
              >
                <Box className="w-4 h-4 text-indigo-400" />
                <span>3D Architecture Twin</span>
              </button>
              <button
                onClick={() => handleSelectRoute('/test-console')}
                className="flex items-center gap-2.5 p-2.5 bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/80 rounded-lg text-xs text-slate-200 transition-colors text-left"
              >
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span>Test Console</span>
              </button>
            </div>
          </div>

          {/* Section: API Endpoints */}
          <div>
            <div className="px-2 py-1 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              API Endpoints ({filteredEndpoints.length})
            </div>
            <div className="space-y-1 mt-1">
              {filteredEndpoints.map((ep) => (
                <button
                  key={ep.id}
                  onClick={() => handleSelectRoute('/api-builder')}
                  className="w-full flex items-center justify-between p-2.5 bg-slate-950/40 hover:bg-slate-800/60 border border-slate-800/60 rounded-lg text-xs transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300">
                      {ep.method}
                    </span>
                    <span className="font-mono text-slate-300">{ep.path}</span>
                    <span className="text-slate-500 hidden sm:inline">• {ep.name}</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
                </button>
              ))}
            </div>
          </div>

          {/* Section: DB Tables */}
          <div>
            <div className="px-2 py-1 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              Database Tables ({filteredTables.length})
            </div>
            <div className="space-y-1 mt-1">
              {filteredTables.map((t) => (
                <button
                  key={t.name}
                  onClick={() => handleSelectRoute('/schema')}
                  className="w-full flex items-center justify-between p-2.5 bg-slate-950/40 hover:bg-slate-800/60 border border-slate-800/60 rounded-lg text-xs transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <Database className="w-3.5 h-3.5 text-purple-400" />
                    <span className="font-mono text-slate-200">{t.name}</span>
                    <span className="text-slate-500 text-[11px]">{t.recordsCount.toLocaleString()} records</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
          <span>Tip: Navigate with arrow keys, press ESC to close</span>
          <span className="font-mono">BackendFlow AI v1.0</span>
        </div>
      </div>
    </Modal>
  );
};
