import React from 'react';
import { Card } from './ui/Card';
import { Bell, Calendar, User, Activity, Zap, Layers, Hexagon } from 'lucide-react';
import { Metric } from '../types';
import { motion } from 'framer-motion';

export const Dashboard: React.FC = () => {
  const metrics: Metric[] = [
    { label: "Active Nodes", value: "842", status: "good", trend: 12 },
    { label: "System Load", value: "42%", status: "good", trend: -5 },
    { label: "Throughput", value: "1.2TB", status: "neutral", trend: 8 },
  ];

  // "Breathing" animation for cells
  const breathe = {
    initial: { scale: 1 },
    animate: { 
      scale: [1, 1.01, 1],
      transition: { duration: 6, repeat: Infinity, ease: "easeInOut" }
    }
  };

  return (
    <div className="h-full w-full overflow-y-auto pr-2 pb-20">
      {/* Bio-Grid: A cellular layout that breaks the rigid grid structure */}
      <div className="grid grid-cols-12 grid-rows-[auto_auto_auto] gap-4">
        
        {/* Header Cell (Nucleus) */}
        <motion.div 
          className="col-span-12 md:col-span-8 row-span-1"
          variants={breathe} initial="initial" animate="animate"
        >
          <Card className="h-full bg-gradient-to-br from-app-surface to-app-bg border-l-4 border-l-app-primary relative overflow-hidden">
            <div className="absolute right-0 top-0 w-64 h-64 bg-app-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="flex justify-between items-start relative z-10">
              <div>
                  <h1 className="text-3xl font-light text-white mb-2 tracking-tight">System <span className="font-bold text-app-primary">Nucleus</span></h1>
                  <div className="flex space-x-6 text-app-muted text-xs font-mono uppercase tracking-widest">
                      <span className="flex items-center gap-2"><Hexagon size={12} /> Cycle: 8492.1</span>
                      <span className="flex items-center gap-2"><User size={12} /> Admin_Alpha</span>
                  </div>
              </div>
              <button className="p-3 bg-app-bg/50 rounded-full border border-app-border text-app-muted hover:text-app-primary hover:border-app-primary transition-all">
                  <Bell size={18} />
              </button>
            </div>
            <div className="mt-6 flex gap-2">
                <div className="h-1 flex-1 bg-app-bg rounded-full overflow-hidden">
                    <motion.div className="h-full bg-app-primary" initial={{ width: 0 }} animate={{ width: '70%' }} transition={{ duration: 1.5 }} />
                </div>
                <div className="h-1 w-12 bg-app-bg rounded-full overflow-hidden">
                    <motion.div className="h-full bg-app-secondary" initial={{ width: 0 }} animate={{ width: '40%' }} transition={{ duration: 1.5, delay: 0.2 }} />
                </div>
            </div>
          </Card>
        </motion.div>

        {/* Quick Stats (Organelles) */}
        <div className="col-span-12 md:col-span-4 row-span-1 grid grid-cols-2 gap-4">
            {metrics.slice(0, 2).map((m, i) => (
                <motion.div key={i} className="col-span-1" whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 300 }}>
                    <Card className="h-full flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                             <Activity size={16} className={m.status === 'good' ? 'text-app-success' : 'text-app-warning'} />
                             <span className="text-[10px] font-mono text-app-muted">{m.label}</span>
                        </div>
                        <div className="text-2xl font-bold text-app-text mt-2">{m.value}</div>
                    </Card>
                </motion.div>
            ))}
            <motion.div className="col-span-2" whileHover={{ scale: 1.02 }}>
                <Card className="h-full flex items-center justify-between">
                    <div>
                         <div className="text-[10px] font-mono text-app-muted">THROUGHPUT</div>
                         <div className="text-xl font-bold text-app-text">1.2 TB/s</div>
                    </div>
                    <Zap size={20} className="text-app-secondary" />
                </Card>
            </motion.div>
        </div>

        {/* Main Activity Feed (Mitochondria - Energy Source) */}
        <motion.div 
            className="col-span-12 md:col-span-6 lg:col-span-4 h-96"
            variants={breathe} initial="initial" animate="animate"
        >
          <Card title="Activity Pulse" className="h-full">
            <div className="space-y-6 relative">
                {/* Connecting line representing a nerve fiber */}
                <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-gradient-to-b from-app-border via-app-primary/20 to-transparent"></div>
                
                {[1,2,3,4].map(i => (
                    <div key={i} className="flex items-center gap-4 relative z-10 group cursor-pointer">
                        <div className="w-10 h-10 rounded-full bg-app-bg border border-app-border group-hover:border-app-primary transition-colors flex items-center justify-center shrink-0">
                            <div className="w-2 h-2 rounded-full bg-app-primary group-hover:scale-150 transition-transform"></div>
                        </div>
                        <div className="flex-1 p-3 rounded-lg bg-app-bg/50 border border-transparent group-hover:border-app-border transition-all">
                            <div className="flex justify-between items-center mb-1">
                                <h4 className="text-xs font-bold text-app-text">Signal Detected</h4>
                                <span className="text-[10px] text-app-muted font-mono">00:0{i}</span>
                            </div>
                            <p className="text-[10px] text-app-muted leading-tight">Anomalous data packet received on port 808{i}.</p>
                        </div>
                    </div>
                ))}
            </div>
          </Card>
        </motion.div>
        
        {/* Complex Data Visualization (Chloroplast - Synthesis) */}
        <motion.div className="col-span-12 md:col-span-6 lg:col-span-8 h-96">
            <Card title="System Morphology" className="h-full relative overflow-hidden">
                <div className="absolute inset-0 flex items-end justify-between px-2 gap-1 opacity-20 pointer-events-none">
                     {/* Generative bar chart background */}
                     {Array.from({ length: 30 }).map((_, i) => (
                         <motion.div 
                            key={i}
                            className="flex-1 bg-app-primary rounded-t-sm"
                            initial={{ height: '10%' }}
                            animate={{ height: `${Math.random() * 80 + 10}%` }}
                            transition={{ duration: 4, repeat: Infinity, repeatType: "reverse", delay: i * 0.1 }}
                         />
                     ))}
                </div>
                
                <div className="relative z-10 grid grid-cols-2 gap-6 h-full p-4">
                    <div className="space-y-4">
                        <h3 className="text-sm text-app-text">Resource Allocation</h3>
                        <div className="space-y-2">
                             <div>
                                 <div className="flex justify-between text-xs mb-1 text-app-muted"><span>Compute</span><span>78%</span></div>
                                 <div className="h-1 w-full bg-app-bg rounded-full overflow-hidden"><div className="h-full bg-app-primary w-[78%]"></div></div>
                             </div>
                             <div>
                                 <div className="flex justify-between text-xs mb-1 text-app-muted"><span>Memory</span><span>42%</span></div>
                                 <div className="h-1 w-full bg-app-bg rounded-full overflow-hidden"><div className="h-full bg-app-secondary w-[42%]"></div></div>
                             </div>
                             <div>
                                 <div className="flex justify-between text-xs mb-1 text-app-muted"><span>Storage</span><span>21%</span></div>
                                 <div className="h-1 w-full bg-app-bg rounded-full overflow-hidden"><div className="h-full bg-app-success w-[21%]"></div></div>
                             </div>
                        </div>
                    </div>
                    <div className="flex items-center justify-center">
                         <div className="relative w-32 h-32">
                             <motion.div className="absolute inset-0 border-4 border-app-primary/20 rounded-full" animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} />
                             <motion.div className="absolute inset-2 border-4 border-dashed border-app-secondary/30 rounded-full" animate={{ rotate: -360 }} transition={{ duration: 15, repeat: Infinity, ease: "linear" }} />
                             <div className="absolute inset-0 flex items-center justify-center flex-col">
                                 <span className="text-2xl font-bold text-app-text">98%</span>
                                 <span className="text-[10px] text-app-muted uppercase">Health</span>
                             </div>
                         </div>
                    </div>
                </div>
            </Card>
        </motion.div>

      </div>
    </div>
  );
};