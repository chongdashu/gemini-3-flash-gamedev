
import React from 'react';
import { COLORS } from '../constants';
import { Enemy as EnemyType } from '../types';

export const Enemy: React.FC<{ data: EnemyType }> = ({ data }) => {
  const { type, position } = data;

  const renderModel = () => {
    switch (type) {
      case 'cube':
        return (
          <mesh castShadow>
            <boxGeometry args={[0.8, 0.8, 0.8]} />
            <meshStandardMaterial color={COLORS.enemyCube} transparent opacity={0.8} roughness={0} />
          </mesh>
        );
      case 'wisp':
        return (
          <mesh castShadow>
            <octahedronGeometry args={[0.5, 0]} />
            <meshStandardMaterial color={COLORS.enemyWisp} emissive={COLORS.enemyWisp} emissiveIntensity={0.5} />
          </mesh>
        );
      case 'ball':
        return (
          <group>
            <mesh castShadow>
              <sphereGeometry args={[0.6, 16, 16]} />
              <meshStandardMaterial color={COLORS.enemyBall} />
            </mesh>
            {/* Spikes */}
            {[0, Math.PI/2, Math.PI, 3*Math.PI/2].map((rot, i) => (
              <mesh key={i} rotation={[rot, 0, 0]} position={[0, 0, 0]}>
                <coneGeometry args={[0.1, 1.4, 8]} />
                <meshStandardMaterial color="#333" />
              </mesh>
            ))}
          </group>
        );
    }
  };

  return (
    <group position={[position.x, position.y + 0.5, position.z]}>
      {renderModel()}
    </group>
  );
};
