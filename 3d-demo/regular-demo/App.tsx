
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { Sky, ContactShadows, Environment, Stars } from '@react-three/drei';
import { Snowman } from './components/Snowman';
import { Enemy as EnemyComponent } from './components/Enemy';
import { Snowball as SnowballComponent } from './components/Snowball';
import { UIOverlay } from './components/UIOverlay';
import { GameState, Enemy, Snowball, Direction } from './types';
import { SPAWN_DISTANCE, SNOWBALL_SPEED, INITIAL_HEALTH, ENEMY_TYPES } from './constants';
import { getWaveMessage } from './services/geminiService';
import * as THREE from 'three';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    health: INITIAL_HEALTH,
    wave: 1,
    isGameOver: false,
    highScore: parseInt(localStorage.getItem('frost_highscore') || '0'),
    waveMessage: 'Get Ready!',
  });

  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [snowballs, setSnowballs] = useState<Snowball[]>([]);
  const [playerRotation, setPlayerRotation] = useState(0);

  const gameLoopRef = useRef<number>();
  const lastSpawnTime = useRef<number>(0);
  const lastShootTime = useRef<number>(0);

  // Sound placeholders (can be implemented if needed)
  const shoot = useCallback((direction: Direction) => {
    if (gameState.isGameOver) return;
    
    const now = Date.now();
    if (now - lastShootTime.current < 250) return; // Debounce shooting

    lastShootTime.current = now;

    let rot = 0;
    if (direction === 'UP') rot = Math.PI;
    if (direction === 'DOWN') rot = 0;
    if (direction === 'LEFT') rot = -Math.PI / 2;
    if (direction === 'RIGHT') rot = Math.PI / 2;
    setPlayerRotation(rot);

    setSnowballs(prev => [
      ...prev,
      {
        id: Math.random().toString(36).substr(2, 9),
        position: { x: 0, y: 0, z: 0 },
        direction,
        speed: SNOWBALL_SPEED,
      },
    ]);
  }, [gameState.isGameOver]);

  const restartGame = () => {
    setGameState({
      score: 0,
      health: INITIAL_HEALTH,
      wave: 1,
      isGameOver: false,
      highScore: parseInt(localStorage.getItem('frost_highscore') || '0'),
      waveMessage: 'New Beginning!',
    });
    setEnemies([]);
    setSnowballs([]);
    lastSpawnTime.current = Date.now();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'w', 'W'].includes(e.key)) shoot('UP');
      if (['ArrowDown', 's', 'S'].includes(e.key)) shoot('DOWN');
      if (['ArrowLeft', 'a', 'A'].includes(e.key)) shoot('LEFT');
      if (['ArrowRight', 'd', 'D'].includes(e.key)) shoot('RIGHT');
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shoot]);

  // Main Game Loop
  useEffect(() => {
    if (gameState.isGameOver) return;

    const tick = () => {
      const now = Date.now();

      // Enemy Spawning
      const spawnRate = Math.max(2000 - gameState.wave * 150, 600);
      if (now - lastSpawnTime.current > spawnRate) {
        lastSpawnTime.current = now;
        const directions: Direction[] = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
        const dir = directions[Math.floor(Math.random() * 4)];
        const typeKeys = Object.keys(ENEMY_TYPES) as (keyof typeof ENEMY_TYPES)[];
        const type = typeKeys[Math.floor(Math.random() * typeKeys.length)];
        const config = ENEMY_TYPES[type];

        let x = 0, z = 0;
        if (dir === 'UP') { x = (Math.random() - 0.5) * 4; z = -SPAWN_DISTANCE; }
        if (dir === 'DOWN') { x = (Math.random() - 0.5) * 4; z = SPAWN_DISTANCE; }
        if (dir === 'LEFT') { x = -SPAWN_DISTANCE; z = (Math.random() - 0.5) * 4; }
        if (dir === 'RIGHT') { x = SPAWN_DISTANCE; z = (Math.random() - 0.5) * 4; }

        setEnemies(prev => [...prev, {
          id: Math.random().toString(36).substr(2, 9),
          type,
          position: { x, y: 0, z },
          health: config.health,
          speed: config.speed + (gameState.wave * 0.005),
          direction: dir,
        }]);
      }

      // Update Projectiles
      setSnowballs(prev => prev.map(sb => {
        const nextPos = { ...sb.position };
        if (sb.direction === 'UP') nextPos.z -= sb.speed;
        if (sb.direction === 'DOWN') nextPos.z += sb.speed;
        if (sb.direction === 'LEFT') nextPos.x -= sb.speed;
        if (sb.direction === 'RIGHT') nextPos.x += sb.speed;
        return { ...sb, position: nextPos };
      }).filter(sb => Math.abs(sb.position.x) < 25 && Math.abs(sb.position.z) < 25));

      // Update Enemies & Collisions
      setEnemies(prevEnemies => {
        const nextEnemies: Enemy[] = [];
        let damageToPlayer = 0;

        prevEnemies.forEach(enemy => {
          const dx = -enemy.position.x;
          const dz = -enemy.position.z;
          const dist = Math.sqrt(dx * dx + dz * dz);

          // Move towards player
          const moveX = (dx / dist) * enemy.speed;
          const moveZ = (dz / dist) * enemy.speed;

          const updatedEnemy = {
            ...enemy,
            position: {
              ...enemy.position,
              x: enemy.position.x + moveX,
              z: enemy.position.z + moveZ,
            }
          };

          // Collision with Player
          if (dist < 1.2) {
            damageToPlayer++;
            return;
          }

          // Collision with Snowballs
          let hit = false;
          setSnowballs(prevSnowballs => {
            const remainingSnowballs = prevSnowballs.filter(sb => {
              const sDx = sb.position.x - updatedEnemy.position.x;
              const sDz = sb.position.z - updatedEnemy.position.z;
              const sDist = Math.sqrt(sDx * sDx + sDz * sDz);
              if (sDist < 1) {
                hit = true;
                return false;
              }
              return true;
            });
            return remainingSnowballs;
          });

          if (hit) {
            updatedEnemy.health--;
            if (updatedEnemy.health <= 0) {
              setGameState(s => ({ ...s, score: s.score + ENEMY_TYPES[updatedEnemy.type].score }));
              return;
            }
          }

          nextEnemies.push(updatedEnemy);
        });

        if (damageToPlayer > 0) {
          setGameState(s => {
            const newHealth = Math.max(0, s.health - damageToPlayer);
            if (newHealth <= 0) {
              if (s.score > s.highScore) {
                localStorage.setItem('frost_highscore', s.score.toString());
              }
              return { ...s, health: 0, isGameOver: true, highScore: Math.max(s.score, s.highScore) };
            }
            return { ...s, health: newHealth };
          });
        }

        return nextEnemies;
      });

      gameLoopRef.current = requestAnimationFrame(tick);
    };

    gameLoopRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(gameLoopRef.current!);
  }, [gameState.isGameOver, gameState.wave]);

  // Wave Progression
  useEffect(() => {
    const waveCheck = setInterval(() => {
      if (gameState.isGameOver) return;
      setGameState(s => {
        const nextWaveThreshold = s.wave * 500;
        if (s.score >= nextWaveThreshold) {
          const newWave = s.wave + 1;
          // Trigger Gemini for flavor text
          getWaveMessage(newWave).then(msg => {
            setGameState(curr => ({ ...curr, waveMessage: msg }));
            setTimeout(() => setGameState(curr => ({ ...curr, waveMessage: '' })), 3000);
          });
          return { ...s, wave: newWave };
        }
        return s;
      });
    }, 1000);
    return () => clearInterval(waveCheck);
  }, [gameState.isGameOver]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (gameState.isGameOver) return;
    const { clientX, clientY } = e;
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const dx = clientX - centerX;
    const dy = clientY - centerY;

    if (Math.abs(dx) > Math.abs(dy)) {
      shoot(dx > 0 ? 'RIGHT' : 'LEFT');
    } else {
      shoot(dy > 0 ? 'DOWN' : 'UP');
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-900" onPointerDown={handlePointerDown}>
      <UIOverlay state={gameState} onRestart={restartGame} />
      
      <Canvas shadows camera={{ position: [0, 10, 15], fov: 40 }}>
        <Sky sunPosition={[10, 5, 10]} />
        <Environment preset="city" />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[5, 10, 5]}
          intensity={1.5}
          castShadow
          shadow-camera-far={50}
          shadow-camera-left={-20}
          shadow-camera-right={20}
          shadow-camera-top={20}
          shadow-camera-bottom={-20}
        />

        <Snowman rotation={playerRotation} />
        
        {enemies.map(enemy => (
          <EnemyComponent key={enemy.id} data={enemy} />
        ))}
        
        {snowballs.map(sb => (
          <SnowballComponent key={sb.id} data={sb} />
        ))}

        {/* Ground */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[100, 100]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.5} />
        </mesh>

        <ContactShadows 
          opacity={0.4} 
          scale={20} 
          blur={2.4} 
          far={10} 
          resolution={256} 
          color="#000000" 
        />
      </Canvas>
    </div>
  );
};

export default App;
