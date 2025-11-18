import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { VoxelBlackHole } from './components/VoxelBlackHole';
import { GalaxyBackground } from './components/GalaxyBackground';
import { ChatInterface } from './components/ChatInterface';
import { Info } from 'lucide-react';

const Scene: React.FC = () => {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      
      {/* The Main Event */}
      <VoxelBlackHole />
      
      {/* Procedural Galaxy Background */}
      <GalaxyBackground />
      
      {/* Distant Background Stars */}
      <Stars radius={200} depth={50} count={3000} factor={4} saturation={0} fade speed={0.5} />
      
      {/* Post Processing for the Glow */}
      <EffectComposer>
        <Bloom 
            luminanceThreshold={0.2} 
            mipmapBlur 
            intensity={1.5} 
            radius={0.5}
        />
      </EffectComposer>
      
      {/* Camera Controls */}
      <OrbitControls 
        enablePan={false} 
        minDistance={6} 
        maxDistance={50} 
        autoRotate 
        autoRotateSpeed={0.3}
      />
    </>
  );
};

function App() {
  // Safely check for API key existence
  const hasApiKey = typeof process !== 'undefined' && process.env && process.env.API_KEY;

  return (
    <div className="relative w-full h-screen bg-[#050505] overflow-hidden selection:bg-orange-500 selection:text-black">
      
      {/* 3D Canvas Layer */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [10, 5, 12], fov: 45 }}>
            <color attach="background" args={['#020202']} />
            <Suspense fallback={null}>
                <Scene />
            </Suspense>
        </Canvas>
      </div>

      {/* Overlay UI Layer */}
      <div className="absolute top-6 left-6 z-10 pointer-events-none">
        <h1 className="text-5xl md:text-7xl font-pixel text-orange-500 drop-shadow-[0_0_10px_rgba(255,100,0,0.8)]">
          EVENT HORIZON
        </h1>
        <p className="text-gray-400 font-mono text-sm mt-2 max-w-xs bg-black/50 p-2 border-l-2 border-orange-500 backdrop-blur-sm">
            Simulated accretion disk utilizing Gemini 2.5 Flash. 
            Interact with the Singularity below.
        </p>
      </div>

      {/* API Key Warning (If missing) */}
      {!hasApiKey && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-red-900/90 border-4 border-red-500 p-8 rounded max-w-lg text-center backdrop-blur-xl">
            <Info className="mx-auto w-12 h-12 text-red-200 mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">API KEY MISSING</h2>
            <p className="text-red-100">
                The simulation cannot establish a neural link. Please ensure <code className="bg-black/30 p-1 rounded">process.env.API_KEY</code> is set with a valid Google Gemini API key to communicate with the entity.
            </p>
        </div>
      )}

      <ChatInterface />

    </div>
  );
}

export default App;