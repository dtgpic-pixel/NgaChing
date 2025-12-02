import React, { useMemo, useRef, useLayoutEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CONFIG, COLORS } from '../constants';

interface OrnamentsProps {
  progress: number;
}

const Ornaments: React.FC<OrnamentsProps> = ({ progress }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const giftRef = useRef<THREE.InstancedMesh>(null);

  const { ballData, giftData } = useMemo(() => {
    // Generate Ball Data
    const balls = [];
    for (let i = 0; i < CONFIG.ORNAMENT_COUNT; i++) {
      const y = (Math.random() - 0.5) * CONFIG.TREE_HEIGHT;
      const r = ((CONFIG.TREE_HEIGHT / 2 - y) / CONFIG.TREE_HEIGHT) * CONFIG.TREE_RADIUS * 0.9; // Slightly inside
      const theta = Math.random() * Math.PI * 2;
      
      const targetPos = new THREE.Vector3(r * Math.cos(theta), y, r * Math.sin(theta));
      
      // Chaos is random orbital
      const chaosPos = new THREE.Vector3().randomDirection().multiplyScalar(15 + Math.random() * 10);
      
      balls.push({
        chaosPos,
        targetPos,
        color: Math.random() > 0.5 ? COLORS.GOLD : COLORS.RED_VELVET,
        scale: Math.random() * 0.3 + 0.2
      });
    }

    // Generate Gift Data (Base of tree)
    const gifts = [];
    for (let i = 0; i < CONFIG.GIFT_COUNT; i++) {
      const r = Math.random() * 4 + 2;
      const theta = Math.random() * Math.PI * 2;
      const targetPos = new THREE.Vector3(r * Math.cos(theta), -CONFIG.TREE_HEIGHT/2 - 0.5, r * Math.sin(theta));
      const chaosPos = new THREE.Vector3().randomDirection().multiplyScalar(20);

      gifts.push({
        chaosPos,
        targetPos,
        color: Math.random() > 0.5 ? COLORS.CHAMPAGNE : COLORS.SILVER,
        scale: Math.random() * 0.5 + 0.4
      });
    }

    return { ballData: balls, giftData: gifts };
  }, []);

  const tempObj = new THREE.Object3D();
  const tempColor = new THREE.Color();

  useLayoutEffect(() => {
    // Set initial colors
    if (meshRef.current) {
      ballData.forEach((data, i) => {
        tempColor.set(data.color);
        meshRef.current!.setColorAt(i, tempColor);
      });
      meshRef.current.instanceColor!.needsUpdate = true;
    }
    if (giftRef.current) {
      giftData.forEach((data, i) => {
        tempColor.set(data.color);
        giftRef.current!.setColorAt(i, tempColor);
      });
      giftRef.current.instanceColor!.needsUpdate = true;
    }
  }, [ballData, giftData]);

  useFrame((state) => {
    const t = progress;
    // Cubic ease out
    const ease = 1 - Math.pow(1 - t, 3);

    if (meshRef.current) {
      ballData.forEach((data, i) => {
        tempObj.position.lerpVectors(data.chaosPos, data.targetPos, ease);
        // Add some floating wobble in chaos mode
        if (progress < 0.5) {
          tempObj.position.y += Math.sin(state.clock.elapsedTime + i) * 0.02;
        }
        
        tempObj.scale.setScalar(data.scale * (0.5 + 0.5 * ease)); // Grow when forming
        tempObj.rotation.set(ease * Math.PI * 2, ease * Math.PI, 0);
        tempObj.updateMatrix();
        meshRef.current!.setMatrixAt(i, tempObj.matrix);
      });
      meshRef.current.instanceMatrix.needsUpdate = true;
    }

    if (giftRef.current) {
      giftData.forEach((data, i) => {
        tempObj.position.lerpVectors(data.chaosPos, data.targetPos, ease);
        tempObj.scale.setScalar(data.scale);
        tempObj.rotation.set(0, state.clock.elapsedTime * 0.1 + i, 0);
        tempObj.updateMatrix();
        giftRef.current!.setMatrixAt(i, tempObj.matrix);
      });
      giftRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <>
      <instancedMesh ref={meshRef} args={[undefined, undefined, CONFIG.ORNAMENT_COUNT]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial 
            metalness={0.9} 
            roughness={0.1} 
            envMapIntensity={1.5}
        />
      </instancedMesh>

      <instancedMesh ref={giftRef} args={[undefined, undefined, CONFIG.GIFT_COUNT]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial 
            metalness={0.6} 
            roughness={0.2}
            envMapIntensity={1}
        />
      </instancedMesh>
    </>
  );
};

export default Ornaments;
