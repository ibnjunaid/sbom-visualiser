import React from 'react';
import type { SBOMComponent } from '../models/sbom';
import { X, ExternalLink, Shield, Globe, FileText, Info as InfoIcon } from 'lucide-react';
import { cn } from '../utils/cn';

interface ComponentDetailPanelProps {
  component: SBOMComponent | null;
  onClose: () => void;
}

export const ComponentDetailPanel: React.FC<ComponentDetailPanelProps> = ({ component, onClose }) => {
  if (!component) return null;

  const allLicenses = [...(component.licenses.declared || []), ...(component.licenses.concluded || [])];

  return (
    <div className={cn(
        "fixed inset-y-0 right-0 w-full max-w-lg bg-white shadow-2xl z-50 flex flex-col transition-transform border-l border-slate-200",
        component ? "translate-x-0" : "translate-x-full"
    )}>
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
        <h3 className="font-bold text-slate-800 truncate pr-4">{component.name}</h3>
        <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
          <X size={20} className="text-slate-500" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded uppercase tracking-wider">
                {component.type}
                </span>
                <span className="text-slate-500 text-sm font-medium">Version {component.version || 'Unknown'}</span>
            </div>
            {component.purl && (
                <div className="bg-slate-50 p-2 rounded text-[11px] font-mono text-slate-600 break-all border border-slate-100">
                    {component.purl}
                </div>
            )}
        </div>

        <Section title="General Information" icon={<InfoIcon size={16} />}>
            <DetailItem label="Supplier" value={component.supplier} />
            <DetailItem label="Author" value={component.author} />
            <DetailItem label="Publisher" value={component.publisher} />
            <DetailItem label="Description" value={component.description} isMultiline />
            <DetailItem label="Copyright" value={component.copyright} />
        </Section>

        <Section title="Licensing" icon={<Shield size={16} />}>
            <div className="space-y-3">
                {allLicenses.length > 0 ? allLicenses.map((l, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-blue-50 border border-blue-100 rounded">
                        <span className="text-sm font-medium text-blue-800">{l.id || l.name || l.expression}</span>
                        {l.url && (
                            <a href={l.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700">
                                <ExternalLink size={14} />
                            </a>
                        )}
                    </div>
                )) : (
                    <p className="text-sm text-amber-600 bg-amber-50 p-2 rounded border border-amber-100 italic">No license information found.</p>
                )}
            </div>
        </Section>

        <Section title="External References" icon={<Globe size={16} />}>
            <div className="space-y-2">
                {component.externalRefs.length > 0 ? component.externalRefs.map((ref, i) => (
                    <a
                        key={i}
                        href={ref.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col p-2 border border-slate-100 rounded hover:bg-slate-50 transition-colors group"
                    >
                        <span className="text-[10px] uppercase font-bold text-slate-400 group-hover:text-blue-500">{ref.type}</span>
                        <span className="text-xs text-blue-600 truncate">{ref.url}</span>
                        {ref.comment && <span className="text-[10px] text-slate-400 mt-1 italic">{ref.comment}</span>}
                    </a>
                )) : (
                    <p className="text-sm text-slate-400 italic">No external references.</p>
                )}
            </div>
        </Section>

        <Section title="Raw Data" icon={<FileText size={16} />}>
            <pre className="text-[10px] bg-slate-900 text-slate-300 p-4 rounded overflow-x-auto font-mono">
                {JSON.stringify(component.raw, null, 2)}
            </pre>
        </Section>
      </div>
    </div>
  );
};

const Section: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
    <div className="mb-8">
        <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-2">
            <span className="text-slate-400">{icon}</span>
            <h4 className="text-sm font-bold text-slate-700 uppercase tracking-tight">{title}</h4>
        </div>
        {children}
    </div>
);

const DetailItem: React.FC<{ label: string; value?: string; isMultiline?: boolean }> = ({ label, value, isMultiline }) => {
    if (!value) return null;
    return (
        <div className="mb-3">
            <p className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">{label}</p>
            <p className={cn("text-sm text-slate-700", isMultiline ? "whitespace-pre-wrap" : "truncate")}>{value}</p>
        </div>
    );
};
