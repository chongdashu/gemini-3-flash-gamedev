
import React from 'react';
import { COLORS } from '../constants';
import { Snowball as SnowballType } from '../types';

export const Snowball: React.FC<{ data: SnowballType }> = ({ data }) => {
  return (
    <mesh position={[data.position.x, data.position.y + 1.5, data.position.z]} castShadow>
      <sphereGeometry args={[0.15, 16, 16]} />
      <meshStandardMaterial color={COLORS.snow} emissive="#fff" emissiveIntensity={0.2} />
    </mesh>
  );
};
