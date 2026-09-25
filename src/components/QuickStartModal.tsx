import React, { useState } from 'react';
import { X, Terminal, Copy, Check } from 'lucide-react';
import { copySingleFile } from '../utils/zipExport';

interface QuickStartModalProps {
  isOpen: boolean;
  onClose: () => void;
  hasDocker: boolean;
}

export function QuickStartModal({ isOpen, onClose, hasDocker }: QuickStartModalProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const copyCommand = async (cmd: string, index: number) => {
    await copySingleFile(cmd);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1800);
  };

  const steps = [
    {
      title: '1. Create and Activate Virtual Environment',
      desc: 'Isolate dependencies using Python venv module',
      cmd: 'python -m venv .venv\nsource .venv/bin/activate  # On Windows: .venv\\Scripts\\activate',
    },
    {
      title: '2. Install Generated Dependencies',
      desc: 'Installs FastAPI, Pydantic V2, Uvicorn, and required plugins',
      cmd: 'pip install -r requirements.txt',
    },
    {
      title: '3. Boot Uvicorn Development Server',
      desc: 'Spins up server with hot-reload enabled on port 8000',
      cmd: 'uvicorn app.main:app --reload --host 0.0.0.0 --port 8000',
    },
  ];

  if (hasDocker) {
    steps.push({
      title: 'Alternative: Launch with Docker Compose',
      desc: 'Runs full stack containerized with health-check monitoring',
      cmd: 'docker compose up --build',
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-[#0e1424] border border-slate-800 rounded-xl w-full max-w-2xl flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Local Execution Playbook</h3>
              <p className="text-xs text-slate-400">Run your generated FastAPI backend in 3 minutes</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 overflow-y-auto max-h-[70vh]">
          {steps.map((step, idx) => (
            <div key={idx} className="bg-[#090d16] border border-slate-800/80 rounded-lg p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-slate-200">{step.title}</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">{step.desc}</p>
                </div>
                <button
                  onClick={() => copyCommand(step.cmd, idx)}
                  className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded transition-colors cursor-pointer"
                  title="Copy command"
                >
                  {copiedIndex === idx ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
              <pre className="font-mono text-xs bg-black/40 text-emerald-300 p-2.5 rounded border border-slate-800 overflow-x-auto select-all">
                {step.cmd}
              </pre>
            </div>
          ))}

          <div className="p-3 bg-emerald-950/20 border border-emerald-500/20 rounded-lg text-xs text-emerald-300">
            <span className="font-semibold block mb-0.5">Explore Swagger UI after booting:</span>
            Navigate to <code className="bg-emerald-950/60 px-1 py-0.5 rounded font-mono">http://localhost:8000/api/v1/docs</code> in your browser to interactively execute endpoints.
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[#090d16] border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 rounded-md hover:bg-slate-700 transition-colors cursor-pointer"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
