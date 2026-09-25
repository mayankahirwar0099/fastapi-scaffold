/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { ProjectConfig, GeneratedFile } from './types/generator';
import { generateFastApiTemplate } from './utils/templateEngine';
import { Header } from './components/Header';
import { ConfigPanel } from './components/ConfigPanel';
import { CodeViewer } from './components/CodeViewer';
import { EndpointsModal } from './components/EndpointsModal';
import { QuickStartModal } from './components/QuickStartModal';
import { Code, Sliders } from 'lucide-react';

const DEFAULT_CONFIG: ProjectConfig = {
  projectName: 'TaskFlow API',
  description: 'A task management API with users, priorities, completion status, and to-dos',
  includeDatabase: true,
  databaseType: 'sqlite',
  includeAuth: true,
  includeDocker: true,
  includePytest: true,
  includeCors: true,
  includeAsyncHandlers: true,
  pythonVersion: '3.11',
};

export default function App() {
  const [config, setConfig] = useState<ProjectConfig>(DEFAULT_CONFIG);
  const [activeFileIndex, setActiveFileIndex] = useState<number>(0);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [mobileTab, setMobileTab] = useState<'config' | 'code'>('code');

  // Modals state
  const [showEndpointsModal, setShowEndpointsModal] = useState<boolean>(false);
  const [showQuickStartModal, setShowQuickStartModal] = useState<boolean>(false);

  // Generate files based on current configuration
  const files: GeneratedFile[] = useMemo(() => {
    return generateFastApiTemplate(config);
  }, [config]);

  // Adjust active tab if file index falls out of bounds
  useEffect(() => {
    if (activeFileIndex >= files.length) {
      setActiveFileIndex(0);
    }
  }, [files.length, activeFileIndex]);

  const handleConfigChange = (updated: Partial<ProjectConfig>) => {
    setConfig((prev) => ({
      ...prev,
      ...updated,
    }));
  };

  const handleGenerateClick = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      // On mobile switch view to code viewer
      setMobileTab('code');
    }, 350);
  };

  return (
    <div className="flex flex-col h-screen bg-[#070b13] text-slate-100 overflow-hidden font-sans">
      {/* Top Bar adhering to 3-zone contract */}
      <Header
        projectName={config.projectName || 'FastAPI Service'}
        files={files}
        onOpenEndpoints={() => setShowEndpointsModal(true)}
        onOpenQuickStart={() => setShowQuickStartModal(true)}
      />

      {/* Mobile Viewport Toggle */}
      <div className="flex lg:hidden items-center justify-center p-2 bg-[#090d16] border-b border-slate-800">
        <div className="inline-flex rounded-md p-1 bg-slate-900 border border-slate-800">
          <button
            onClick={() => setMobileTab('config')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded transition-colors cursor-pointer ${
              mobileTab === 'config'
                ? 'bg-emerald-500/20 text-emerald-300 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Configure</span>
          </button>
          <button
            onClick={() => setMobileTab('code')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded transition-colors cursor-pointer ${
              mobileTab === 'code'
                ? 'bg-emerald-500/20 text-emerald-300 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>Code Viewer ({files.length})</span>
          </button>
        </div>
      </div>

      {/* Main Workspace split */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left: Configuration Panel */}
        <section
          aria-label="Configuration Panel"
          className={`w-full lg:w-[380px] xl:w-[420px] shrink-0 h-full ${
            mobileTab === 'config' ? 'block' : 'hidden lg:block'
          }`}
        >
          <ConfigPanel
            config={config}
            onChange={handleConfigChange}
            onGenerate={handleGenerateClick}
            isGenerating={isGenerating}
          />
        </section>

        {/* Right: Code Viewer */}
        <section
          aria-label="Code Output Viewer"
          className={`flex-1 h-full min-w-0 ${
            mobileTab === 'code' ? 'block' : 'hidden lg:block'
          }`}
        >
          <CodeViewer
            files={files}
            activeFileIndex={activeFileIndex}
            onSelectFile={setActiveFileIndex}
          />
        </section>
      </main>

      {/* Modals */}
      <EndpointsModal
        isOpen={showEndpointsModal}
        onClose={() => setShowEndpointsModal(false)}
        config={config}
      />

      <QuickStartModal
        isOpen={showQuickStartModal}
        onClose={() => setShowQuickStartModal(false)}
        hasDocker={config.includeDocker}
      />
    </div>
  );
}
