import React, { useState } from 'react';
import {
  Copy,
  Check,
  Download,
  Search,
  FileCode,
  FileText,
  Terminal,
  File,
  CheckCircle,
  Eye,
  WrapText,
} from 'lucide-react';
import { GeneratedFile } from '../types/generator';
import { HighlightedCode } from '../utils/syntaxHighlighter';
import { copySingleFile } from '../utils/zipExport';

interface CodeViewerProps {
  files: GeneratedFile[];
  activeFileIndex: number;
  onSelectFile: (index: number) => void;
}

export function CodeViewer({ files, activeFileIndex, onSelectFile }: CodeViewerProps) {
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [wordWrap, setWordWrap] = useState(false);

  const activeFile = files[activeFileIndex] || files[0];

  const handleCopy = async () => {
    if (!activeFile) return;
    await copySingleFile(activeFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSingle = () => {
    if (!activeFile) return;
    const blob = new Blob([activeFile.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = activeFile.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getFileIcon = (file: GeneratedFile) => {
    if (file.name.endsWith('.py')) {
      return <FileCode className="w-3.5 h-3.5 text-blue-400" />;
    }
    if (file.name.includes('Docker') || file.name.includes('compose')) {
      return <Terminal className="w-3.5 h-3.5 text-teal-400" />;
    }
    if (file.name.endsWith('.md')) {
      return <FileText className="w-3.5 h-3.5 text-amber-400" />;
    }
    return <File className="w-3.5 h-3.5 text-slate-400" />;
  };

  const lineCount = activeFile ? activeFile.content.split('\n').length : 0;
  const fileSizeKb = activeFile ? (new Blob([activeFile.content]).size / 1024).toFixed(1) : '0';

  return (
    <div className="flex flex-col h-full bg-[#070b13] overflow-hidden">
      {/* File Tabs Bar */}
      <div className="flex items-center justify-between border-b border-slate-800/80 bg-[#090d16] px-2 pt-2 shrink-0">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none pb-2 flex-1 mr-2">
          {files.map((file, idx) => {
            const isActive = idx === activeFileIndex;
            return (
              <button
                key={file.path}
                type="button"
                onClick={() => {
                  onSelectFile(idx);
                  setSearchQuery('');
                }}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-mono rounded-t-md transition-all whitespace-nowrap cursor-pointer select-none border-t-2 ${
                  isActive
                    ? 'bg-[#0e1526] text-white border-emerald-400 font-semibold shadow-sm'
                    : 'bg-transparent text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                {getFileIcon(file)}
                <span>{file.name}</span>
                {file.badge && (
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded font-sans uppercase tracking-tight ${
                      isActive
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {file.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Code Editor Header Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#0b101c] border-b border-slate-800/80 text-xs shrink-0">
        {/* Left: Path & Meta */}
        <div className="flex items-center gap-3 text-slate-400 min-w-0">
          <span className="font-mono text-slate-200 text-xs truncate">
            {activeFile?.path}
          </span>
          <span className="text-slate-600 hidden sm:inline" aria-hidden="true">
            ·
          </span>
          <span className="text-[11px] text-slate-400 hidden sm:inline tabular-nums">
            {lineCount} lines
          </span>
          <span className="text-slate-600 hidden md:inline" aria-hidden="true">
            ·
          </span>
          <span className="text-[11px] text-slate-400 hidden md:inline tabular-nums">
            {fileSizeKb} KB
          </span>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5">
          {showSearch ? (
            <div className="flex items-center bg-[#070b13] border border-slate-700 rounded px-2 py-0.5 mr-1">
              <Search className="w-3 h-3 text-slate-500 mr-1.5 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Find in file..."
                autoFocus
                className="w-28 text-xs bg-transparent text-slate-200 focus:outline-none placeholder-slate-600"
              />
              <button
                onClick={() => {
                  setShowSearch(false);
                  setSearchQuery('');
                }}
                className="text-slate-500 hover:text-slate-300 text-xs ml-1 cursor-pointer"
              >
                ✕
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowSearch(true)}
              title="Search code"
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={handleDownloadSingle}
            title={`Download ${activeFile?.name}`}
            className="flex items-center gap-1 px-2.5 py-1 text-xs text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded border border-slate-700/60 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Save</span>
          </button>

          <button
            onClick={handleCopy}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded transition-all cursor-pointer ${
              copied
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Code</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code Content Area */}
      <div className="flex-1 overflow-auto bg-[#070b13]">
        {activeFile && (
          <HighlightedCode
            code={activeFile.content}
            language={activeFile.language}
            searchQuery={searchQuery}
          />
        )}
      </div>

      {/* Description Status Bar */}
      <div className="px-4 py-1.5 bg-[#090d16] border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 shrink-0">
        <span className="truncate mr-4">{activeFile?.description}</span>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-slate-500">FastAPI 0.111+ & Pydantic V2</span>
        </div>
      </div>
    </div>
  );
}
