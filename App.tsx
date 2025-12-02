import React, { useState, useEffect, useRef } from 'react';
import Scene from './components/Scene';
import GestureHandler from './components/GestureHandler';
import { generateLuxuryGreeting } from './services/geminiService';
import { CONFIG, COLORS } from './constants';

const App: React.FC = () => {
  const [treeState, setTreeState] = useState<'FORMED' | 'CHAOS'>('FORMED');
  const [progress, setProgress] = useState(1); // 1 = Formed, 0 = Chaos
  const [cameraRotation, setCameraRotation] = useState(0);
  const [permission, setPermission] = useState(false);
  const [showGreeting, setShowGreeting] = useState(false);
  const [greetingText, setGreetingText] = useState("");
  const [loadingGreeting, setLoadingGreeting] = useState(false);

  // Smooth out camera rotation
  const targetRotation = useRef(0);

  const handleMotion = (score: number, centerX: number) => {
    // If high motion, trigger chaos
    if (score > CONFIG.TRIGGER_CHAOS_THRESHOLD) {
      setTreeState('CHAOS');
    } else {
      // If low motion for a bit, go back to formed
      setTreeState('FORMED');
    }

    // Accumulate rotation based on center of motion (hand movement)
    // Deadzone check
    if (Math.abs(centerX) > 0.2) {
      targetRotation.current += centerX * 0.05;
    }
  };

  useEffect(() => {
    let animFrame: number;
    const loop = () => {
      // Animate Progress
      if (treeState === 'CHAOS') {
        setProgress(p => Math.max(0, p - 0.05));
      } else {
        setProgress(p => Math.min(1, p + 0.02));
      }
      
      // Animate Camera
      setCameraRotation(prev => prev + (targetRotation.current - prev) * 0.1);
      
      animFrame = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(animFrame);
  }, [treeState]);

  const handleGreeting = async () => {
    setLoadingGreeting(true);
    const text = await generateLuxuryGreeting();
    setGreetingText(text);
    setLoadingGreeting(false);
    setShowGreeting(true);
  };

  return (
    <div className="w-full h-screen relative bg-black">
      {/* 3D Scene Layer */}
      <div className="absolute inset-0 z-0">
        <Scene progress={progress} cameraRotation={cameraRotation} />
      </div>

      {/* UI Overlay */}
      <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-8">
        
        {/* Header */}
        <header className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl md:text-6xl text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 via-yellow-500 to-yellow-700 font-bold tracking-wider drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]" style={{ fontFamily: 'Cinzel' }}>
              NGACHING
            </h1>
            <p className="text-emerald-400 tracking-[0.5em] text-sm mt-2 uppercase">Grand Luxury Interactive</p>
          </div>
          
          <div className="pointer-events-auto">
             {!permission && (
               <button 
                onClick={() => setPermission(true)}
                className="bg-yellow-600 hover:bg-yellow-500 text-black font-bold py-2 px-4 rounded border border-yellow-300 shadow-[0_0_15px_rgba(255,215,0,0.5)] transition-all"
               >
                 ENABLE CAMERA CONTROL
               </button>
             )}
          </div>
        </header>

        {/* Center Interaction Hint */}
        {progress < 0.5 && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
            <h2 className="text-6xl text-white font-bold opacity-20 animate-pulse tracking-widest">CHAOS</h2>
          </div>
        )}

        {/* Footer Controls */}
        <div className="flex justify-between items-end">
          <div className="text-yellow-100/50 text-xs max-w-xs">
            <p className="mb-2 uppercase font-bold text-yellow-500">Instructions:</p>
            <ul className="list-disc pl-4 space-y-1">
              <li>Wave hand vigorously to UNLEASH chaos.</li>
              <li>Keep still to RESTORE the form.</li>
              <li>Move hand Left/Right to ROTATE view.</li>
            </ul>
          </div>

          <div className="pointer-events-auto flex flex-col items-end gap-4">
            {progress > 0.9 && !showGreeting && (
              <button 
                onClick={handleGreeting}
                disabled={loadingGreeting}
                className="group relative px-8 py-3 bg-gradient-to-r from-emerald-900 to-emerald-800 border border-yellow-500/50 rounded-sm overflow-hidden transition-all hover:scale-105 active:scale-95"
              >
                <div className="absolute inset-0 bg-yellow-400/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"/>
                <span className="relative text-yellow-400 font-cinzel tracking-widest font-bold flex items-center gap-2">
                  {loadingGreeting ? "CONSULTING GEMINI..." : "RECEIVE LUXURY BLESSING"}
                </span>
              </button>
            )}
            
            {/* Simulation Toggle for users without camera */}
            <div className="flex items-center gap-2 bg-black/50 p-2 rounded backdrop-blur-sm border border-white/10">
               <span className="text-xs text-gray-400 uppercase">Simulate:</span>
               <button 
                 onMouseEnter={() => setTreeState('CHAOS')}
                 onMouseLeave={() => setTreeState('FORMED')}
                 className="px-3 py-1 bg-white/10 hover:bg-red-500/50 text-white text-xs rounded transition-colors"
               >
                 HOVER FOR CHAOS
               </button>
            </div>
          </div>
        </div>
      </div>

      {/* Greeting Modal */}
      {showGreeting && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md transition-opacity duration-500">
           <div className="bg-gradient-to-br from-emerald-950 to-black border-2 border-yellow-600 p-10 max-w-2xl text-center shadow-[0_0_50px_rgba(255,215,0,0.2)] relative">
              <button 
                onClick={() => setShowGreeting(false)}
                className="absolute top-4 right-4 text-yellow-600 hover:text-yellow-400 pointer-events-auto"
              >
                ✕
              </button>
              <div className="mb-6 text-yellow-500 text-4xl">❝</div>
              <p className="text-2xl md:text-3xl font-playfair text-white leading-relaxed italic">
                {greetingText}
              </p>
              <div className="mt-8 pt-6 border-t border-yellow-600/30 flex justify-center">
                <span className="font-cinzel text-yellow-600 text-sm tracking-[0.3em]">FROM GEMINI WITH LUXURY</span>
              </div>
           </div>
        </div>
      )}

      {/* Logic Components */}
      <GestureHandler onMotionUpdate={handleMotion} permissionGranted={permission} />
    </div>
  );
};

export default App;
