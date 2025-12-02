import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, OrbitControls, PerspectiveCamera, Stars } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import * as THREE from 'three';
import Foliage from './Foliage';
import Ornaments from './Ornaments';
import Photos from './Photos';
import { CONFIG, COLORS } from '../constants';

interface SceneProps {
  progress: number;
  cameraRotation: number;
}

const CameraRig: React.FC<{ rotation: number }> = ({ rotation }) => {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const vec = new THREE.Vector3();

  useFrame((state) => {
    if (cameraRef.current) {
      // Lerp camera position based on "motion center" rotation
      const x = Math.sin(rotation * 2) * 22;
      const z = Math.cos(rotation * 2) * 22;
      
      cameraRef.current.position.lerp(vec.set(x, 4, z), 0.05);
      cameraRef.current.lookAt(0, 0, 0);
    }
  });

  return <PerspectiveCamera ref={cameraRef} makeDefault position={CONFIG.CAMERA_POS} fov={50} />;
};

const Scene: React.FC<SceneProps> = ({ progress, cameraRotation }) => {
  return (
    <Canvas dpr={[1, 2]} gl={{ antialias: false, toneMapping: THREE.ACESFilmicToneMapping }}>
      <CameraRig rotation={cameraRotation} />
      
      <color attach="background" args={[COLORS.RICH_BLACK]} />
      <fog attach="fog" args={[COLORS.RICH_BLACK, 15, 45]} />
      
      <ambientLight intensity={0.5} color={COLORS.EMERALD} />
      <spotLight 
        position={[10, 20, 10]} 
        angle={0.5} 
        penumbra={1} 
        intensity={2} 
        color={COLORS.GOLD} 
        castShadow 
      />
      <pointLight position={[-10, -5, -10]} intensity={1} color={COLORS.RED_VELVET} />

      <Environment preset="lobby" />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

      <group rotation={[0, 0, 0]}>
        <Foliage progress={progress} />
        <Ornaments progress={progress} />
        <Photos progress={progress} />
      </group>

      <EffectComposer disableNormalPass>
        <Bloom 
            luminanceThreshold={CONFIG.BLOOM_THRESHOLD} 
            mipmapBlur 
            intensity={CONFIG.BLOOM_INTENSITY} 
            radius={0.6}
        />
        <Vignette eskil={false} offset={0.1} darkness={0.5} />
        <Noise opacity={0.05} />
      </EffectComposer>
    </Canvas>
  );
};

export default Scene;
