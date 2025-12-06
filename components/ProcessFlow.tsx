import React from 'react';
import { Card } from './ui/Card';
import { motion } from 'framer-motion';
import { GitBranch, GitCommit, PlayCircle } from 'lucide-react';

export const ProcessFlow: React.FC = () => {
  return (
    <div className="grid grid-cols-12 gap-6 h-full">
      <div className="col-span-12 h-full flex flex-col">
        <Card title="Phylogenetic Process Tree" className="h-full relative overflow-hidden bg-[#0F1115]">
             {/* Background decorative grid */}
             <div className="absolute inset-0 opacity-5" 
                style={{ backgroundImage: 'radial-gradient(#272B36 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
             </div>

             <div className="h-full w-full flex items-center justify-start overflow-x-auto pl-10 pr-20">
                {/* Dendritic Structure */}
                <div className="flex items-center">
                    
                    {/* Root Node */}
                    <div className="relative z-10 flex flex-col items-center gap-2 group">
                        <motion.div 
                            initial={{ scale: 0 }} animate={{ scale: 1 }}
                            className="w-16 h-16 rounded-full bg-app-primary/10 border-2 border-app-primary flex items-center justify-center text-app-primary shadow-[0_0_20px_rgba(99,102,241,0.2)]"
                        >
                            <GitCommit size={24} />
                        </motion.div>
                        <span className="text-xs font-mono text-app-primary bg-app-bg px-2 py-1 rounded border border-app-primary/30">GENESIS</span>
                    </div>

                    {/* Connection 1 */}
                    <motion.div initial={{ width: 0 }} animate={{ width: 80 }} transition={{ duration: 0.8 }} className="h-0.5 bg-gradient-to-r from-app-primary to-app-border"></motion.div>

                    {/* Branch Point 1 */}
                    <div className="relative z-10 flex flex-col gap-12">
                         {/* Upper Branch */}
                         <div className="flex items-center relative">
                             {/* Curve */}
                             <div className="absolute right-full top-1/2 w-8 h-1/2 border-l-2 border-t-2 border-app-border rounded-tl-xl translate-y-[24px]"></div>
                             
                             <motion.div 
                                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}
                                className="w-12 h-12 rounded-xl bg-app-surface border border-app-border flex items-center justify-center text-app-text hover:border-app-secondary transition-colors cursor-pointer"
                            >
                                <span className="text-xs font-bold">A.1</span>
                             </motion.div>
                             
                             <motion.div initial={{ width: 0 }} animate={{ width: 40 }} transition={{ delay: 0.8, duration: 0.5 }} className="h-0.5 bg-app-border"></motion.div>
                             
                             <motion.div 
                                initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1 }}
                                className="px-4 py-2 bg-app-surface border border-app-success/30 rounded text-xs text-app-success"
                             >
                                Validated
                             </motion.div>
                         </div>

                         {/* Lower Branch (Active) */}
                         <div className="flex items-center relative">
                              {/* Curve */}
                             <div className="absolute right-full bottom-1/2 w-8 h-1/2 border-l-2 border-b-2 border-app-border rounded-bl-xl -translate-y-[24px]"></div>

                             <motion.div 
                                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}
                                className="w-12 h-12 rounded-xl bg-app-surface border border-app-secondary flex items-center justify-center text-app-text shadow-[0_0_15px_rgba(139,92,246,0.15)] relative"
                            >
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-app-secondary rounded-full animate-pulse"></div>
                                <GitBranch size={18} className="text-app-secondary" />
                             </motion.div>

                             <motion.div initial={{ width: 0 }} animate={{ width: 60 }} transition={{ delay: 0.9, duration: 0.5 }} className="h-0.5 bg-gradient-to-r from-app-secondary to-app-border"></motion.div>

                             {/* Sub Branching */}
                             <div className="flex flex-col gap-6 relative">
                                  {/* Leaf 1 */}
                                  <div className="flex items-center">
                                       <div className="w-4 h-0.5 bg-app-border"></div>
                                       <motion.div 
                                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
                                            className="w-8 h-8 rounded bg-app-bg border border-app-border flex items-center justify-center"
                                        >
                                            <div className="w-2 h-2 bg-app-muted rounded-full"></div>
                                        </motion.div>
                                  </div>
                                  {/* Leaf 2 */}
                                  <div className="flex items-center">
                                       <div className="w-4 h-0.5 bg-app-border"></div>
                                       <motion.div 
                                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.3 }}
                                            className="w-8 h-8 rounded bg-app-bg border border-app-border flex items-center justify-center hover:border-app-primary cursor-pointer"
                                        >
                                            <PlayCircle size={14} className="text-app-primary" />
                                        </motion.div>
                                         <span className="ml-2 text-[10px] text-app-primary font-mono uppercase tracking-wider animate-pulse">Processing</span>
                                  </div>
                             </div>
                         </div>
                    </div>

                </div>
             </div>
        </Card>
      </div>
    </div>
  );
};