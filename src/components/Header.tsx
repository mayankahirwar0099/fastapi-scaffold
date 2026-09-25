import React from 'react';
import { Download, Terminal, Layers, HelpCircle, Check, Copy } from 'lucide-react';
import { GeneratedFile } from '../types/generator';
import { downloadProjectZip, copySingleFile } from '../utils/zipExport';

interface HeaderProps {
  projectName: string;
  files: GeneratedFile[];
  onOpenQuickStart: () => void;
  onOpenEndpoints: () => void;
}

export function Header({ projectName, files, onOpenQuickStart, onOpenEndpoints }: HeaderProps) {
  const [downloading, setDownloading] = React.useState(false);
  const [copiedAll, setCopiedAll] = React.useState(false);

  const handleDownloadZip = async () => {
    try {
      setDownloading(true);
      await downloadProjectZip(projectName, files);
    } finally {
      setTimeout(() => setDownloading(false), 500);
    }
  };

  const handleCopyAll = async () => {
    const combined = files
      .map(
        (f) => `### FILE: ${f.path}\n${'='.repeat(40)}\n${f.content}\n\n`
      )
      .join('\n');
    await copySingleFile(combined);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  return (
    <header className="flex items-center justify-between px-6 py-3.5 border-b border-slate-800/80 bg-[#090d16]/95 backdrop-blur sticky top-0 z-30">
      {/* Zone 1: Single text element wordmark */}
      <a href="/" className="flex items-center gap-2.5 text-base font-bold tracking-tight text-white hover:text-emerald-400 transition-colors">
        <span className="flex items-center justify-center w-7 h-7 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-xs">
          ⚡
        </span>
        <span>FastAPI Scaffolder</span>
      </a>

      {/* Zone 2: Clean single-line text navigation links */}
      <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-400">
        <button
          onClick={onOpenEndpoints}
          className="flex items-center gap-1.5 hover:text-slate-200 transition-colors whitespace-nowrap cursor-pointer"
        >
          <Layers className="w-3.5 h-3.5 text-slate-400" />
          <span>API Routes Matrix</span>
        </button>
        <button
          onClick={onOpenQuickStart}
          className="flex items-center gap-1.5 hover:text-slate-200 transition-colors whitespace-nowrap cursor-pointer"
        >
          <Terminal className="w-3.5 h-3.5 text-slate-400" />
          <span>Quick Start Commands</span>
        </button>
        <a
          href="https://fastapi.tiangolo.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-slate-200 transition-colors whitespace-nowrap"
        >
          FastAPI Docs ↗
        </a>
      </nav>

      {/* Zone 3: 1-2 primary actions */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={handleCopyAll}
          title="Copy entire project bundle text"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-md transition-colors whitespace-nowrap cursor-pointer"
        >
          {copiedAll ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Copied All</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-slate-400" />
              <span>Copy All</span>
            </>
          )}
        </button>

        <button
          onClick={handleDownloadZip}
          disabled={downloading}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 rounded-md shadow-sm transition-all whitespace-nowrap cursor-pointer disabled:opacity-60"
        >
          <Download className="w-3.5 h-3.5" />
          <span>{downloading ? 'Packing ZIP...' : 'Download .ZIP'}</span>
        </button>
      </div>
    </header>
  );
}
