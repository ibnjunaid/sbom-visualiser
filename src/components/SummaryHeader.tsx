import React from 'react';
import type { SBOMMetadata } from '../models/sbom';
import { Calendar, FileText, Settings } from 'lucide-react';
import { formatTimestamp } from '../utils/cn';

interface SummaryHeaderProps {
  metadata: SBOMMetadata;
}

export const SummaryHeader: React.FC<SummaryHeaderProps> = ({ metadata }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm mb-6">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{metadata.name}</h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded uppercase tracking-wider">
              {metadata.format}
            </span>
            <span className="text-slate-500 text-sm">Version {metadata.specVersion}</span>
          </div>
        </div>
        <div className="flex gap-8">
            <div className="text-center">
                <p className="text-xs text-slate-400 uppercase font-semibold">Components</p>
                <p className="text-2xl font-bold text-slate-800">{metadata.componentCount}</p>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-8 border-t border-slate-100 pt-6">
        <div className="flex items-center gap-3">
          <Settings className="w-5 h-5 text-slate-400" />
          <div>
            <p className="text-xs text-slate-500">Creation Tool</p>
            <p className="text-sm font-medium text-slate-700 truncate max-w-[200px]" title={metadata.tool}>
                {metadata.tool || 'Unknown'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-slate-400" />
          <div>
            <p className="text-xs text-slate-500">Created At</p>
            <p className="text-sm font-medium text-slate-700">{formatTimestamp(metadata.timestamp)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-slate-400" />
          <div>
            <p className="text-xs text-slate-500">Format</p>
            <p className="text-sm font-medium text-slate-700">{metadata.format} {metadata.specVersion}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
