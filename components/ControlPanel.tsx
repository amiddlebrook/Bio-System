import React from 'react';
import { Card } from './ui/Card';
import { Wifi, Battery, Shield, Cpu, Power, RefreshCw } from 'lucide-react';

export const ControlPanel: React.FC = () => {
  return (
    <div className="grid grid-cols-12 gap-6 h-full">
      {/* Device Cards */}
      <div className="col-span-12">
        <Card title="Connected Devices" className="h-full">
          <div className="grid grid-cols-4 gap-4">
            {/* Card 1 */}
            <div className="bg-app-bg border border-app-primary/50 rounded-lg p-4 relative overflow-hidden group hover:border-app-primary transition-all">
              <div className="absolute top-3 right-3 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-app-success animate-pulse"></span>
                <span className="text-[10px] text-app-success font-bold uppercase">Online</span>
              </div>
              <Cpu className="text-app-primary mb-3" size={24} />
              <h4 className="text-sm font-medium text-app-text">Main Server</h4>
              <p className="text-xs text-app-muted mb-4">Unit A-01</p>
              
              <div className="flex justify-between items-center text-xs border-t border-app-border pt-3">
                 <span className="text-app-muted">Load</span>
                 <span className="text-app-text font-mono">24%</span>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-app-bg border border-app-border rounded-lg p-4 relative overflow-hidden hover:border-app-border/80">
              <div className="absolute top-3 right-3 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-app-warning"></span>
                <span className="text-[10px] text-app-warning font-bold uppercase">Standby</span>
              </div>
              <Wifi className="text-app-secondary mb-3" size={24} />
              <h4 className="text-sm font-medium text-app-text">Gateway Node</h4>
              <p className="text-xs text-app-muted mb-4">Unit B-12</p>

              <div className="flex justify-between items-center text-xs border-t border-app-border pt-3">
                 <span className="text-app-muted">Signal</span>
                 <span className="text-app-text font-mono">-42dBm</span>
              </div>
            </div>

             {/* Card 3 */}
             <div className="bg-app-bg border border-app-border rounded-lg p-4 relative overflow-hidden hover:border-app-border/80">
              <div className="absolute top-3 right-3 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-app-danger"></span>
                <span className="text-[10px] text-app-danger font-bold uppercase">Error</span>
              </div>
              <Battery className="text-app-danger mb-3" size={24} />
              <h4 className="text-sm font-medium text-app-text">Backup Power</h4>
              <p className="text-xs text-app-muted mb-4">Unit C-04</p>

              <div className="flex justify-between items-center text-xs border-t border-app-border pt-3">
                 <span className="text-app-muted">Charge</span>
                 <span className="text-app-text font-mono">12%</span>
              </div>
            </div>
            
             {/* Card 4 - Action */}
             <div className="bg-app-bg/50 border border-dashed border-app-border rounded-lg p-4 flex flex-col items-center justify-center text-app-muted hover:text-app-primary hover:border-app-primary cursor-pointer transition-all">
                 <RefreshCw size={24} className="mb-2" />
                 <span className="text-xs font-medium">Scan for Devices</span>
             </div>
          </div>
        </Card>
      </div>
      
      {/* Bottom Panel */}
      <div className="col-span-12 h-40">
          <Card className="h-full flex flex-row items-center justify-between px-8 bg-app-surface">
             <div>
                 <h3 className="text-sm font-bold text-app-text mb-2">Global System Controls</h3>
                 <p className="text-xs text-app-muted">Master overrides for all connected subsystems.</p>
             </div>
             
             <div className="flex gap-4">
                 <button className="flex items-center gap-2 px-6 py-3 bg-app-bg border border-app-border rounded text-sm font-medium text-app-text hover:bg-app-border transition-colors">
                     <Shield size={16} /> Security Lock
                 </button>
                 <button className="flex items-center gap-2 px-6 py-3 bg-app-danger text-white rounded text-sm font-medium hover:bg-red-600 transition-colors shadow-lg shadow-red-900/20">
                     <Power size={16} /> Emergency Stop
                 </button>
             </div>
          </Card>
      </div>
    </div>
  );
};