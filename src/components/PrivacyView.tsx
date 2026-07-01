import React from 'react';
import { ShieldCheck, Lock, EyeOff, ServerOff, Globe } from 'lucide-react';

export const PrivacyView: React.FC = () => {
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-8 max-w-4xl mx-auto space-y-12">
      <section className="text-center space-y-4">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldCheck size={40} />
        </div>
        <h2 className="text-3xl font-black text-slate-900">Privacy First</h2>
        <p className="text-slate-500 text-lg max-w-2xl mx-auto">
            Your SBOM data is sensitive. We believe it should stay yours.
            SBOMScope is designed to be the most private way to visualize your software supply chain.
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-4">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <ServerOff className="text-blue-500" size={20} />
                No Backend
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
                There is no server-side component to this application. All parsing, processing, and rendering happen
                entirely within your browser. Once the static files are loaded, no data is sent over the network.
            </p>
        </div>

        <div className="space-y-4">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <EyeOff className="text-blue-500" size={20} />
                No Tracking
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
                We do not use analytics, cookies, or third-party trackers. We don't even know you're using the app,
                let alone what files you're viewing.
            </p>
        </div>

        <div className="space-y-4">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Lock className="text-blue-500" size={20} />
                Local Storage Only
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
                If you use the "Load from URL" feature, the file is fetched directly from the source to your browser.
                We never act as a proxy or store any of your configuration.
            </p>
        </div>

        <div className="space-y-4">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Globe className="text-blue-500" size={20} />
                Open Source
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
                The entire source code is available on GitHub for audit. You can verify that our privacy promises are
                enforced by the code itself.
            </p>
        </div>
      </div>

      <section className="bg-slate-50 p-6 rounded-xl border border-slate-100 text-center">
        <p className="text-xs text-slate-400 font-medium">
            Note: Standard GitHub Pages logs may capture the loading of the application's static assets (JavaScript/CSS),
            but your uploaded SBOM data never touches their servers.
        </p>
      </section>
    </div>
  );
};
