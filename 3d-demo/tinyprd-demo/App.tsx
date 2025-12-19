import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameState, EnemyType, Enemy, Projectile, Particle, Player } from './types';
import { 
  ARENA_WIDTH, ARENA_HEIGHT, PLAYER_SPEED, PLAYER_ACCEL, PLAYER_DECEL, 
  PLAYER_RADIUS, PLAYER_FORGIVE, FIRE_COOLDOWN, PROJECTILE_SPEED, 
  PROJECTILE_LIFE, ENEMY_STATS, COLORS, STORAGE_KEYS, LANE_GRID
} from './constants';
import HUD from './components/HUD';
import Menu from './components/Menu';
import GameOver from './components/GameOver';

// Global Three.js access (loaded via script in index.html)
declare const THREE: any;

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [score, setScore] = useState(0);
  const [wave, setWave] = useState(1);
  const [hp, setHp] = useState(100);
  const [arrowShootMode, setArrowShootMode] = useState(false);
  const [highScore, setHighScore] = useState(Number(localStorage.getItem(STORAGE_KEYS.HIGH_SCORE)) || 0);
  const [bestWave, setBestWave] = useState(Number(localStorage.getItem(STORAGE_KEYS.BEST_WAVE)) || 0);

  // Scene Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const rendererRef = useRef<any>(null);
  // Initializing requestRef with 0 to resolve the 'Expected 1 arguments, but got 0' error.
  const requestRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  // Game Logic Refs
  const playerRef = useRef<Player>({
    id: 'player',
    x: ARENA_WIDTH / 2,
    z: ARENA_HEIGHT / 2,
    vx: 0,
    vz: 0,
    radius: PLAYER_RADIUS,
    hp: 100,
    lastShootTime: 0,
    invulnerableUntil: 0,
    lean: { x: 0, z: 0 }
  });
  const enemiesRef = useRef<Enemy[]>([]);
  const projectilesRef = useRef<Projectile[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const keysRef = useRef<Set<string>>(new Set());
  const mouseRef = useRef<{ down: boolean, x: number, y: number }>({ down: false, x: 0, y: 0 });
  const gameDataRef = useRef({
    waveTime: 0,
    enemiesToSpawn: 0,
    enemiesSpawned: 0,
    lastSpawnTime: 0,
    spawnInterval: 0.55,
    isBreather: true,
    timeScale: 1.0,
    shake: 0,
    lastNearMissTime: 0,
    dilationEnd: 0
  });

  // Three Mesh Refs
  const playerMeshRef = useRef<any>(null);
  const enemyMeshesRef = useRef<Map<string, any>>(new Map());
  const projectileMeshesRef = useRef<Map<string, any>>(new Map());
  const particleMeshesRef = useRef<Map<string, any>>(new Map());

  const initScene = useCallback(() => {
    if (!canvasRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(COLORS.BG);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(50, ARENA_WIDTH / ARENA_HEIGHT, 0.1, 2000);
    camera.position.set(ARENA_WIDTH / 2, 900, 720);
    camera.lookAt(ARENA_WIDTH / 2, 0, ARENA_HEIGHT / 2);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, antialias: true });
    renderer.setSize(ARENA_WIDTH, ARENA_HEIGHT);
    rendererRef.current = renderer;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(200, 500, 300);
    scene.add(dirLight);

    // Floor
    const floorGeo = new THREE.PlaneGeometry(ARENA_WIDTH, ARENA_HEIGHT);
    const floorMat = new THREE.MeshStandardMaterial({ color: COLORS.FLOOR });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(ARENA_WIDTH / 2, 0, ARENA_HEIGHT / 2);
    scene.add(floor);

    // Grid
    const gridHelper = new THREE.GridHelper(Math.max(ARENA_WIDTH, ARENA_HEIGHT) * 2, 50, COLORS.GRID, COLORS.GRID);
    gridHelper.position.set(ARENA_WIDTH / 2, 0.1, ARENA_HEIGHT / 2);
    scene.add(gridHelper);

    // Create Snowman Player
    const playerGroup = new THREE.Group();
    const bodyMat = new THREE.MeshStandardMaterial({ color: COLORS.PLAYER });
    const coalMat = new THREE.MeshStandardMaterial({ color: 0x1A1A1A });
    const noseMat = new THREE.MeshStandardMaterial({ color: 0xFF8A2A });
    const scarfMat = new THREE.MeshStandardMaterial({ color: COLORS.SCARF });

    const bottom = new THREE.Mesh(new THREE.SphereGeometry(18, 16, 16), bodyMat);
    bottom.position.y = 18;
    const mid = new THREE.Mesh(new THREE.SphereGeometry(12, 16, 16), bodyMat);
    mid.position.y = 40;
    const head = new THREE.Mesh(new THREE.SphereGeometry(8, 16, 16), bodyMat);
    head.position.y = 56;

    const nose = new THREE.Mesh(new THREE.ConeGeometry(2, 6, 8), noseMat);
    nose.rotation.x = Math.PI / 2;
    nose.position.set(0, 56, 8);
    
    const scarf = new THREE.Mesh(new THREE.TorusGeometry(8, 2, 8, 16), scarfMat);
    scarf.position.y = 48;
    scarf.rotation.x = Math.PI / 2;

    playerGroup.add(bottom, mid, head, nose, scarf);
    scene.add(playerGroup);
    playerMeshRef.current = playerGroup;
  }, []);

  const spawnEnemy = (type: EnemyType) => {
    const stats = type === EnemyType.MINION ? ENEMY_STATS.MINION : type === EnemyType.RUNNER ? ENEMY_STATS.RUNNER : ENEMY_STATS.BRUTE;
    const side = Math.floor(Math.random() * 4); // 0:L, 1:R, 2:T, 3:B
    let x = 0, z = 0;
    const padding = 40;
    
    // Lane snapping
    const snap = (v: number) => Math.floor(v / LANE_GRID) * LANE_GRID + LANE_GRID / 2;

    if (side === 0) { x = -padding; z = snap(playerRef.current.z); }
    else if (side === 1) { x = ARENA_WIDTH + padding; z = snap(playerRef.current.z); }
    else if (side === 2) { z = -padding; x = snap(playerRef.current.x); }
    else { z = ARENA_HEIGHT + padding; x = snap(playerRef.current.x); }

    const id = `enemy-${Date.now()}-${Math.random()}`;
    const speedMult = Math.min(1.45, 1 + (wave - 1) * 0.03);
    const enemy: Enemy = {
      id,
      x,
      z,
      type,
      radius: stats.radius,
      hp: stats.hp,
      damage: stats.damage,
      speed: stats.speed * speedMult,
      moveAxis: side < 2 ? 'x' : 'z',
      commitTime: 0
    };

    enemiesRef.current.push(enemy);

    // Three mesh
    let geo;
    let mat = new THREE.MeshStandardMaterial({ color: type === EnemyType.MINION ? COLORS.MINION : type === EnemyType.RUNNER ? COLORS.RUNNER : COLORS.BRUTE });
    if (type === EnemyType.MINION) geo = new THREE.SphereGeometry(stats.radius, 16, 16);
    else if (type === EnemyType.RUNNER) geo = new THREE.ConeGeometry(stats.radius, stats.radius * 2, 8);
    else geo = new THREE.BoxGeometry(stats.radius * 2, stats.radius * 2, stats.radius * 2);

    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, stats.radius, z);
    if (type === EnemyType.RUNNER) mesh.rotation.x = -Math.PI / 2;
    sceneRef.current.add(mesh);
    enemyMeshesRef.current.set(id, mesh);
  };

  const startWave = (w: number) => {
    let minions = 8, runners = 0, brutes = 0;
    if (w === 2) minions = 12;
    else if (w === 3) { minions = 14; runners = 4; }
    else if (w === 4) { minions = 16; runners = 6; }
    else if (w === 5) { minions = 18; runners = 6; brutes = 2; }
    else if (w > 5) {
      minions = 18 + (w - 5) * 2;
      runners = 6 + Math.floor((w - 5) * 1.5);
      brutes = 2 + Math.floor((w - 5) / 2);
    }
    
    gameDataRef.current.enemiesToSpawn = minions + runners + brutes;
    gameDataRef.current.enemiesSpawned = 0;
    gameDataRef.current.spawnInterval = Math.max(0.20, 0.55 - (w - 1) * 0.03);
    gameDataRef.current.isBreather = false;
    gameDataRef.current.lastSpawnTime = Date.now() / 1000;
  };

  const spawnProjectile = (dir: { x: number, z: number }) => {
    const p = playerRef.current;
    if (Date.now() / 1000 - p.lastShootTime < FIRE_COOLDOWN) return;
    p.lastShootTime = Date.now() / 1000;

    const id = `p-${Date.now()}-${Math.random()}`;
    const projectile: Projectile = {
      id,
      x: p.x + dir.x * 20,
      z: p.z + dir.z * 20,
      vx: dir.x * PROJECTILE_SPEED,
      vz: dir.z * PROJECTILE_SPEED,
      radius: 6,
      hp: 1,
      birth: Date.now() / 1000
    };
    projectilesRef.current.push(projectile);

    const mesh = new THREE.Mesh(new THREE.SphereGeometry(6, 8, 8), new THREE.MeshBasicMaterial({ color: COLORS.PROJECTILE }));
    mesh.position.set(projectile.x, 20, projectile.z);
    mesh.scale.set(0.6, 0.6, 0.6);
    sceneRef.current.add(mesh);
    projectileMeshesRef.current.set(id, mesh);

    // Recoil
    p.lean.x = -dir.x * 6;
    p.lean.z = -dir.z * 6;
  };

  const spawnParticles = (x: number, z: number, color: number, count: number, speed: number) => {
    for (let i = 0; i < count; i++) {
      const id = `particle-${Date.now()}-${Math.random()}`;
      const angle = Math.random() * Math.PI * 2;
      const mag = Math.random() * speed;
      const particle: Particle = {
        id, x, y: 10, z,
        vx: Math.cos(angle) * mag,
        vy: Math.random() * speed,
        vz: Math.sin(angle) * mag,
        life: 0,
        maxLife: 0.5 + Math.random() * 0.5,
        color: `#${color.toString(16).padStart(6, '0')}`,
        size: 2 + Math.random() * 4
      };
      particlesRef.current.push(particle);
      const mesh = new THREE.Mesh(new THREE.SphereGeometry(particle.size / 2, 4, 4), new THREE.MeshBasicMaterial({ color }));
      mesh.position.set(x, 10, z);
      sceneRef.current.add(mesh);
      particleMeshesRef.current.set(id, mesh);
    }
  };

  const triggerNearMiss = () => {
    const now = Date.now() / 1000;
    if (now - gameDataRef.current.lastNearMissTime < 1.2) return;
    gameDataRef.current.lastNearMissTime = now;
    gameDataRef.current.timeScale = 0.55;
    gameDataRef.current.dilationEnd = now + 0.12;
    setScore(s => s + 5);
    // UI feedback handled in HUD via score update
  };

  const gameLoop = useCallback((time: number) => {
    if (gameState === GameState.PAUSED) {
      lastTimeRef.current = time;
      requestRef.current = requestAnimationFrame(gameLoop);
      return;
    }

    const dtRaw = Math.min(0.1, (time - lastTimeRef.current) / 1000);
    lastTimeRef.current = time;
    const nowSec = Date.now() / 1000;

    // Time dilation logic
    let dt = dtRaw * gameDataRef.current.timeScale;
    if (nowSec > gameDataRef.current.dilationEnd && gameDataRef.current.timeScale < 1.0) {
      gameDataRef.current.timeScale = Math.min(1.0, gameDataRef.current.timeScale + dtRaw * 5);
    }

    if (gameState === GameState.PLAYING) {
      const p = playerRef.current;
      const g = gameDataRef.current;

      // Input - Move
      let moveX = 0, moveZ = 0;
      if (!arrowShootMode) {
        if (keysRef.current.has('ArrowUp') || keysRef.current.has('w')) moveZ -= 1;
        if (keysRef.current.has('ArrowDown') || keysRef.current.has('s')) moveZ += 1;
        if (keysRef.current.has('ArrowLeft') || keysRef.current.has('a')) moveX -= 1;
        if (keysRef.current.has('ArrowRight') || keysRef.current.has('d')) moveX += 1;
      } else {
        if (keysRef.current.has('w')) moveZ -= 1;
        if (keysRef.current.has('s')) moveZ += 1;
        if (keysRef.current.has('a')) moveX -= 1;
        if (keysRef.current.has('d')) moveX += 1;
      }

      // No diagonals for movement
      if (moveX !== 0 && moveZ !== 0) {
        // Simple heuristic: pick the most recent if possible, but here we just zero one
        moveZ = 0; 
      }

      const targetVx = moveX * PLAYER_SPEED;
      const targetVz = moveZ * PLAYER_SPEED;
      const accel = (moveX === 0 && moveZ === 0) ? PLAYER_DECEL : PLAYER_ACCEL;

      p.vx = THREE.MathUtils.lerp(p.vx, targetVx, accel * dt / PLAYER_SPEED);
      p.vz = THREE.MathUtils.lerp(p.vz, targetVz, accel * dt / PLAYER_SPEED);
      p.x += p.vx * dt;
      p.z += p.vz * dt;

      // Bounds
      p.x = Math.max(24, Math.min(ARENA_WIDTH - 24, p.x));
      p.z = Math.max(24, Math.min(ARENA_HEIGHT - 24, p.z));

      // Visual Lean
      p.lean.x = THREE.MathUtils.lerp(p.lean.x, moveX * 8, 0.07);
      p.lean.z = THREE.MathUtils.lerp(p.lean.z, moveZ * 8, 0.07);
      if (playerMeshRef.current) {
        playerMeshRef.current.position.set(p.x + p.lean.x, 0, p.z + p.lean.z);
        playerMeshRef.current.rotation.z = -p.lean.x * 0.05;
        playerMeshRef.current.rotation.x = p.lean.z * 0.05;
        // Breathing
        playerMeshRef.current.position.y = Math.sin(nowSec * (2 * Math.PI / 1.2)) * 4;
      }

      // Shooting
      let shootDir = null;
      if (keysRef.current.has('i')) shootDir = { x: 0, z: -1 };
      else if (keysRef.current.has('k')) shootDir = { x: 0, z: 1 };
      else if (keysRef.current.has('j')) shootDir = { x: -1, z: 0 };
      else if (keysRef.current.has('l')) shootDir = { x: 1, z: 0 };
      else if (arrowShootMode) {
        if (keysRef.current.has('ArrowUp')) shootDir = { x: 0, z: -1 };
        else if (keysRef.current.has('ArrowDown')) shootDir = { x: 0, z: 1 };
        else if (keysRef.current.has('ArrowLeft')) shootDir = { x: -1, z: 0 };
        else if (keysRef.current.has('ArrowRight')) shootDir = { x: 1, z: 0 };
      }

      if (mouseRef.current.down) {
        const dx = mouseRef.current.x - p.x;
        const dz = mouseRef.current.y - p.z;
        if (Math.abs(dx) > Math.abs(dz)) shootDir = { x: Math.sign(dx), z: 0 };
        else shootDir = { x: 0, z: Math.sign(dz) };
      }

      if (shootDir) spawnProjectile(shootDir);

      // Waves & Enemies
      if (g.isBreather) {
        if (nowSec - g.waveTime > 2.0) {
          startWave(wave);
        }
      } else {
        if (g.enemiesSpawned < g.enemiesToSpawn && nowSec - g.lastSpawnTime > g.spawnInterval) {
          const type = Math.random() < 0.1 ? EnemyType.BRUTE : (Math.random() < 0.3 ? EnemyType.RUNNER : EnemyType.MINION);
          spawnEnemy(type);
          g.enemiesSpawned++;
          g.lastSpawnTime = nowSec;
        }
        if (g.enemiesSpawned >= g.enemiesToSpawn && enemiesRef.current.length === 0) {
          setWave(w => w + 1);
          setScore(s => s + 50);
          g.isBreather = true;
          g.waveTime = nowSec;
        }
      }

      // Update Enemies
      enemiesRef.current.forEach(e => {
        // AI: Cardinal approach
        const dx = p.x - e.x;
        const dz = p.z - e.z;
        
        if (e.type === EnemyType.RUNNER) {
          if (nowSec > e.commitTime) {
            e.moveAxis = Math.abs(dx) > Math.abs(dz) ? 'x' : 'z';
            e.commitTime = nowSec + 1.0;
          }
        } else if (e.type === EnemyType.MINION) {
          e.moveAxis = Math.abs(dx) > Math.abs(dz) ? 'x' : 'z';
        }

        if (e.moveAxis === 'x') e.x += Math.sign(dx) * e.speed * dt;
        else e.z += Math.sign(dz) * e.speed * dt;

        const mesh = enemyMeshesRef.current.get(e.id);
        if (mesh) {
          mesh.position.set(e.x, e.radius, e.z);
          if (e.type === EnemyType.RUNNER) mesh.lookAt(p.x, e.radius, p.z);
        }

        // Collision Enemy-Player
        const dist = Math.sqrt((e.x - p.x)**2 + (e.z - p.z)**2);
        const hitRad = (e.radius + p.radius) - PLAYER_FORGIVE;
        if (dist < hitRad) {
          if (nowSec > p.invulnerableUntil) {
            p.hp -= e.damage;
            setHp(p.hp);
            p.invulnerableUntil = nowSec + 0.6;
            g.shake = 8;
            spawnParticles(p.x, p.z, COLORS.DAMAGE, 10, 100);
            if (p.hp <= 0) {
              setGameState(GameState.GAMEOVER);
              g.timeScale = 0;
              g.shake = 18;
              spawnParticles(p.x, p.z, COLORS.PLAYER, 12, 240);
            }
          }
        } else if (dist < hitRad + 10) {
          triggerNearMiss();
        }
      });

      // Update Projectiles
      projectilesRef.current.forEach(pr => {
        pr.x += pr.vx * dt;
        pr.z += pr.vz * dt;
        const mesh = projectileMeshesRef.current.get(pr.id);
        if (mesh) {
          mesh.position.set(pr.x, 20, pr.z);
          mesh.scale.x = THREE.MathUtils.lerp(mesh.scale.x, 1.0, 0.08);
          mesh.scale.y = THREE.MathUtils.lerp(mesh.scale.y, 1.0, 0.08);
          mesh.scale.z = THREE.MathUtils.lerp(mesh.scale.z, 1.0, 0.08);
        }

        // Projectile-Enemy collision
        enemiesRef.current.forEach(e => {
          const d = Math.sqrt((pr.x - e.x)**2 + (pr.z - e.z)**2);
          if (d < e.radius + pr.radius - PLAYER_FORGIVE) {
            e.hp--;
            pr.hp = 0;
            if (e.hp <= 0) {
              const stats = e.type === EnemyType.MINION ? ENEMY_STATS.MINION : (e.type === EnemyType.RUNNER ? ENEMY_STATS.RUNNER : ENEMY_STATS.BRUTE);
              setScore(s => s + stats.score);
              spawnParticles(e.x, e.z, COLORS.MINION, 5, 50);
            }
          }
        });
      });

      // Cleanup
      projectilesRef.current = projectilesRef.current.filter(pr => {
        const expired = nowSec - pr.birth > PROJECTILE_LIFE || pr.hp <= 0;
        if (expired) {
          const m = projectileMeshesRef.current.get(pr.id);
          if (m) { sceneRef.current.remove(m); projectileMeshesRef.current.delete(pr.id); }
        }
        return !expired;
      });

      enemiesRef.current = enemiesRef.current.filter(e => {
        const dead = e.hp <= 0;
        if (dead) {
          const m = enemyMeshesRef.current.get(e.id);
          if (m) { sceneRef.current.remove(m); enemyMeshesRef.current.delete(e.id); }
        }
        return !dead;
      });

      // Particles
      particlesRef.current.forEach(pt => {
        pt.x += pt.vx * dt;
        pt.y += pt.vy * dt;
        pt.z += pt.vz * dt;
        pt.vy -= 400 * dt; // Gravity
        pt.life += dt;
        const m = particleMeshesRef.current.get(pt.id);
        if (m) {
          m.position.set(pt.x, Math.max(0, pt.y), pt.z);
          m.material.opacity = 1 - pt.life / pt.maxLife;
          m.material.transparent = true;
        }
      });
      particlesRef.current = particlesRef.current.filter(pt => {
        const alive = pt.life < pt.maxLife;
        if (!alive) {
          const m = particleMeshesRef.current.get(pt.id);
          if (m) { sceneRef.current.remove(m); particleMeshesRef.current.delete(pt.id); }
        }
        return alive;
      });

      // Camera Shake
      if (g.shake > 0) {
        cameraRef.current.position.x = ARENA_WIDTH / 2 + (Math.random() - 0.5) * g.shake;
        cameraRef.current.position.z = 720 + (Math.random() - 0.5) * g.shake;
        g.shake *= 0.9;
      } else {
        cameraRef.current.position.x = ARENA_WIDTH / 2;
        cameraRef.current.position.z = 720;
      }
    }

    rendererRef.current.render(sceneRef.current, cameraRef.current);
    requestRef.current = requestAnimationFrame(gameLoop);
  }, [gameState, wave, arrowShootMode]);

  useEffect(() => {
    initScene();
    requestRef.current = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(requestRef.current!);
  }, [initScene, gameLoop]);

  // Input listeners
  useEffect(() => {
    const onKey = (e: KeyboardEvent, down: boolean) => {
      if (down) keysRef.current.add(e.key.toLowerCase());
      else keysRef.current.delete(e.key.toLowerCase());

      if (down && (e.key === 'p' || e.key === 'Escape')) {
        setGameState(prev => prev === GameState.PLAYING ? GameState.PAUSED : prev === GameState.PAUSED ? GameState.PLAYING : prev);
      }
      if (down && e.key === ' ' && (gameState === GameState.MENU || gameState === GameState.GAMEOVER)) {
        startGame();
      }
    };
    const onMouseDown = (e: MouseEvent) => {
      if (gameState !== GameState.PLAYING) return;
      mouseRef.current.down = true;
      updateMousePos(e);
    };
    const onMouseUp = () => mouseRef.current.down = false;
    const onMouseMove = (e: MouseEvent) => updateMousePos(e);
    const updateMousePos = (e: MouseEvent) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      mouseRef.current.x = (e.clientX - rect.left) * (ARENA_WIDTH / rect.width);
      mouseRef.current.y = (e.clientY - rect.top) * (ARENA_HEIGHT / rect.height);
    };

    window.addEventListener('keydown', (e) => onKey(e, true));
    window.addEventListener('keyup', (e) => onKey(e, false));
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('mousemove', onMouseMove);
    return () => {
      window.removeEventListener('keydown', (e) => onKey(e, true));
      window.removeEventListener('keyup', (e) => onKey(e, false));
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, [gameState]);

  const startGame = () => {
    setGameState(GameState.PLAYING);
    setScore(0);
    setWave(1);
    setHp(100);
    playerRef.current = {
      id: 'player',
      x: ARENA_WIDTH / 2,
      z: ARENA_HEIGHT / 2,
      vx: 0,
      vz: 0,
      radius: PLAYER_RADIUS,
      hp: 100,
      lastShootTime: 0,
      invulnerableUntil: 0,
      lean: { x: 0, z: 0 }
    };
    // Clear existing
    enemiesRef.current.forEach(e => {
      const m = enemyMeshesRef.current.get(e.id);
      if (m) sceneRef.current.remove(m);
    });
    enemiesRef.current = [];
    enemyMeshesRef.current.clear();
    
    projectilesRef.current.forEach(p => {
      const m = projectileMeshesRef.current.get(p.id);
      if (m) sceneRef.current.remove(m);
    });
    projectilesRef.current = [];
    projectileMeshesRef.current.clear();

    gameDataRef.current = {
      waveTime: Date.now() / 1000,
      enemiesToSpawn: 0,
      enemiesSpawned: 0,
      lastSpawnTime: 0,
      spawnInterval: 0.55,
      isBreather: true,
      timeScale: 1.0,
      shake: 0,
      lastNearMissTime: 0,
      dilationEnd: 0
    };
  };

  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem(STORAGE_KEYS.HIGH_SCORE, score.toString());
    }
    if (wave > bestWave) {
      setBestWave(wave);
      localStorage.setItem(STORAGE_KEYS.BEST_WAVE, wave.toString());
    }
  }, [score, wave, highScore, bestWave]);

  return (
    <div className="relative w-full h-screen flex items-center justify-center bg-[#0B1B2B]">
      <canvas ref={canvasRef} className="rounded-lg shadow-2xl" width={ARENA_WIDTH} height={ARENA_HEIGHT} />
      
      {gameState === GameState.MENU && (
        <Menu 
          onStart={startGame} 
          arrowShootMode={arrowShootMode} 
          onToggleArrowMode={() => setArrowShootMode(!arrowShootMode)} 
        />
      )}

      {gameState === GameState.PLAYING && (
        <HUD hp={hp} score={score} wave={wave} />
      )}

      {gameState === GameState.PAUSED && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="text-white text-center">
            <h1 className="text-4xl mb-4">PAUSED</h1>
            <p className="text-sm">Press P or Esc to Resume</p>
          </div>
        </div>
      )}

      {gameState === GameState.GAMEOVER && (
        <GameOver 
          score={score} 
          wave={wave} 
          highScore={highScore} 
          bestWave={bestWave} 
          onRetry={startGame} 
        />
      )}
    </div>
  );
};

export default App;