import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FileUp, Share2, Info, Database, List, Code, Download, ExternalLink, ShieldAlert, ShieldCheck, AlertCircle } from 'lucide-react';
import { FileUpload } from './components/FileUpload';
import { SummaryHeader } from './components/SummaryHeader';
import { ComponentTable } from './components/ComponentTable';
import { DependencyGraph } from './components/DependencyGraph';
import { ComponentDetailPanel } from './components/ComponentDetailPanel';
import { LicenseView } from './components/LicenseView';
import { VulnerabilityView } from './components/VulnerabilityView';
import type { NormalizedSBOM, SBOMComponent } from './models/sbom';
import { cn } from './utils/cn';

type ViewMode = 'summary' | 'components' | 'graph' | 'licenses' | 'vulnerabilities' | 'raw';

function App() {
  const [sbom, setSbom] = useState<NormalizedSBOM | null>(null);
  const [rawContent, setRawContent] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<{ message: string; line?: number } | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('summary');
  const [selectedComponent, setSelectedComponent] = useState<SBOMComponent | null>(null);

  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    workerRef.current = new Worker(new URL('./workers/sbom.worker.ts', import.meta.url), { type: 'module' });
    workerRef.current.onmessage = (e) => {
      setIsLoading(false);
      if (e.data.type === 'success') {
        setSbom(e.data.data);
        setViewMode('summary');
      } else {
        setError({ message: e.data.message, line: e.data.line });
      }
    };
    return () => workerRef.current?.terminate();
  }, []);

  const handleFileSelect = useCallback((file: File) => {
    setIsLoading(true);
    setError(null);
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setRawContent(content);
      workerRef.current?.postMessage({ content, fileName: file.name });
    };
    reader.readAsText(file);
  }, []);

  const loadSample = async (name: string) => {
      setIsLoading(true);
      setError(null);
      setFileName(name);
      try {
          const response = await fetch(`./samples/${name}`);
          const content = await response.text();
          setRawContent(content);
          workerRef.current?.postMessage({ content, fileName: name });
      } catch (err) {
          setError({ message: 'Failed to load sample file.' });
          setIsLoading(false);
      }
  };

  const exportJSON = () => {
      if (!sbom) return;
      const blob = new Blob([JSON.stringify(sbom, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fileName.split('.')[0]}_normalized.json`;
      a.click();
  };

  const exportCSV = () => {
      if (!sbom) return;
      const headers = ['Name', 'Version', 'Type', 'PURL', 'Supplier'];
      const rows = sbom.components.map(c => [
          c.name,
          c.version || '',
          c.type,
          c.purl || '',
          c.supplier || ''
      ]);
      const csvContent = [headers, ...rows].map(e => e.map(v => `"${v}"`).join(",")).join("\n");
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fileName.split('.')[0]}_components.csv`;
      a.click();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      <nav className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-1.5 rounded-lg shadow-sm shadow-blue-200">
            <Database className="text-white w-5 h-5" />
          </div>
          <h1 className="text-lg font-black tracking-tight text-slate-800">
            SBOM<span className="text-blue-600">Scope</span>
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <a href="https://github.com/jules" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-slate-600 transition-colors">
            <GithubIcon />
          </a>
        </div>
      </nav>

      <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
        {!sbom ? (
          <div className="max-w-2xl mx-auto space-y-8 mt-12">
            <div className="text-center space-y-4">
                <h2 className="text-4xl font-black text-slate-900 tracking-tight">Visualize your SBOMs instantly.</h2>
                <p className="text-slate-500 text-lg">Secure, fast, and entirely client-side. No data ever leaves your browser.</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-bold">Parsing Error</p>
                  <p className="text-sm">{error.message}</p>
                </div>
              </div>
            )}

            <FileUpload onFileSelect={handleFileSelect} isLoading={isLoading} />

            <div className="flex flex-col items-center gap-4">
                <p className="text-sm font-semibold text-slate-400 uppercase tracking-widest">Or try a sample</p>
                <div className="flex flex-wrap justify-center gap-3">
                    <SampleButton onClick={() => loadSample('cyclonedx-1.5.json')} label="CycloneDX 1.5 JSON" />
                    <SampleButton onClick={() => loadSample('spdx-2.3.json')} label="SPDX 2.3 JSON" />
                    <SampleButton onClick={() => loadSample('spdx-3.0.json')} label="SPDX 3.0 (Beta)" />
                </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setSbom(null)}
                        className="p-2 hover:bg-slate-200 rounded-lg text-slate-500 transition-colors"
                        title="Upload new file"
                    >
                        <FileUp size={20} />
                    </button>
                    <h2 className="text-xl font-bold truncate max-w-md">{fileName}</h2>
                </div>
                <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200 shadow-sm overflow-x-auto no-scrollbar">
                    <TabButton active={viewMode === 'summary'} onClick={() => setViewMode('summary')} icon={<Info size={16} />} label="Summary" />
                    <TabButton active={viewMode === 'components'} onClick={() => setViewMode('components')} icon={<List size={16} />} label="Components" />
                    <TabButton active={viewMode === 'graph'} onClick={() => setViewMode('graph')} icon={<Share2 size={16} />} label="Graph" />
                    <TabButton active={viewMode === 'licenses'} onClick={() => setViewMode('licenses')} icon={<ShieldCheck size={16} />} label="Licenses" />
                    <TabButton active={viewMode === 'vulnerabilities'} onClick={() => setViewMode('vulnerabilities')} icon={<ShieldAlert size={16} />} label="Vulnerabilities" />
                    <TabButton active={viewMode === 'raw'} onClick={() => setViewMode('raw')} icon={<Code size={16} />} label="Raw Source" />
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={exportCSV} className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-700 shadow-sm transition-all">
                        <Download size={14} /> CSV
                    </button>
                    <button onClick={exportJSON} className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-700 shadow-sm transition-all">
                        <Download size={14} /> JSON
                    </button>
                </div>
            </div>

            <div className="min-h-[600px]">
                {viewMode === 'summary' && <SummaryHeader metadata={sbom.metadata} />}
                {viewMode === 'components' && <ComponentTable components={sbom.components} onSelectComponent={setSelectedComponent} />}
                {viewMode === 'graph' && <DependencyGraph components={sbom.components} relationships={sbom.relationships} />}
                {viewMode === 'licenses' && <LicenseView components={sbom.components} />}
                {viewMode === 'vulnerabilities' && <VulnerabilityView vulnerabilities={sbom.vulnerabilities} components={sbom.components} />}
                {viewMode === 'raw' && (
                    <div className="bg-slate-900 rounded-lg overflow-hidden shadow-xl border border-slate-800">
                        <div className="bg-slate-800 px-4 py-2 flex items-center justify-between">
                            <span className="text-xs font-mono text-slate-400">{fileName}</span>
                        </div>
                        <pre className="p-6 text-xs font-mono text-slate-300 overflow-auto max-h-[70vh]">
                            {rawContent}
                        </pre>
                    </div>
                )}
            </div>
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-8 px-6 mt-12">
          <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-slate-400 text-sm">© 2024 SBOMScope — Open Source SBOM Visualizer</p>
              <div className="flex items-center gap-6">
                  <a href="#" className="text-xs font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest">Privacy</a>
                  <a href="#" className="text-xs font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest">Docs</a>
                  <a href="#" className="text-xs font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest flex items-center gap-1">
                      GitHub <ExternalLink size={12} />
                  </a>
              </div>
          </div>
      </footer>

      <ComponentDetailPanel
        component={selectedComponent}
        onClose={() => setSelectedComponent(null)}
      />
    </div>
  );
}

const GithubIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
);

const SampleButton: React.FC<{ onClick: () => void; label: string }> = ({ onClick, label }) => (
    <button
        onClick={onClick}
        className="px-4 py-2 bg-white border border-slate-200 rounded-full text-sm font-medium text-slate-600 hover:border-blue-400 hover:text-blue-600 transition-all shadow-sm"
    >
        {label}
    </button>
);

const TabButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
    <button
        onClick={onClick}
        className={cn(
            "flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition-all whitespace-nowrap",
            active ? "bg-blue-600 text-white shadow-md shadow-blue-200" : "text-slate-500 hover:bg-slate-100"
        )}
    >
        {icon}
        <span>{label}</span>
    </button>
);

export default App;
