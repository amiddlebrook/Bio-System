import React, { useState, useEffect, useRef } from 'react';
import { SolarNavigation } from './components/SolarNavigation';
import { Dashboard } from './components/Dashboard';
import { DataGrid } from './components/DataGrid';
import { Analytics } from './components/Analytics';
import { ProcessFlow } from './components/ProcessFlow';
import { ControlPanel } from './components/ControlPanel';
import { ViewState } from './types';
import { motion, AnimatePresence } from 'framer-motion';

// Flow Field Component
const FlowField = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let particles: { x: number; y: number; vx: number; vy: number; age: number }[] = [];
        
        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        
        window.addEventListener('resize', resize);
        resize();

        const createParticle = () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            age: Math.random() * 100
        });

        // Initialize particles
        for(let i=0; i<50; i++) particles.push(createParticle());

        const animate = () => {
            if (!ctx) return;
            ctx.fillStyle = 'rgba(15, 17, 21, 0.1)'; // Trail effect
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            particles.forEach((p, i) => {
                p.x += p.vx;
                p.y += p.vy;
                p.age++;

                // Perlin-ish noise simulation for flow
                const angle = (p.x * 0.005) + (p.y * 0.005);
                p.vx += Math.cos(angle) * 0.02;
                p.vy += Math.sin(angle) * 0.02;

                // Friction
                p.vx *= 0.99;
                p.vy *= 0.99;

                // Wrap around
                if (p.x < 0) p.x = canvas.width;
                if (p.x > canvas.width) p.x = 0;
                if (p.y < 0) p.y = canvas.height;
                if (p.y > canvas.height) p.y = 0;

                // Draw
                ctx.beginPath();
                ctx.arc(p.x, p.y, Math.min(p.age * 0.05, 1.5), 0, Math.PI * 2);
                ctx.fillStyle = `rgba(99, 102, 241, ${Math.min(p.age * 0.01, 0.3)})`; // Primary color low opacity
                ctx.fill();

                // Reset old particles
                if (p.age > 200) particles[i] = createParticle();
            });

            animationFrameId = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none opacity-50" />;
};

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewState>(ViewState.DASHBOARD);

  const renderContent = () => {
    switch (activeView) {
      case ViewState.DASHBOARD: return <Dashboard />;
      case ViewState.ANALYTICS: return <Analytics />;
      case ViewState.DATA_GRID: return <DataGrid />;
      case ViewState.PROCESS: return <ProcessFlow />;
      case ViewState.CONTROLS: return <ControlPanel />;
      default:
        return (
            <div className="flex flex-col items-center justify-center h-full text-app-muted">
                <div className="text-4xl mb-4 opacity-20 font-mono">404</div>
            </div>
        );
    }
  };

  return (
    <div className="flex h-screen w-screen bg-app-bg overflow-hidden text-app-text selection:bg-app-primary selection:text-white relative">
      <FlowField />
      
      {/* Left: Solar Navigation (Fixed Width) */}
      <div className="w-[500px] h-full relative flex items-center justify-center border-r border-app-border/30 z-10 bg-app-bg/50 backdrop-blur-sm">
        <SolarNavigation activeView={activeView} onViewChange={setActiveView} />

        {/* Brand */}
        <div className="absolute top-8 left-8 z-20">
            <h1 className="text-2xl font-light font-sans tracking-tight text-white">BIO<span className="font-bold text-app-primary">SYSTEM</span></h1>
            <p className="text-[10px] text-app-muted tracking-widest uppercase mt-1">v2.1 // Organic UI</p>
        </div>
      </div>

      {/* Right: Content Area (Fluid) */}
      <div className="flex-1 h-full relative flex flex-col z-10">
        {/* Top Bar */}
        <div className="h-16 border-b border-app-border/30 flex items-center justify-between px-8 bg-app-surface/30 backdrop-blur-md z-20">
            <div className="flex items-center gap-4">
                <span className="text-xs font-mono text-app-muted">ENV:</span>
                <span className="text-xs font-mono text-app-success">HOMEOSTASIS</span>
            </div>
            <div className="flex items-center gap-4">
                 <div className="w-2 h-2 rounded-full bg-app-primary animate-[pulse_3s_infinite]"></div>
            </div>
        </div>

        {/* Main Content Container */}
        <div className="flex-1 p-8 overflow-hidden relative">
             <AnimatePresence mode="wait">
                <motion.div
                    key={activeView}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.02 }}
                    transition={{ duration: 0.4, ease: "circOut" }}
                    className="h-full w-full"
                >
                    {renderContent()}
                </motion.div>
             </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default App;