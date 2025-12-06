import React, { useState, useMemo } from 'react';
import { Card } from './ui/Card';
import { Search, Filter, Grid, List } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Mock Data
const generateData = (count: number) => {
    return Array.from({ length: count }).map((_, i) => ({
        id: `ORG-${1000 + i}`,
        name: `Specimen ${String.fromCharCode(65 + Math.floor(Math.random() * 26))}-${Math.floor(Math.random() * 99)}`,
        status: Math.random() > 0.5 ? 'Active' : Math.random() > 0.5 ? 'Dormant' : 'Critical',
        category: ['Flora', 'Fauna', 'Mineral'][Math.floor(Math.random() * 3)],
        value: Math.floor(Math.random() * 1000)
    }));
};

const rawData = generateData(24);

export const DataGrid: React.FC = () => {
  const [viewMode, setViewMode] = useState<'list' | 'swarm'>('swarm');
  const [filter, setFilter] = useState('');

  const filteredData = useMemo(() => {
      if (!filter) return rawData;
      return rawData.filter(d => d.name.toLowerCase().includes(filter.toLowerCase()) || d.category.toLowerCase().includes(filter.toLowerCase()));
  }, [filter]);

  return (
    <div className="grid grid-cols-12 gap-6 h-full flex flex-col">
      <div className="col-span-12 h-full flex flex-col">
        <Card className="h-full flex flex-col overflow-hidden" 
            headerAction={
             <div className="flex gap-2 items-center">
                 <div className="relative">
                    <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-app-muted" />
                    <input 
                        type="text" 
                        placeholder="Search specimen..." 
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="pl-8 pr-3 py-1 bg-app-bg border border-app-border rounded text-xs text-app-text outline-none focus:border-app-primary w-48"
                    />
                 </div>
                 <div className="w-px h-4 bg-app-border mx-1"></div>
                 <button 
                    onClick={() => setViewMode('swarm')}
                    className={`p-1.5 rounded transition-colors ${viewMode === 'swarm' ? 'text-app-primary bg-app-primary/10' : 'text-app-muted hover:text-white'}`}>
                     <Grid size={14} />
                 </button>
                 <button 
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded transition-colors ${viewMode === 'list' ? 'text-app-primary bg-app-primary/10' : 'text-app-muted hover:text-white'}`}>
                     <List size={14} />
                 </button>
             </div>
        } title="Biosphere Data">
          
          <div className="flex-1 relative h-full w-full p-4 overflow-hidden">
             <AnimatePresence mode="wait">
                 {viewMode === 'list' ? (
                     <motion.div 
                        key="list"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="overflow-x-auto h-full"
                     >
                        <table className="w-full text-sm text-left">
                        <thead>
                            <tr className="text-app-muted border-b border-app-border bg-app-bg/50">
                            <th className="px-4 py-3 font-medium">ID</th>
                            <th className="px-4 py-3 font-medium">Specimen</th>
                            <th className="px-4 py-3 font-medium">Kingdom</th>
                            <th className="px-4 py-3 font-medium">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-app-border">
                            {filteredData.map((row, i) => (
                            <tr key={i} className="hover:bg-app-bg/30 transition-colors">
                                <td className="px-4 py-3 font-mono text-xs text-app-primary">{row.id}</td>
                                <td className="px-4 py-3 font-medium text-app-text">{row.name}</td>
                                <td className="px-4 py-3 text-app-muted">{row.category}</td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide
                                        ${row.status === 'Active' ? 'bg-app-success/10 text-app-success' : 
                                        row.status === 'Dormant' ? 'bg-app-warning/10 text-app-warning' :
                                        'bg-app-danger/10 text-app-danger'}
                                    `}>
                                        {row.status}
                                    </span>
                                </td>
                            </tr>
                            ))}
                        </tbody>
                        </table>
                     </motion.div>
                 ) : (
                     <motion.div 
                        key="swarm"
                        className="relative w-full h-full"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                     >
                         {/* Swarm Visualization */}
                         {filteredData.map((item, i) => {
                             // Deterministic pseudo-random position based on index if no filter
                             // If filter exists, they cluster towards center
                             const isFiltered = !!filter;
                             const angle = (i / filteredData.length) * Math.PI * 2;
                             const radius = isFiltered ? 100 : 200; // Cluster if filtered
                             const xBase = Math.cos(angle) * radius + (Math.random() * 40 - 20);
                             const yBase = Math.sin(angle) * radius + (Math.random() * 40 - 20);

                             return (
                                 <motion.div
                                    key={item.id}
                                    layoutId={item.id}
                                    initial={{ x: 0, y: 0, scale: 0 }}
                                    animate={{ 
                                        x: xBase, 
                                        y: yBase, 
                                        scale: 1,
                                        // "Float" animation simulation
                                        transition: { 
                                            x: { duration: 1, type: "spring" },
                                            y: { duration: 1, type: "spring" }
                                        }
                                    }}
                                    className="absolute left-1/2 top-1/2 flex flex-col items-center justify-center cursor-pointer group"
                                    style={{ marginLeft: -32, marginTop: -32, width: 64, height: 64 }}
                                 >
                                     <motion.div 
                                        animate={{ 
                                            y: [0, -5, 0],
                                            opacity: [0.7, 1, 0.7] 
                                        }}
                                        transition={{ 
                                            duration: 2 + Math.random() * 2, 
                                            repeat: Infinity,
                                            delay: Math.random() * 2 
                                        }}
                                        className={`w-3 h-3 rounded-full mb-2 shadow-[0_0_10px_currentColor]
                                            ${item.status === 'Active' ? 'bg-app-success text-app-success' : 
                                              item.status === 'Dormant' ? 'bg-app-warning text-app-warning' : 'bg-app-danger text-app-danger'}
                                        `}
                                     />
                                     <div className="opacity-0 group-hover:opacity-100 transition-opacity text-center pointer-events-none z-10 bg-app-bg/90 px-2 py-1 rounded border border-app-border backdrop-blur-sm">
                                         <div className="text-[10px] font-bold text-app-text whitespace-nowrap">{item.name}</div>
                                         <div className="text-[8px] text-app-muted">{item.category}</div>
                                     </div>
                                 </motion.div>
                             );
                         })}
                         
                         {!filter && (
                             <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                                 <div className="w-64 h-64 border border-dashed border-app-border rounded-full opacity-20 animate-[spin_60s_linear_infinite]"></div>
                                 <div className="absolute w-96 h-96 border border-dashed border-app-border rounded-full opacity-10 animate-[spin_40s_linear_infinite_reverse]"></div>
                             </div>
                         )}
                     </motion.div>
                 )}
             </AnimatePresence>
          </div>
        </Card>
      </div>
    </div>
  );
};