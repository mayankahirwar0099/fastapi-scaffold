import React from 'react';
import {
  Sparkles,
  Database,
  ShieldCheck,
  Container,
  CheckCircle2,
  Sliders,
  RotateCcw,
  Zap,
} from 'lucide-react';
import { ProjectConfig } from '../types/generator';

interface ConfigPanelProps {
  config: ProjectConfig;
  onChange: (updated: Partial<ProjectConfig>) => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

const PRESET_IDEAS = [
  {
    label: 'Tasks & To-Dos',
    idea: 'A task management API with users, priorities, completion status, and to-dos',
  },
  {
    label: 'E-Commerce Store',
    idea: 'An e-commerce API with products, categories, SKU inventory, and customer orders',
  },
  {
    label: 'Blog & CMS',
    idea: 'A blog CMS backend with article drafts, slugs, publication tags, and author profiles',
  },
  {
    label: 'AI Agent Runs',
    idea: 'An AI agent runner backend tracking user prompts, model names, latency, and token metrics',
  },
  {
    label: 'IoT Telemetry',
    idea: 'An IoT telemetry ingestion API recording hardware device sensor readings and anomaly alerts',
  },
];

export function ConfigPanel({
  config,
  onChange,
  onGenerate,
  isGenerating,
}: ConfigPanelProps) {
  return (
    <div className="flex flex-col h-full bg-[#0d1322] border-r border-slate-800/80 p-5 space-y-6 overflow-y-auto">
      {/* Title & Brief */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-semibold tracking-wider text-emerald-400 uppercase">
            Configuration
          </span>
          <button
            onClick={() =>
              onChange({
                projectName: 'TaskFlow API',
                description: 'A task management API with users and to-dos',
                includeDatabase: true,
                databaseType: 'sqlite',
                includeAuth: true,
                includeDocker: true,
                includePytest: true,
                includeCors: true,
                pythonVersion: '3.11',
              })
            }
            className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
            title="Reset to default settings"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        </div>
        <h2 className="text-sm font-semibold text-white">Project Specification</h2>
        <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
          Describe what you want to build. We'll derive models, endpoints, schemas, and dependencies.
        </p>
      </div>

      {/* Idea Prompt Input */}
      <div className="space-y-2">
        <label
          htmlFor="project-idea"
          className="block text-xs font-medium text-slate-300"
        >
          Describe your project idea
        </label>
        <textarea
          id="project-idea"
          rows={3}
          value={config.description}
          onChange={(e) => onChange({ description: e.target.value })}
          placeholder="e.g. A task management API with users, priorities, and to-dos..."
          className="w-full text-xs font-mono bg-[#090d16] border border-slate-800 rounded-md p-3 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500/70 focus:ring-1 focus:ring-emerald-500/30 transition-all resize-none"
        />

        {/* Quick Presets */}
        <div className="pt-1">
          <span className="text-[11px] text-slate-500 block mb-1.5">Quick Presets:</span>
          <div className="flex flex-wrap gap-1.5">
            {PRESET_IDEAS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => onChange({ description: preset.idea })}
                className="text-[11px] px-2.5 py-1 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/50 transition-colors cursor-pointer"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Project Meta Options */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        <div>
          <label className="block text-[11px] font-medium text-slate-400 mb-1">
            Service Title
          </label>
          <input
            type="text"
            value={config.projectName}
            onChange={(e) => onChange({ projectName: e.target.value })}
            placeholder="MyFastApiApp"
            className="w-full text-xs bg-[#090d16] border border-slate-800 rounded-md px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-emerald-500/60 transition-colors"
          />
        </div>

        <div>
          <label className="block text-[11px] font-medium text-slate-400 mb-1">
            Python Runtime
          </label>
          <select
            value={config.pythonVersion}
            onChange={(e) => onChange({ pythonVersion: e.target.value as any })}
            className="w-full text-xs bg-[#090d16] border border-slate-800 rounded-md px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-emerald-500/60 transition-colors cursor-pointer"
          >
            <option value="3.12">Python 3.12 (Latest)</option>
            <option value="3.11">Python 3.11 (Standard)</option>
            <option value="3.10">Python 3.10 (LTS)</option>
          </select>
        </div>
      </div>

      {/* Feature Toggles */}
      <div className="space-y-2.5 pt-2">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
          Architecture Modules
        </span>

        {/* Database Toggle */}
        <div
          className={`p-3 rounded-lg border transition-all ${
            config.includeDatabase
              ? 'bg-slate-900/90 border-emerald-500/40'
              : 'bg-slate-900/30 border-slate-800/80 opacity-70'
          }`}
        >
          <label className="flex items-start justify-between cursor-pointer">
            <div className="flex items-start gap-2.5">
              <Database
                className={`w-4 h-4 mt-0.5 ${
                  config.includeDatabase ? 'text-emerald-400' : 'text-slate-500'
                }`}
              />
              <div>
                <span className="text-xs font-medium text-slate-200 block">
                  Include Database (SQLAlchemy)
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  Generates models.py, database.py, and session dependencies
                </span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={config.includeDatabase}
              onChange={(e) => onChange({ includeDatabase: e.target.checked })}
              className="mt-1 h-4 w-4 rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500/20 cursor-pointer accent-emerald-500"
            />
          </label>

          {/* Sub-selector: SQLite vs PostgreSQL */}
          {config.includeDatabase && (
            <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">Database Engine:</span>
              <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded border border-slate-800">
                <button
                  type="button"
                  onClick={() => onChange({ databaseType: 'sqlite' })}
                  className={`text-[11px] px-2 py-0.5 rounded transition-colors cursor-pointer ${
                    config.databaseType === 'sqlite'
                      ? 'bg-emerald-500/20 text-emerald-300 font-medium'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  SQLite (Zero-config)
                </button>
                <button
                  type="button"
                  onClick={() => onChange({ databaseType: 'postgresql' })}
                  className={`text-[11px] px-2 py-0.5 rounded transition-colors cursor-pointer ${
                    config.databaseType === 'postgresql'
                      ? 'bg-emerald-500/20 text-emerald-300 font-medium'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  PostgreSQL
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Authentication Toggle */}
        <div
          className={`p-3 rounded-lg border transition-all ${
            config.includeAuth
              ? 'bg-slate-900/90 border-emerald-500/40'
              : 'bg-slate-900/30 border-slate-800/80 opacity-70'
          }`}
        >
          <label className="flex items-start justify-between cursor-pointer">
            <div className="flex items-start gap-2.5">
              <ShieldCheck
                className={`w-4 h-4 mt-0.5 ${
                  config.includeAuth ? 'text-emerald-400' : 'text-slate-500'
                }`}
              />
              <div>
                <span className="text-xs font-medium text-slate-200 block">
                  Include Authentication (JWT)
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  OAuth2 password bearer, bcrypt hashing, /auth/login & /auth/register
                </span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={config.includeAuth}
              onChange={(e) => onChange({ includeAuth: e.target.checked })}
              className="mt-1 h-4 w-4 rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500/20 cursor-pointer accent-emerald-500"
            />
          </label>
        </div>

        {/* Dockerfile & Compose Toggle */}
        <div
          className={`p-3 rounded-lg border transition-all ${
            config.includeDocker
              ? 'bg-slate-900/90 border-emerald-500/40'
              : 'bg-slate-900/30 border-slate-800/80 opacity-70'
          }`}
        >
          <label className="flex items-start justify-between cursor-pointer">
            <div className="flex items-start gap-2.5">
              <Container
                className={`w-4 h-4 mt-0.5 ${
                  config.includeDocker ? 'text-emerald-400' : 'text-slate-500'
                }`}
              />
              <div>
                <span className="text-xs font-medium text-slate-200 block">
                  Include Dockerfile & Compose
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  Multi-stage production build + docker-compose with health checks
                </span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={config.includeDocker}
              onChange={(e) => onChange({ includeDocker: e.target.checked })}
              className="mt-1 h-4 w-4 rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500/20 cursor-pointer accent-emerald-500"
            />
          </label>
        </div>

        {/* Pytest Setup Toggle */}
        <div
          className={`p-3 rounded-lg border transition-all ${
            config.includePytest
              ? 'bg-slate-900/90 border-emerald-500/40'
              : 'bg-slate-900/30 border-slate-800/80 opacity-70'
          }`}
        >
          <label className="flex items-start justify-between cursor-pointer">
            <div className="flex items-start gap-2.5">
              <CheckCircle2
                className={`w-4 h-4 mt-0.5 ${
                  config.includePytest ? 'text-emerald-400' : 'text-slate-500'
                }`}
              />
              <div>
                <span className="text-xs font-medium text-slate-200 block">
                  Include Pytest Setup
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  test_main.py, TestClient fixtures, and CRUD test cases
                </span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={config.includePytest}
              onChange={(e) => onChange({ includePytest: e.target.checked })}
              className="mt-1 h-4 w-4 rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500/20 cursor-pointer accent-emerald-500"
            />
          </label>
        </div>

        {/* Additional: CORS middleware */}
        <div className="flex items-center justify-between px-2 pt-1 text-xs">
          <span className="text-slate-400">Enable CORS Middleware</span>
          <input
            type="checkbox"
            checked={config.includeCors}
            onChange={(e) => onChange({ includeCors: e.target.checked })}
            className="h-3.5 w-3.5 rounded border-slate-700 bg-slate-900 text-emerald-500 cursor-pointer accent-emerald-500"
          />
        </div>
      </div>

      {/* Prominent Action Button */}
      <div className="pt-2 mt-auto">
        <button
          type="button"
          onClick={onGenerate}
          disabled={isGenerating}
          className="group relative w-full py-3 px-4 rounded-lg font-semibold text-xs tracking-wide text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:from-emerald-700 active:to-teal-700 shadow-lg shadow-emerald-950/40 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 overflow-hidden"
        >
          {isGenerating ? (
            <>
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              <span>Synthesizing Boilerplate...</span>
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 text-emerald-200 group-hover:scale-110 transition-transform" />
              <span>Generate Template</span>
            </>
          )}
        </button>
        <p className="text-[11px] text-slate-500 text-center mt-2">
          Instant client-side generation · Zero latency
        </p>
      </div>
    </div>
  );
}
