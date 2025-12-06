import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { NavNode, ViewState } from '../types';
import { LayoutDashboard, BarChart2, Database, GitMerge, Sliders, Settings, FileText } from 'lucide-react';

interface SolarNavigationProps {
  activeView: ViewState;
  onViewChange: (view: ViewState) => void;
}

const NODES: NavNode[] = [
  { id: ViewState.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard, shortCode: 'HOME', status: 'active' },
  { id: ViewState.ANALYTICS, label: 'Analytics', icon: BarChart2, shortCode: 'STATS', status: 'active' },
  { id: ViewState.DATA_GRID, label: 'Data Grid', icon: Database, shortCode: 'DATA', status: 'complete' },
  { id: ViewState.PROCESS, label: 'Workflows', icon: GitMerge, shortCode: 'FLOW', status: 'active' },
  { id: ViewState.CONTROLS, label: 'Controls', icon: Sliders, shortCode: 'CTRL', status: 'pending' },
  { id: ViewState.SETTINGS, label: 'Settings', icon: Settings, shortCode: 'SET', status: 'locked' },
  { id: ViewState.DOCS, label: 'Documentation', icon: FileText, shortCode: 'DOCS', status: 'active' },
];

export const SolarNavigation: React.FC<SolarNavigationProps> = ({ activeView, onViewChange }) => {
  
  // Calculate positions based on active node being at (0,0)
  const nodePositions = useMemo(() => {
    const activeIndex = NODES.findIndex(n => n.id === activeView);
    const otherNodes = NODES.filter(n => n.id !== activeView);
    const radius = 220; // Distance from center
    
    return NODES.map((node) => {
      if (node.id === activeView) {
        return { ...node, x: 0, y: 0, scale: 1.2, opacity: 1 };
      }
      
      // Find index in the filtered array to distribute evenly
      const indexInOrbit = otherNodes.findIndex(n => n.id === node.id);
      const angle = (indexInOrbit * (360 / otherNodes.length)) * (Math.PI / 180); // Convert to radians
      
      // Start form top (-PI/2)
      const adjustedAngle = angle - Math.PI / 2;

      return {
        ...node,
        x: Math.cos(adjustedAngle) * radius,
        y: Math.sin(adjustedAngle) * radius,
        scale: 0.8,
        opacity: 0.7
      };
    });
  }, [activeView]);

  return (
    <div className="relative w-[600px] h-[600px] flex items-center justify-center pointer-events-none">
      {/* Orbital Rings - Decorative */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-[440px] h-[440px] rounded-full border border-app-border/30 animate-pulse-slow" />
        <div className="w-[300px] h-[300px] rounded-full border border-dashed border-app-border/20" />
      </div>

      {/* Connecting Lines (from center to others) */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
        {nodePositions.map((node) => {
          if (node.id === activeView) return null;
          return (
            <motion.line
              key={`line-${node.id}`}
              x1="50%"
              y1="50%"
              x2={`calc(50% + ${node.x}px)`}
              y2={`calc(50% + ${node.y}px)`}
              stroke="#272B36"
              strokeWidth="1"
              initial={false}
              animate={{
                x2: `calc(50% + ${node.x}px)`,
                y2: `calc(50% + ${node.y}px)`
              }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
            />
          );
        })}
      </svg>

      {/* Nodes */}
      {nodePositions.map((node) => {
        const isActive = node.id === activeView;
        const Icon = node.icon;
        
        return (
          <motion.button
            key={node.id}
            onClick={() => onViewChange(node.id)}
            className={`
              absolute z-10 flex flex-col items-center justify-center 
              w-24 h-24 rounded-full pointer-events-auto cursor-pointer
              transition-colors duration-300 group
              ${isActive ? 'bg-app-bg border-2 border-app-primary shadow-[0_0_30px_rgba(99,102,241,0.3)]' : 'bg-app-surface border border-app-border hover:border-app-primary/50'}
            `}
            initial={false}
            animate={{
              x: node.x,
              y: node.y,
              scale: node.scale,
              opacity: node.opacity
            }}
            transition={{ type: "spring", stiffness: 180, damping: 25 }}
            whileHover={{ scale: isActive ? 1.25 : 0.9 }}
          >
            <Icon 
              size={isActive ? 32 : 24} 
              className={`
                mb-2 ${isActive ? 'text-app-primary' : 'text-app-muted group-hover:text-app-text'}
              `} 
            />
            <span className={`
              text-[10px] font-mono tracking-wider uppercase
              ${isActive ? 'text-app-text font-bold' : 'text-app-muted'}
            `}>
              {node.shortCode}
            </span>
            
            {/* Status Indicator Dot */}
            <div className={`
              absolute top-0 right-0 w-3 h-3 rounded-full border-2 border-app-bg
              ${node.status === 'complete' ? 'bg-app-success' : 
                node.status === 'active' ? 'bg-app-primary' : 
                node.status === 'locked' ? 'bg-app-border' : 'bg-app-warning'}
            `} />
          </motion.button>
        );
      })}
      
      {/* Center Label (Floating near active node) */}
      <motion.div 
        className="absolute top-[65%] text-center pointer-events-none"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        key={activeView} // Re-animate on change
      >
         <h2 className="text-xl font-medium text-app-text tracking-wider">{NODES.find(n => n.id === activeView)?.label}</h2>
         <p className="text-xs text-app-primary font-mono mt-1">MODULE ACTIVE</p>
      </motion.div>
    </div>
  );
};