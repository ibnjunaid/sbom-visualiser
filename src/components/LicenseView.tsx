import React, { useMemo } from 'react';
import type { SBOMComponent } from '../models/sbom';
import { PieChart, AlertTriangle } from 'lucide-react';

interface LicenseViewProps {
  components: SBOMComponent[];
}

export const LicenseView: React.FC<LicenseViewProps> = ({ components }) => {
  const stats = useMemo(() => {
    const counts: Record<string, number> = {};
    let missingCount = 0;

    components.forEach(c => {
      const licenses = [...(c.licenses.declared || []), ...(c.licenses.concluded || [])];
      if (licenses.length === 0) {
        missingCount++;
      } else {
        licenses.forEach(l => {
          const name = l.id || l.name || l.expression || 'Unknown';
          counts[name] = (counts[name] || 0) + 1;
        });
      }
    });

    const sorted = Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .map(([name, count]) => ({
        name,
        count,
        percentage: (count / components.length) * 100
      }));

    return { sorted, missingCount, total: components.length };
  }, [components]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white border border-slate-200 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
          <PieChart className="text-blue-500" size={20} />
          License Distribution
        </h3>
        <div className="space-y-4">
          {stats.sorted.map((item, i) => (
            <div key={i}>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-slate-700">{item.name}</span>
                <span className="text-slate-500">{item.count} ({item.percentage.toFixed(1)}%)</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-blue-500 h-full rounded-full"
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-amber-100 p-2 rounded-lg">
              <AlertTriangle className="text-amber-600" size={20} />
            </div>
            <h3 className="font-bold text-amber-900">License Alerts</h3>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-2xl font-bold text-amber-700">{stats.missingCount}</p>
              <p className="text-sm text-amber-600">Components missing license information</p>
              <div className="mt-2 w-full bg-amber-200 rounded-full h-1.5">
                <div
                  className="bg-amber-600 h-full rounded-full"
                  style={{ width: `${(stats.missingCount / stats.total) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
            <h4 className="text-sm font-bold text-slate-400 uppercase mb-4 tracking-wider">Summary</h4>
            <div className="space-y-2">
                <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Unique Licenses</span>
                    <span className="font-bold text-slate-800">{stats.sorted.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Total Components</span>
                    <span className="font-bold text-slate-800">{stats.total}</span>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
