import React from 'react';
import { X, Shield, Lock, Layers } from 'lucide-react';
import { ProjectConfig } from '../types/generator';
import { parseProjectIdea } from '../utils/entityParser';

interface EndpointsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ProjectConfig;
}

export function EndpointsModal({ isOpen, onClose, config }: EndpointsModalProps) {
  if (!isOpen) return null;

  const parsed = parseProjectIdea(config.description);
  const entities = parsed.entities;

  const endpoints = [
    {
      method: 'GET',
      path: '/health',
      tag: 'System',
      description: 'Liveness check & deployment metadata',
      requiresAuth: false,
    },
  ];

  if (config.includeAuth) {
    endpoints.push(
      {
        method: 'POST',
        path: '/api/v1/auth/register',
        tag: 'Auth',
        description: 'Register account with email & password',
        requiresAuth: false,
      },
      {
        method: 'POST',
        path: '/api/v1/auth/login',
        tag: 'Auth',
        description: 'OAuth2 form login, yields JWT Bearer token',
        requiresAuth: false,
      },
      {
        method: 'GET',
        path: '/api/v1/auth/me',
        tag: 'Auth',
        description: 'Fetch profile of current authenticated user',
        requiresAuth: true,
      }
    );
  }

  for (const entity of entities) {
    endpoints.push(
      {
        method: 'GET',
        path: `/api/v1/${entity.plural}`,
        tag: entity.name,
        description: `List paginated ${entity.plural} items with offset/limit`,
        requiresAuth: config.includeAuth,
      },
      {
        method: 'POST',
        path: `/api/v1/${entity.plural}`,
        tag: entity.name,
        description: `Create a new ${entity.name} entity`,
        requiresAuth: config.includeAuth,
      },
      {
        method: 'GET',
        path: `/api/v1/${entity.plural}/{id}`,
        tag: entity.name,
        description: `Get a single ${entity.name} by numeric ID`,
        requiresAuth: config.includeAuth,
      },
      {
        method: 'PUT',
        path: `/api/v1/${entity.plural}/{id}`,
        tag: entity.name,
        description: `Update existing ${entity.name} attributes`,
        requiresAuth: config.includeAuth,
      },
      {
        method: 'DELETE',
        path: `/api/v1/${entity.plural}/{id}`,
        tag: entity.name,
        description: `Delete ${entity.name} permanently (204 No Content)`,
        requiresAuth: config.includeAuth,
      }
    );
  }

  const getMethodBadgeClass = (method: string) => {
    switch (method) {
      case 'GET':
        return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
      case 'POST':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'PUT':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'DELETE':
        return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
      default:
        return 'bg-slate-700 text-slate-300 border-slate-600';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-[#0e1424] border border-slate-800 rounded-xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Generated API Routes Matrix</h3>
              <p className="text-xs text-slate-400">
                {endpoints.length} routes synthesized for {parsed.inferredProjectTitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Table View */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="border border-slate-800 rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#090d16] text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-4 font-medium w-20">Method</th>
                  <th className="py-2.5 px-4 font-medium">Path</th>
                  <th className="py-2.5 px-4 font-medium">Description</th>
                  <th className="py-2.5 px-4 font-medium text-right">Auth</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {endpoints.map((ep, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-2.5 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 text-[11px] font-bold rounded border ${getMethodBadgeClass(
                          ep.method
                        )}`}
                      >
                        {ep.method}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-slate-200">{ep.path}</td>
                    <td className="py-2.5 px-4 text-slate-400 font-sans">{ep.description}</td>
                    <td className="py-2.5 px-4 text-right">
                      {ep.requiresAuth ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-amber-400 font-sans">
                          <Lock className="w-3 h-3" />
                          <span>JWT</span>
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-500 font-sans">Public</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[#090d16] border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 rounded-md hover:bg-slate-700 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
