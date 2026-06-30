import React, { useState, useMemo } from 'react';
import type { SBOMComponent } from '../models/sbom';
import { Search, ChevronDown, ChevronUp, Info } from 'lucide-react';

interface ComponentTableProps {
  components: SBOMComponent[];
  onSelectComponent: (component: SBOMComponent) => void;
}

type SortField = 'name' | 'version' | 'type' | 'supplier';
type SortOrder = 'asc' | 'desc';

export const ComponentTable: React.FC<ComponentTableProps> = ({ components, onSelectComponent }) => {
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const filteredAndSorted = useMemo(() => {
    return components
      .filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.version?.toLowerCase().includes(search.toLowerCase()) ||
        c.purl?.toLowerCase().includes(search.toLowerCase()) ||
        c.supplier?.toLowerCase().includes(search.toLowerCase())
      )
      .sort((a, b) => {
        const valA = (a[sortField] || '').toLowerCase();
        const valB = (b[sortField] || '').toLowerCase();
        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  }, [components, search, sortField, sortOrder]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b border-slate-100 flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search components, versions, PURLs..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="text-sm text-slate-500">
          Showing {filteredAndSorted.length} of {components.length} components
        </div>
      </div>

      <div className="overflow-auto flex-1">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 sticky top-0 z-10">
            <tr className="text-xs uppercase text-slate-500 font-semibold">
              <th className="px-4 py-3 cursor-pointer hover:bg-slate-100" onClick={() => toggleSort('name')}>
                <div className="flex items-center gap-1">Name {renderSortIcon('name')}</div>
              </th>
              <th className="px-4 py-3 cursor-pointer hover:bg-slate-100" onClick={() => toggleSort('version')}>
                <div className="flex items-center gap-1">Version {renderSortIcon('version')}</div>
              </th>
              <th className="px-4 py-3 cursor-pointer hover:bg-slate-100" onClick={() => toggleSort('type')}>
                <div className="flex items-center gap-1">Type {renderSortIcon('type')}</div>
              </th>
              <th className="px-4 py-3">License</th>
              <th className="px-4 py-3 cursor-pointer hover:bg-slate-100" onClick={() => toggleSort('supplier')}>
                <div className="flex items-center gap-1">Supplier {renderSortIcon('supplier')}</div>
              </th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {filteredAndSorted.map((c) => (
              <tr key={c.id} className="hover:bg-blue-50 transition-colors group">
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-900">{c.name}</div>
                  {c.purl && <div className="text-[10px] text-slate-400 truncate max-w-[200px]" title={c.purl}>{c.purl}</div>}
                </td>
                <td className="px-4 py-3 text-slate-600">{c.version || '-'}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 bg-slate-100 rounded text-[10px] font-medium text-slate-600 uppercase">
                    {c.type}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {(c.licenses.declared || c.licenses.concluded || []).length > 0 ? (
                      (c.licenses.declared || c.licenses.concluded || []).map((l, i) => (
                        <span key={i} className="text-[11px] text-blue-700 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded">
                          {l.id || l.name || l.expression || 'Unknown'}
                        </span>
                      ))
                    ) : (
                      <span className="text-[11px] text-amber-600 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded">
                        Missing
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-600 truncate max-w-[150px]" title={c.supplier}>
                    {c.supplier || '-'}
                </td>
                <td className="px-4 py-3">
                    <button
                        onClick={() => onSelectComponent(c)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-100 rounded-md transition-colors"
                        title="View Details"
                    >
                        <Info size={18} />
                    </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
