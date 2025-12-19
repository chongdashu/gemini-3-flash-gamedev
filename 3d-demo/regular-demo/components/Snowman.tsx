
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { COLORS } from '../constants';

export const Snowman: React.FC<{ rotation: number }> = ({ rotation }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        rotation,
        0.15
      );
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]} castShadow>
      {/* Bottom sphere */}
      <mesh position={[0, 0.6, 0]} castShadow>
        <sphereGeometry args={[0.6, 32, 32]} />
        <meshStandardMaterial color={COLORS.snow} />
      </mesh>
      {/* Middle sphere */}
      <mesh position={[0, 1.4, 0]} castShadow>
        <sphereGeometry args={[0.45, 32, 32]} />
        <meshStandardMaterial color={COLORS.snow} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 2, 0]} castShadow>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshStandardMaterial color={COLORS.snow} />
      </mesh>
      
      {/* Hat */}
      <group position={[0, 2.25, 0]}>
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.35, 0.35, 0.05, 32]} />
          <meshStandardMaterial color={COLORS.hat} />
        </mesh>
        <mesh position={[0, 0.2, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 0.4, 32]} />
          <meshStandardMaterial color={COLORS.hat} />
        </mesh>
      </group>

      {/* Nose (Carrot) */}
      <mesh position={[0, 2, 0.3]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.05, 0.2, 32]} />
        <meshStandardMaterial color={COLORS.carrot} />
      </mesh>

      {/* Eyes */}
      <mesh position={[-0.1, 2.1, 0.25]}>
        <sphereGeometry args={[0.03, 16, 16]} />
        <meshStandardMaterial color="#000" />
      </mesh>
      <mesh position={[0.1, 2.1, 0.25]}>
        <sphereGeometry args={[0.03, 16, 16]} />
        <meshStandardMaterial color="#000" />
      </mesh>
      
      {/* Buttons */}
      {[1.6, 1.4, 1.2, 0.8, 0.6].map((y, i) => (
        <mesh key={i} position={[0, y, 0.45]}>
          <sphereGeometry args={[0.03, 16, 16]} />
          <meshStandardMaterial color="#000" />
        </mesh>
      ))}
    </group>
  );
};
