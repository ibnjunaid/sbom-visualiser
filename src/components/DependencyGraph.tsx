import React, { useEffect, useRef, useState } from 'react';
import cytoscape from 'cytoscape';
import type { SBOMComponent, SBOMRelationship } from '../models/sbom';
import { Maximize2, RefreshCw } from 'lucide-react';

interface DependencyGraphProps {
  components: SBOMComponent[];
  relationships: SBOMRelationship[];
}

export const DependencyGraph: React.FC<DependencyGraphProps> = ({ components, relationships }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<cytoscape.Core | null>(null);
  const [layoutType, setLayoutType] = useState<'breadthfirst' | 'cose' | 'circle' | 'grid'>('breadthfirst');

  useEffect(() => {
    if (!containerRef.current) return;

    const nodeIds = new Set(components.map(c => c.id));
    const nodes = components.map(c => ({
      data: {
        id: c.id,
        label: `${c.name}\n${c.version || ''}`,
        type: c.type
      }
    }));

    const edges = relationships
      .map((r, i) => ({
        data: {
          id: `e${i}`,
          source: r.source,
          target: r.target,
          label: r.type
        }
      }))
      .filter(edge => nodeIds.has(edge.data.source) && nodeIds.has(edge.data.target));

    const cy = cytoscape({
      container: containerRef.current,
      elements: { nodes, edges },
      style: [
        {
          selector: 'node',
          style: {
            'label': 'data(label)',
            'background-color': '#3b82f6',
            'color': '#1e293b',
            'font-size': '10px',
            'text-valign': 'bottom',
            'text-halign': 'center',
            'width': 30,
            'height': 30,
            'text-wrap': 'wrap',
            'text-margin-y': 5,
          }
        },
        {
            selector: 'node[type="application"]',
            style: { 'background-color': '#ef4444' }
        },
        {
            selector: 'node[type="library"]',
            style: { 'background-color': '#3b82f6' }
        },
        {
          selector: 'edge',
          style: {
            'width': 2,
            'line-color': '#cbd5e1',
            'target-arrow-color': '#cbd5e1',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            'font-size': '8px',
          } as any
        }
      ],
      layout: {
        name: layoutType,
        padding: 50,
      } as any
    });

    cyRef.current = cy;

    return () => {
      cy.destroy();
    };
  }, [components, relationships, layoutType]);

  const fitGraph = () => cyRef.current?.fit();
  const resetLayout = () => {
      cyRef.current?.layout({ name: layoutType, padding: 50 } as any).run();
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden h-full flex flex-col relative">
      <div className="p-3 border-b border-slate-100 flex items-center justify-between bg-slate-50">
        <div className="text-sm font-medium text-slate-700">Dependency Graph</div>
        <div className="flex items-center gap-2">
            <select
                className="text-xs border border-slate-200 rounded px-2 py-1"
                value={layoutType}
                onChange={(e) => setLayoutType(e.target.value as any)}
            >
                <option value="breadthfirst">Hierarchical</option>
                <option value="cose">Force-directed</option>
                <option value="circle">Circle</option>
                <option value="grid">Grid</option>
            </select>
            <button onClick={fitGraph} className="p-1.5 hover:bg-slate-200 rounded transition-colors" title="Fit to screen">
                <Maximize2 size={16} className="text-slate-600" />
            </button>
            <button onClick={resetLayout} className="p-1.5 hover:bg-slate-200 rounded transition-colors" title="Re-run layout">
                <RefreshCw size={16} className="text-slate-600" />
            </button>
        </div>
      </div>
      <div ref={containerRef} className="flex-1 w-full h-full min-h-[400px]" />
      <div className="absolute bottom-4 left-4 flex flex-col gap-2 pointer-events-none">
          <div className="flex items-center gap-2 text-[10px] bg-white/80 backdrop-blur p-2 rounded border border-slate-100 shadow-sm">
              <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span> Application</div>
              <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Library</div>
              <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-300"></span> Other</div>
          </div>
      </div>
    </div>
  );
};
