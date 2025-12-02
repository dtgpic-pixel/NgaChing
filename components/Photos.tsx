import React, { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Image, Text } from '@react-three/drei';
import * as THREE from 'three';
import { CONFIG, PHOTO_URLS } from '../constants';

const PhotoItem: React.FC<{ 
  url: string; 
  index: number; 
  progress: number;
}> = ({ url, index, progress }) => {
  const meshRef = useRef<THREE.Group>(null);
  
  const { chaosPos, targetPos, rotSpeed } = useMemo(() => {
    // Spiral placement
    const y = (index / CONFIG.PHOTO_COUNT - 0.5) * CONFIG.TREE_HEIGHT * 0.8;
    const r = ((CONFIG.TREE_HEIGHT / 2 - y) / CONFIG.TREE_HEIGHT) * CONFIG.TREE_RADIUS + 0.5;
    const theta = index * 1.5; // Spiral offset

    const target = new THREE.Vector3(r * Math.cos(theta), y, r * Math.sin(theta));
    const chaos = new THREE.Vector3().randomDirection().multiplyScalar(12);
    
    return {
      chaosPos: chaos,
      targetPos: target,
      rotSpeed: Math.random() * 0.5
    };
  }, [index]);

  useFrame((state) => {
    if (!meshRef.current) return;
    
    const ease = 1 - Math.pow(1 - progress, 3);
    
    meshRef.current.position.lerpVectors(chaosPos, targetPos, ease);
    
    // Look at center when formed, spin when chaos
    if (progress > 0.8) {
        meshRef.current.lookAt(0, meshRef.current.position.y, 0);
        meshRef.current.rotateY(Math.PI); // Flip to face out
    } else {
        meshRef.current.rotation.x = state.clock.elapsedTime * rotSpeed;
        meshRef.current.rotation.y = state.clock.elapsedTime * rotSpeed;
    }
  });

  return (
    <group ref={meshRef}>
      <mesh position={[0, 0, -0.01]}>
        <planeGeometry args={[2.2, 2.6]} />
        <meshBasicMaterial color="#fff" side={THREE.DoubleSide} />
      </mesh>
      <Image url={url} scale={[2, 2]} position={[0, 0.2, 0]} />
      <Text 
        position={[0, -1.0, 0]} 
        fontSize={0.2} 
        color="black"
        font="https://fonts.gstatic.com/s/cinzel/v11/8vIJ7wvpj536O9wZ.woff"
      >
        NgaChing
      </Text>
    </group>
  );
};

const Photos: React.FC<{ progress: number }> = ({ progress }) => {
  return (
    <>
      {PHOTO_URLS.map((url, i) => (
        <PhotoItem key={i} index={i} url={url} progress={progress} />
      ))}
    </>
  );
};

export default Photos;
