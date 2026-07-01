import React from 'react';
import { Book, FileText, Share2, ShieldCheck, Database, Search, Download } from 'lucide-react';

export const DocsView: React.FC = () => {
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-8 max-w-4xl mx-auto space-y-12">
      <section>
        <h2 className="text-3xl font-black text-slate-900 mb-6 flex items-center gap-3">
          <Book className="text-blue-600" size={32} />
          Documentation
        </h2>
        <p className="text-slate-600 text-lg leading-relaxed">
          SBOMScope is a professional-grade, browser-based viewer for Software Bill of Materials.
          It allows you to visualize complex dependency trees, audit licenses, and inspect security data
          without ever uploading your sensitive data to a server.
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section className="space-y-4">
          <h3 className="font-bold text-slate-800 flex items-center gap-2 uppercase tracking-wider text-sm">
            <FileText size={18} className="text-blue-500" />
            Supported Formats
          </h3>
          <ul className="space-y-2 text-sm text-slate-600">
            <li className="flex items-start gap-2">
                <span className="font-bold text-slate-900">CycloneDX:</span>
                JSON & XML (v1.4, v1.5, v1.6)
            </li>
            <li className="flex items-start gap-2">
                <span className="font-bold text-slate-900">SPDX:</span>
                JSON, YAML, & Tag-Value (v2.2, v2.3)
            </li>
            <li className="flex items-start gap-2">
                <span className="font-bold text-slate-900">SPDX 3.0:</span>
                JSON-LD (Core Software Profile)
            </li>
          </ul>
        </section>

        <section className="space-y-4">
          <h3 className="font-bold text-slate-800 flex items-center gap-2 uppercase tracking-wider text-sm">
            <Database size={18} className="text-blue-500" />
            Key Features
          </h3>
          <ul className="space-y-2 text-sm text-slate-600">
            <li>• Auto-detection of format and version</li>
            <li>• Interactive dependency graph (Hierarchical/Force)</li>
            <li>• License aggregation and missing info alerts</li>
            <li>• Embedded vulnerability reference display</li>
            <li>• CSV and JSON data export</li>
          </ul>
        </section>
      </div>

      <section className="bg-slate-50 p-6 rounded-xl border border-slate-100">
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 uppercase tracking-wider text-sm">
            How it works
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <Step icon={<Search />} title="Detection" desc="The app inspects the file content to identify the spec and version." />
            <Step icon={<Database />} title="Normalization" desc="The data is mapped to a unified internal model." />
            <Step icon={<Share2 />} title="Visualization" desc="React and Cytoscape render the interactive views." />
        </div>
      </section>
    </div>
  );
};

const Step = ({ icon, title, desc }: { icon: any, title: string, desc: string }) => (
    <div className="space-y-2 text-center sm:text-left">
        <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mx-auto sm:mx-0">
            {React.cloneElement(icon, { size: 20 })}
        </div>
        <h4 className="font-bold text-slate-800 text-sm">{title}</h4>
        <p className="text-xs text-slate-500 leading-tight">{desc}</p>
    </div>
);
