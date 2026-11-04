'use client';

import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { useExhibitionStore } from '@/store/useExhibitionStore';
import { getStageMediaWallTexture, getAuxiliaryStageScreenTexture, getGroundPosterTexture } from '@/lib/screenTextures';
import BoothMesh from './BoothMesh';

/**
 * Animated High-Speed Autonomous Rover that tackles the Elevated Ramp Obstacle Course!
 * Drives up the ascending ramp, crosses the elevated bridge, descends the down ramp,
 * and powers through the turns with live wheel spinning, headlight beams, and roof LiDAR.
 */
function AnimatedRoboRacer({
  timeOffset = 0,
  chassisColor = '#ea580c',
  accentColor = '#38bdf8',
}: {
  timeOffset?: number;
  chassisColor?: string;
  accentColor?: string;
}) {
  const roverRef = useRef<THREE.Group>(null);
  const wheelsRef = useRef<THREE.Group[]>([]);
  const lidarRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }, delta) => {
    if (!roverRef.current) return;

    // Track loop speed with optional phase offset for multi-rover racing
    const t = (clock.getElapsedTime() * 0.85 + timeOffset) % (Math.PI * 2);

    // Parametric stadium circuit (Arena 1 local: X in [-3.2, 3.2], Z in [-3.4, 3.4])
    const a = 2.9; // X amplitude
    const b = 3.6; // Z amplitude

    const cosT = Math.cos(t);
    const sinT = Math.sin(t);

    // Track path coordinates
    const posX = a * Math.sign(cosT) * Math.pow(Math.abs(cosT), 0.72);
    const posZ = b * Math.sign(sinT) * Math.pow(Math.abs(sinT), 0.72);

    // Calculate heading tangent from derivative
    const eps = 0.04;
    const nextCos = Math.cos(t + eps);
    const nextSin = Math.sin(t + eps);
    const nextX = a * Math.sign(nextCos) * Math.pow(Math.abs(nextCos), 0.72);
    const nextZ = b * Math.sign(nextSin) * Math.pow(Math.abs(nextSin), 0.72);

    const dirX = nextX - posX;
    const dirZ = nextZ - posZ;
    const heading = Math.atan2(dirX, dirZ);

    // Dynamic Ramp Physics: North side of the circuit (posZ < -2.2) has the ramp obstacle!
    let posY = 0.45;
    let pitch = 0;

    if (posZ < -2.0) {
      if (posX >= -2.5 && posX < -0.9) {
        // 1. Ascending Ramp (Climbing up)
        const rampProgress = (posX - -2.5) / 1.6;
        posY = 0.45 + rampProgress * 0.65;
        pitch = -0.36; // Nose pitched UP
      } else if (posX >= -0.9 && posX <= 0.9) {
        // 2. Elevated Bridge Deck (Cruising high above track)
        posY = 1.1;
        pitch = 0.0;
      } else if (posX > 0.9 && posX <= 2.5) {
        // 3. Descending Ramp (Sloping down)
        const rampProgress = (posX - 0.9) / 1.6;
        posY = 1.1 - rampProgress * 0.65;
        pitch = 0.36; // Nose pitched DOWN
      }
    }

    roverRef.current.position.set(posX, posY, posZ);
    roverRef.current.rotation.set(pitch, heading, 0);

    // Spin roof LiDAR sensor
    if (lidarRef.current) {
      lidarRef.current.rotation.y += delta * 14;
    }

    // Spin wheels with track speed
    wheelsRef.current.forEach((wheel) => {
      if (wheel) wheel.rotation.x += delta * 18;
    });
  });

  return (
    <group ref={roverRef} castShadow>
      {/* Carbon-Fiber Underbody Floor Pan */}
      <mesh position={[0, 0.055, 0]} castShadow>
        <boxGeometry args={[0.58, 0.03, 1.02]} />
        <meshStandardMaterial color="#090d16" metalness={0.85} roughness={0.2} />
      </mesh>

      {/* Aerodynamic Race Chassis Body */}
      <mesh position={[0, 0.11, -0.02]} castShadow>
        <boxGeometry args={[0.52, 0.12, 0.88]} />
        <meshStandardMaterial color={chassisColor} roughness={0.25} metalness={0.72} />
      </mesh>

      {/* Sculpted Sidepods with Glowing Intake Strips */}
      {[-0.28, 0.28].map((xPod, pIdx) => (
        <group key={pIdx} position={[xPod, 0.09, -0.02]}>
          <mesh castShadow>
            <boxGeometry args={[0.08, 0.09, 0.52]} />
            <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.25} />
          </mesh>
          <mesh position={[0, 0, 0.265]}>
            <boxGeometry args={[0.06, 0.05, 0.01]} />
            <meshBasicMaterial color={accentColor} />
          </mesh>
        </group>
      ))}

      {/* Front Multi-Element Aero Wing & Splitter */}
      <mesh position={[0, 0.04, 0.5]} castShadow>
        <boxGeometry args={[0.64, 0.022, 0.14]} />
        <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[-0.31, 0.065, 0.5]}>
        <boxGeometry args={[0.02, 0.07, 0.16]} />
        <meshStandardMaterial color={chassisColor} metalness={0.7} />
      </mesh>
      <mesh position={[0.31, 0.065, 0.5]}>
        <boxGeometry args={[0.02, 0.07, 0.16]} />
        <meshStandardMaterial color={chassisColor} metalness={0.7} />
      </mesh>

      {/* Cockpit / AI Compute Canopy */}
      <mesh position={[0, 0.21, -0.05]} castShadow>
        <boxGeometry args={[0.36, 0.12, 0.52]} />
        <meshStandardMaterial color="#090d16" roughness={0.15} metalness={0.92} />
      </mesh>

      {/* Rear High-Downforce GT Dual-Plane Wing */}
      <mesh position={[0, 0.33, -0.43]}>
        <boxGeometry args={[0.64, 0.022, 0.16]} />
        <meshStandardMaterial color="#090d16" metalness={0.85} roughness={0.2} />
      </mesh>
      <mesh position={[-0.32, 0.32, -0.43]}>
        <boxGeometry args={[0.02, 0.09, 0.18]} />
        <meshStandardMaterial color={chassisColor} />
      </mesh>
      <mesh position={[0.32, 0.32, -0.43]}>
        <boxGeometry args={[0.02, 0.09, 0.18]} />
        <meshStandardMaterial color={chassisColor} />
      </mesh>
      <mesh position={[-0.2, 0.24, -0.42]}>
        <boxGeometry args={[0.02, 0.16, 0.08]} />
        <meshStandardMaterial color={chassisColor} />
      </mesh>
      <mesh position={[0.2, 0.24, -0.42]}>
        <boxGeometry args={[0.02, 0.16, 0.08]} />
        <meshStandardMaterial color={chassisColor} />
      </mesh>

      {/* Roof Spinning LiDAR Scanner with Projection Ring */}
      <group position={[0, 0.29, 0.04]}>
        <mesh position={[0, 0.025, 0]}>
          <cylinderGeometry args={[0.04, 0.045, 0.05, 12]} />
          <meshStandardMaterial color="#475569" metalness={0.85} />
        </mesh>
        <mesh ref={lidarRef} position={[0, 0.065, 0]}>
          <cylinderGeometry args={[0.062, 0.062, 0.038, 12]} />
          <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={2.2} />
        </mesh>
      </group>

      {/* Glowing Headlights & Projection Cones */}
      <mesh position={[-0.2, 0.1, 0.48]}>
        <sphereGeometry args={[0.038, 8, 8]} />
        <meshBasicMaterial color={accentColor} />
      </mesh>
      <mesh position={[0.2, 0.1, 0.48]}>
        <sphereGeometry args={[0.038, 8, 8]} />
        <meshBasicMaterial color={accentColor} />
      </mesh>
      <mesh position={[-0.2, 0.08, 0.76]} rotation={[Math.PI / 12, 0, 0]}>
        <coneGeometry args={[0.17, 0.58, 12]} />
        <meshBasicMaterial color={accentColor} transparent opacity={0.18} />
      </mesh>
      <mesh position={[0.2, 0.08, 0.76]} rotation={[Math.PI / 12, 0, 0]}>
        <coneGeometry args={[0.17, 0.58, 12]} />
        <meshBasicMaterial color={accentColor} transparent opacity={0.18} />
      </mesh>

      {/* Rear Brake Light Bar & Twin Afterburner Exhausts */}
      <mesh position={[0, 0.14, -0.48]}>
        <boxGeometry args={[0.44, 0.028, 0.02]} />
        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={2.6} />
      </mesh>
      {[-0.1, 0.1].map((xEx, eIdx) => (
        <mesh key={eIdx} position={[xEx, 0.075, -0.49]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.024, 0.028, 0.04, 10]} />
          <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={2.0} />
        </mesh>
      ))}

      {/* 4 Rubber Tires with Multi-Spoke Alloy Rims & Glowing Rim Rings */}
      {[
        [-0.33, 0.085, 0.29, 0],
        [0.33, 0.085, 0.29, 1],
        [-0.33, 0.085, -0.29, 2],
        [0.33, 0.085, -0.29, 3],
      ].map(([x, y, z, idx]) => (
        <group
          key={idx}
          ref={(el) => {
            if (el) wheelsRef.current[idx as number] = el;
          }}
          position={[x as number, y as number, z as number]}
        >
          {/* Tire */}
          <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.095, 0.095, 0.085, 16]} />
            <meshStandardMaterial color="#18181b" roughness={0.75} />
          </mesh>
          {/* Rim */}
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.055, 0.055, 0.088, 10]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.95} roughness={0.15} />
          </mesh>
          {/* Glowing Wheel Hub Ring */}
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.03, 0.03, 0.091, 8]} />
            <meshBasicMaterial color={accentColor} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/**
 * Animated Robo Soccer: Autonomous Robots playing 2v2 soccer on the pitch
 */
function AnimatedRoboSoccer() {
  const strikerRef = useRef<THREE.Group>(null);
  const keeperRef = useRef<THREE.Group>(null);
  const southKeeperRef = useRef<THREE.Group>(null);
  const ballRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    // 5.5-second continuous soccer play cycle
    const time = (clock.getElapsedTime() * 0.9) % 5.5;

    let ballX = 0;
    let ballZ = 0;
    let strikerX = 0;
    let strikerZ = 0;
    let strikerRot = 0;
    let keeperX = 0;

    if (time < 2.2) {
      // Phase 1: Striker dribbles up the pitch towards North goal
      const p = time / 2.2;
      strikerX = -1.0 + p * 0.6;
      strikerZ = 2.5 - p * 3.5;
      strikerRot = Math.atan2(0.6, -3.5);

      ballX = strikerX + Math.sin(strikerRot) * 0.52;
      ballZ = strikerZ + Math.cos(strikerRot) * 0.52;

      keeperX = Math.sin(time * 3) * 0.9;
    } else if (time < 3.2) {
      // Phase 2: Striker takes a shot towards upper-left goal!
      const p = (time - 2.2) / 1.0;
      strikerX = -0.4;
      strikerZ = -1.0;
      strikerRot = -Math.PI;

      ballX = -0.4 + p * -0.9;
      ballZ = -0.5 - p * 4.0;

      keeperX = -0.4 + p * -0.85;
    } else if (time < 4.2) {
      // Phase 3: Keeper saves! Ball rebounds into midfield
      const p = (time - 3.2) / 1.0;
      strikerX = -0.4 + p * 0.8;
      strikerZ = -1.0 + p * 1.5;
      strikerRot = Math.PI * 0.8;

      ballX = -1.25 + p * 1.8;
      ballZ = -4.5 + p * 3.5;

      keeperX = -1.25 + p * 1.25;
    } else {
      // Phase 4: Striker turns around and retrieves rebound
      const p = (time - 4.2) / 1.3;
      strikerX = 0.4 - p * 1.4;
      strikerZ = 0.5 + p * 2.0;
      strikerRot = Math.PI * 0.2;

      ballX = 0.55 - p * 1.55;
      ballZ = -1.0 + p * 3.5;

      keeperX = Math.sin(p * Math.PI) * 0.4;
    }

    if (strikerRef.current) {
      strikerRef.current.position.set(strikerX, 0.48, strikerZ);
      strikerRef.current.rotation.y = strikerRot;
    }

    if (keeperRef.current) {
      keeperRef.current.position.set(keeperX, 0.48, -4.6);
      keeperRef.current.rotation.y = 0;
    }

    if (southKeeperRef.current) {
      southKeeperRef.current.position.set(Math.cos(clock.getElapsedTime() * 1.8) * 0.75, 0.48, 4.4);
      southKeeperRef.current.rotation.y = Math.PI;
    }

    if (ballRef.current) {
      ballRef.current.position.set(ballX, 0.42, ballZ);
      ballRef.current.rotation.x += 0.12;
      ballRef.current.rotation.z += 0.08;
    }
  });

  return (
    <group>
      {/* 1. STRIKER BOT (Team Cyan • S01 StrikerBot) */}
      <group ref={strikerRef} castShadow>
        {/* Tiered Cylindrical Tournament Body */}
        <mesh position={[0, 0.12, 0]} castShadow>
          <cylinderGeometry args={[0.34, 0.37, 0.24, 20]} />
          <meshStandardMaterial color="#0284c7" metalness={0.75} roughness={0.25} />
        </mesh>
        {/* Carbon Armor Top Plate */}
        <mesh position={[0, 0.25, 0]}>
          <cylinderGeometry args={[0.32, 0.32, 0.03, 20]} />
          <meshStandardMaterial color="#0f172a" metalness={0.85} roughness={0.2} />
        </mesh>
        {/* Solenoid Kicker Plate */}
        <mesh position={[0, 0.08, 0.36]}>
          <boxGeometry args={[0.36, 0.12, 0.06]} />
          <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={1.6} />
        </mesh>
        {/* Top Omnidirectional Vision Turret */}
        <mesh position={[0, 0.32, 0.04]} castShadow>
          <sphereGeometry args={[0.11, 14, 14]} />
          <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0.32, 0.13]}>
          <sphereGeometry args={[0.042, 10, 10]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>
        {/* Team Cyan Status Ring */}
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.39, 0.44, 24]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>
        <Text position={[0, 0.58, 0]} fontSize={0.16} color="#38bdf8" anchorX="center" anchorY="middle">
          S01 • STRIKER
        </Text>
      </group>

      {/* 2. NORTH GOALKEEPER BOT (Team Rose • S02 TitanKeeper) */}
      <group ref={keeperRef} castShadow>
        <mesh position={[0, 0.14, 0]} castShadow>
          <boxGeometry args={[0.78, 0.26, 0.42]} />
          <meshStandardMaterial color="#dc2626" metalness={0.75} roughness={0.25} />
        </mesh>
        <mesh position={[0, 0.28, 0]}>
          <boxGeometry args={[0.68, 0.03, 0.34]} />
          <meshStandardMaterial color="#0f172a" metalness={0.85} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0.12, 0.23]}>
          <boxGeometry args={[0.82, 0.18, 0.06]} />
          <meshStandardMaterial color="#f87171" emissive="#dc2626" emissiveIntensity={1.6} />
        </mesh>
        {/* Goal Defense Antennas */}
        {[-0.32, 0.32].map((xAnt, aIdx) => (
          <group key={aIdx} position={[xAnt, 0.35, -0.1]}>
            <mesh>
              <cylinderGeometry args={[0.015, 0.015, 0.22, 8]} />
              <meshStandardMaterial color="#94a3b8" metalness={0.9} />
            </mesh>
            <mesh position={[0, 0.11, 0]}>
              <sphereGeometry args={[0.035, 8, 8]} />
              <meshBasicMaterial color="#f87171" />
            </mesh>
          </group>
        ))}
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.45, 0.5, 24]} />
          <meshBasicMaterial color="#f87171" />
        </mesh>
        <Text position={[0, 0.58, 0]} fontSize={0.16} color="#f87171" anchorX="center" anchorY="middle">
          S02 • KEEPER
        </Text>
      </group>

      {/* 3. SOUTH GOALKEEPER BOT (Team Cyan • S01 Sweeper) */}
      <group ref={southKeeperRef} castShadow>
        <mesh position={[0, 0.13, 0]} castShadow>
          <boxGeometry args={[0.68, 0.24, 0.38]} />
          <meshStandardMaterial color="#0284c7" metalness={0.75} roughness={0.25} />
        </mesh>
        <mesh position={[0, 0.11, 0.21]}>
          <boxGeometry args={[0.72, 0.16, 0.05]} />
          <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={1.5} />
        </mesh>
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.42, 0.46, 24]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>
      </group>

      {/* 4. HIGH-TORQUE ILLUMINATED SOCCER BALL */}
      <mesh ref={ballRef} castShadow>
        <sphereGeometry args={[0.165, 24, 24]} />
        <meshStandardMaterial
          color="#fbbf24"
          emissive="#f59e0b"
          emissiveIntensity={0.45}
          roughness={0.25}
          metalness={0.3}
        />
      </mesh>
    </group>
  );
}

/**
 * Corner Stadium Floodlight Tower Mast for the Robotics Arenas
 */
function ArenaFloodlightTower({
  position,
  rotation = [0, 0, 0],
  glowColor = '#38bdf8',
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  glowColor?: string;
}) {
  return (
    <group position={position} rotation={rotation}>
      {/* Base Anchor Collar */}
      <mesh position={[0, 0.08, 0]}>
        <cylinderGeometry args={[0.1, 0.14, 0.16, 10]} />
        <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.2} />
      </mesh>
      {/* Vertical Truss Mast */}
      <mesh position={[0, 1.35, 0]} castShadow>
        <cylinderGeometry args={[0.045, 0.065, 2.5, 10]} />
        <meshStandardMaterial color="#475569" metalness={0.92} roughness={0.18} />
      </mesh>
      {/* Angled Floodlight Bank Head */}
      <group position={[0, 2.6, 0]} rotation={[0.42, 0, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.56, 0.24, 0.08]} />
          <meshStandardMaterial color="#0f172a" metalness={0.85} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0, 0.045]}>
          <planeGeometry args={[0.5, 0.18]} />
          <meshStandardMaterial color="#ffffff" emissive={glowColor} emissiveIntensity={2.4} />
        </mesh>
      </group>
    </group>
  );
}

export default function Zone3RoboticsArena() {
  const projects = useExhibitionStore((state) => state.projects);
  const zone3Projects = projects.filter((p) => p.zone === 'zone-3');
  const setActiveZone = useExhibitionStore((state) => state.setActiveZone);
  const isMobile = useExhibitionStore((state) => state.isMobile);

  const stageTexture = useMemo(() => {
    if (typeof window === 'undefined') return null;
    return getStageMediaWallTexture();
  }, []);

  const auxStageTexture = useMemo(() => {
    if (typeof window === 'undefined') return null;
    return getAuxiliaryStageScreenTexture();
  }, []);

  const roboticsGroundTexture = useMemo(() => {
    if (typeof window === 'undefined') return null;
    return getGroundPosterTexture('robotics');
  }, []);

  const handleArenaClick = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    setActiveZone('zone-3');
  };

  return (
    <group position={[0, 0, 0]}>
      {/* ======================================================== */}
      {/* GROUND POSTER - ROBOTICS ARENAS LIGHT-BOX                */}
      {/* Perfectly aligned with Physical & Digital banners (x=6.4) */}
      {/* ======================================================== */}
      <group
        position={[6.4, 0.02, -16.5]}
        onClick={handleArenaClick}
        onPointerOver={() => {
          if (!isMobile) document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          if (!isMobile) document.body.style.cursor = 'auto';
        }}
      >
        <mesh receiveShadow>
          <boxGeometry args={[9.08, 0.012, 2.42]} />
          <meshStandardMaterial color="#1e293b" metalness={0.92} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0.004, 0]} receiveShadow>
          <boxGeometry args={[8.8, 0.015, 2.2]} />
          <meshStandardMaterial color="#0b101c" metalness={0.9} roughness={0.25} />
        </mesh>
        <mesh position={[0, 0.009, 0]}>
          <boxGeometry args={[8.9, 0.01, 2.3]} />
          <meshStandardMaterial color="#ef4444" emissive="#dc2626" emissiveIntensity={2.0} />
        </mesh>
        {[
          [-4.36, 0.015, -1.06],
          [4.36, 0.015, -1.06],
          [-4.36, 0.015, 1.06],
          [4.36, 0.015, 1.06],
        ].map(([cx, cy, cz], idx) => (
          <mesh key={idx} position={[cx, cy, cz]}>
            <boxGeometry args={[0.24, 0.008, 0.24]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.12} />
          </mesh>
        ))}
        <mesh position={[0, 0.019, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[8.6, 2.05]} />
          {roboticsGroundTexture && (
            <meshStandardMaterial
              map={roboticsGroundTexture}
              emissive="#ffffff"
              emissiveMap={roboticsGroundTexture}
              emissiveIntensity={1.2}
              roughness={0.2}
              toneMapped={false}
            />
          )}
        </mesh>
      </group>

      {/* ======================================================== */}
      {/* 1. LEFT ARENA: ROBO SPEEDWAY CIRCUIT WITH REAL RAMPS     */}
      {/* Perfectly aligned and balanced (x = 3.0, z = -25.5)      */}
      {/* ======================================================== */}
      <group
        position={[3.0, 0, -25.5]}
        onClick={handleArenaClick}
        onPointerOver={(e) => {
          if (!isMobile) {
            e.stopPropagation();
            document.body.style.cursor = 'pointer';
          }
        }}
        onPointerOut={() => {
          if (!isMobile) {
            document.body.style.cursor = 'auto';
          }
        }}
      >
        {/* Arena Floodlights illuminating the track */}
        <pointLight position={[0, 4.5, 0]} intensity={4.5} distance={14} color="#ffffff" decay={2} />
        <spotLight
          position={[-3, 6, -3]}
          target-position={[-0.5, 1, -3.2]}
          intensity={5.0}
          distance={15}
          angle={0.6}
          color="#fffdf7"
        />

        {/* Sculpted Multi-Tier Platform Base Dais with Glowing Crimson Skirt */}
        <mesh position={[0, 0.14, 0]} receiveShadow castShadow>
          <boxGeometry args={[10.6, 0.28, 11.6]} />
          <meshStandardMaterial color="#0b111e" metalness={0.8} roughness={0.25} />
        </mesh>
        <mesh position={[0, 0.29, 0]}>
          <boxGeometry args={[10.46, 0.02, 11.46]} />
          <meshStandardMaterial color="#f87171" emissive="#dc2626" emissiveIntensity={1.4} />
        </mesh>

        {/* 4 Corner Stadium Floodlight Towers */}
        <ArenaFloodlightTower position={[-4.85, 0.3, -5.35]} rotation={[0, Math.PI / 4, 0]} glowColor="#fbbf24" />
        <ArenaFloodlightTower position={[4.85, 0.3, -5.35]} rotation={[0, -Math.PI / 4, 0]} glowColor="#fbbf24" />
        <ArenaFloodlightTower position={[-4.85, 0.3, 5.35]} rotation={[0, (Math.PI * 3) / 4, 0]} glowColor="#f87171" />
        <ArenaFloodlightTower position={[4.85, 0.3, 5.35]} rotation={[0, (-Math.PI * 3) / 4, 0]} glowColor="#f87171" />

        {/* Green Turf Infield & Surrounds */}
        <mesh position={[0, 0.31, 0]} receiveShadow>
          <boxGeometry args={[10.0, 0.02, 11.0]} />
          <meshStandardMaterial color="#065f46" roughness={0.7} />
        </mesh>

        {/* Ground Asphalt Circuit Track */}
        <mesh position={[0, 0.32, 0]} receiveShadow>
          <boxGeometry args={[9.0, 0.015, 10.0]} />
          <meshStandardMaterial color="#1b2230" roughness={0.78} />
        </mesh>

        {/* Crisp White Outer & Inner Track Lane Lines */}
        <mesh position={[0, 0.329, -4.75]}>
          <boxGeometry args={[8.5, 0.004, 0.05]} />
          <meshBasicMaterial color="#e2e8f0" />
        </mesh>
        <mesh position={[0, 0.329, 4.75]}>
          <boxGeometry args={[8.5, 0.004, 0.05]} />
          <meshBasicMaterial color="#e2e8f0" />
        </mesh>
        <mesh position={[-4.25, 0.329, 0]}>
          <boxGeometry args={[0.05, 0.004, 9.5]} />
          <meshBasicMaterial color="#e2e8f0" />
        </mesh>
        <mesh position={[4.25, 0.329, 0]}>
          <boxGeometry args={[0.05, 0.004, 9.5]} />
          <meshBasicMaterial color="#e2e8f0" />
        </mesh>

        {/* Checkered Start / Finish Line Strip on Asphalt */}
        <group position={[0, 0.33, 3.6]}>
          {[-3.2, -2.8, -2.4, -2.0, 2.0, 2.4, 2.8, 3.2].map((xCheck, cIdx) => (
            <mesh key={cIdx} position={[xCheck, 0, 0]}>
              <boxGeometry args={[0.2, 0.004, 0.28]} />
              <meshBasicMaterial color={cIdx % 2 === 0 ? '#ffffff' : '#ef4444'} />
            </mesh>
          ))}
        </group>

        {/* Track Apex Kerbs (Red & White Racing Rumble Strips on Turn Apices) */}
        {[
          [-3.8, 0.33, -3.8],
          [3.8, 0.33, -3.8],
          [-3.8, 0.33, 3.8],
          [3.8, 0.33, 3.8],
        ].map(([kx, ky, kz], idx) => (
          <group key={idx} position={[kx, ky, kz]}>
            <mesh>
              <boxGeometry args={[1.25, 0.02, 1.25]} />
              <meshStandardMaterial color="#ef4444" roughness={0.45} />
            </mesh>
            <mesh position={[0, 0.003, 0]}>
              <boxGeometry args={[0.85, 0.02, 0.85]} />
              <meshStandardMaterial color="#f8fafc" roughness={0.45} />
            </mesh>
            <mesh position={[0, 0.006, 0]}>
              <boxGeometry args={[0.45, 0.02, 0.45]} />
              <meshStandardMaterial color="#ef4444" roughness={0.45} />
            </mesh>
          </group>
        ))}

        {/* 
          THE 3D RAMP OBSTACLE BRIDGE (Along the North Straightaway at z = -3.4):
          - Up-Ramp from x = -2.5 to x = -0.9 (rising from 0.32 to 1.0)
          - Flat Bridge Deck from x = -0.9 to x = 0.9 (at height 1.0)
          - Descending Down-Ramp from x = 0.9 to x = 2.5 (sloping from 1.0 to 0.32)
        */}
        <group position={[0, 0, -3.4]}>
          {/* Ascending Up-Ramp (West side) */}
          <group position={[-1.7, 0.64, 0]} rotation={[0, 0, 0.38]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[1.75, 0.06, 1.24]} />
              <meshStandardMaterial color="#334155" roughness={0.35} metalness={0.45} />
            </mesh>
            {/* High-Grip Deck with Glowing Guide Rails */}
            <mesh position={[0, 0.035, 0]}>
              <boxGeometry args={[1.7, 0.01, 1.15]} />
              <meshStandardMaterial color="#f59e0b" roughness={0.55} />
            </mesh>
            <mesh position={[0, 0.08, -0.59]}>
              <boxGeometry args={[1.75, 0.1, 0.04]} />
              <meshStandardMaterial color="#ef4444" emissive="#dc2626" emissiveIntensity={0.8} />
            </mesh>
            <mesh position={[0, 0.08, 0.59]}>
              <boxGeometry args={[1.75, 0.1, 0.04]} />
              <meshStandardMaterial color="#ef4444" emissive="#dc2626" emissiveIntensity={0.8} />
            </mesh>
          </group>

          {/* Elevated Central Bridge Platform */}
          <group position={[0, 0.96, 0]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[1.85, 0.08, 1.24]} />
              <meshStandardMaterial color="#1e293b" roughness={0.3} metalness={0.6} />
            </mesh>
            {/* Top Deck Line */}
            <mesh position={[0, 0.045, 0]}>
              <boxGeometry args={[1.8, 0.01, 1.15]} />
              <meshStandardMaterial color="#f59e0b" roughness={0.5} />
            </mesh>
            {/* Safety Handrails with Neon Top Bar */}
            <mesh position={[0, 0.12, -0.59]}>
              <boxGeometry args={[1.85, 0.16, 0.04]} />
              <meshStandardMaterial color="#ef4444" emissive="#dc2626" emissiveIntensity={1.0} />
            </mesh>
            <mesh position={[0, 0.12, 0.59]}>
              <boxGeometry args={[1.85, 0.16, 0.04]} />
              <meshStandardMaterial color="#ef4444" emissive="#dc2626" emissiveIntensity={1.0} />
            </mesh>
            {/* Structural Steel I-Beam Trusses Beneath Bridge */}
            {[-0.8, 0.8].map((legX, i) => (
              <mesh key={i} position={[legX, -0.32, 0]} castShadow>
                <boxGeometry args={[0.09, 0.56, 1.18]} />
                <meshStandardMaterial color="#475569" metalness={0.9} roughness={0.2} />
              </mesh>
            ))}
          </group>

          {/* Descending Down-Ramp (East side) */}
          <group position={[1.7, 0.64, 0]} rotation={[0, 0, -0.38]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[1.75, 0.06, 1.24]} />
              <meshStandardMaterial color="#334155" roughness={0.35} metalness={0.45} />
            </mesh>
            <mesh position={[0, 0.035, 0]}>
              <boxGeometry args={[1.7, 0.01, 1.15]} />
              <meshStandardMaterial color="#f59e0b" roughness={0.55} />
            </mesh>
            <mesh position={[0, 0.08, -0.59]}>
              <boxGeometry args={[1.75, 0.1, 0.04]} />
              <meshStandardMaterial color="#ef4444" emissive="#dc2626" emissiveIntensity={0.8} />
            </mesh>
            <mesh position={[0, 0.08, 0.59]}>
              <boxGeometry args={[1.75, 0.1, 0.04]} />
              <meshStandardMaterial color="#ef4444" emissive="#dc2626" emissiveIntensity={0.8} />
            </mesh>
          </group>
        </group>

        {/* Center Island Telemetry Control Hub */}
        <group position={[0, 0.5, 0.4]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[3.6, 0.38, 3.8]} />
            <meshStandardMaterial color="#0f172a" roughness={0.35} metalness={0.6} />
          </mesh>
          <mesh position={[0, 0.2, 0]}>
            <boxGeometry args={[3.7, 0.04, 3.9]} />
            <meshStandardMaterial color="#f59e0b" emissive="#d97706" emissiveIntensity={1.4} />
          </mesh>
          {/* Central Telemetry Beacon Pylon on Infield Island */}
          <mesh position={[0, 0.42, 0]} castShadow>
            <cylinderGeometry args={[0.28, 0.36, 0.42, 16]} />
            <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0.66, 0]}>
            <cylinderGeometry args={[0.18, 0.18, 0.08, 16]} />
            <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={2.0} />
          </mesh>
        </group>

        {/* Outer Crimson & Polycarbonate Crash Safety Walls */}
        <mesh position={[0, 0.48, -5.5]}>
          <boxGeometry args={[10.0, 0.34, 0.07]} />
          <meshStandardMaterial color="#ef4444" emissive="#dc2626" emissiveIntensity={0.9} />
        </mesh>
        <mesh position={[0, 0.48, 5.5]}>
          <boxGeometry args={[10.0, 0.34, 0.07]} />
          <meshStandardMaterial color="#ef4444" emissive="#dc2626" emissiveIntensity={0.9} />
        </mesh>
        <mesh position={[-5.0, 0.48, 0]}>
          <boxGeometry args={[0.07, 0.34, 11.0]} />
          <meshStandardMaterial color="#ef4444" emissive="#dc2626" emissiveIntensity={0.9} />
        </mesh>
        <mesh position={[5.0, 0.48, 0]}>
          <boxGeometry args={[0.07, 0.34, 11.0]} />
          <meshStandardMaterial color="#ef4444" emissive="#dc2626" emissiveIntensity={0.9} />
        </mesh>

        {/* Flat Arena Floor Plaque */}
        <group position={[0, 0.325, 5.2]} rotation={[-Math.PI / 2, 0, 0]}>
          <mesh>
            <planeGeometry args={[7.2, 0.32]} />
            <meshStandardMaterial color="#0b101c" roughness={0.2} />
          </mesh>
          <Text position={[0, 0, 0.01]} fontSize={0.16} color="#f87171" anchorX="center" anchorY="middle" letterSpacing={0.06}>
            ARENA 1 • ROBO SPEEDWAY & RAMP CIRCUIT
          </Text>
        </group>

        {/* Start / Finish Gantry Arch with F1 Race Start Lights */}
        <group position={[0, 0.32, 3.6]}>
          <mesh position={[-3.6, 1.1, 0]} castShadow>
            <boxGeometry args={[0.16, 2.2, 0.16]} />
            <meshStandardMaterial color="#ef4444" metalness={0.6} roughness={0.3} />
          </mesh>
          <mesh position={[3.6, 1.1, 0]} castShadow>
            <boxGeometry args={[0.16, 2.2, 0.16]} />
            <meshStandardMaterial color="#ef4444" metalness={0.6} roughness={0.3} />
          </mesh>
          <mesh position={[0, 2.1, 0]} castShadow>
            <boxGeometry args={[7.4, 0.38, 0.18]} />
            <meshStandardMaterial color="#0f172a" metalness={0.85} roughness={0.2} />
          </mesh>
          {/* 5 Race Start Signal Pods */}
          {[-1.2, -0.6, 0, 0.6, 1.2].map((xLight, lIdx) => (
            <mesh key={lIdx} position={[xLight, 1.86, 0.08]}>
              <sphereGeometry args={[0.045, 10, 10]} />
              <meshBasicMaterial color={lIdx < 3 ? '#ef4444' : '#22c55e'} />
            </mesh>
          ))}
          <Text position={[0, 2.1, 0.1]} fontSize={0.14} color="#fbbf24" anchorX="center" anchorY="middle" letterSpacing={0.08}>
            START / FINISH • RAMP OBSTACLE READY
          </Text>
        </group>

        {/* 2 Animated Racing Robot Rovers tackling the ramps head-to-head! */}
        <AnimatedRoboRacer timeOffset={0} chassisColor="#ea580c" accentColor="#38bdf8" />
        <AnimatedRoboRacer timeOffset={Math.PI} chassisColor="#dc2626" accentColor="#fbbf24" />
      </group>

      {/* ======================================================== */}
      {/* 2. RIGHT ARENA: ROBO SOCCER STADIUM (x = 17.8, z = -25.5) */}
      {/* Perfectly aligned with East side (opposite of Show & Tell)*/}
      {/* ======================================================== */}
      <group
        position={[17.8, 0, -25.5]}
        onClick={handleArenaClick}
        onPointerOver={(e) => {
          if (!isMobile) {
            e.stopPropagation();
            document.body.style.cursor = 'pointer';
          }
        }}
        onPointerOut={() => {
          if (!isMobile) {
            document.body.style.cursor = 'auto';
          }
        }}
      >
        {/* Stadium Pitch Floodlights */}
        <pointLight position={[0, 4.5, 0]} intensity={4.5} distance={14} color="#ffffff" decay={2} />
        <spotLight
          position={[0, 6, 0]}
          target-position={[0, 0.35, 0]}
          intensity={5.0}
          distance={15}
          angle={0.7}
          color="#f0fdf4"
        />

        {/* Sculpted Multi-Tier Platform Base with Glowing Emerald Skirt */}
        <mesh position={[0, 0.14, 0]} receiveShadow castShadow>
          <boxGeometry args={[10.6, 0.28, 11.6]} />
          <meshStandardMaterial color="#0b111e" metalness={0.8} roughness={0.25} />
        </mesh>
        <mesh position={[0, 0.29, 0]}>
          <boxGeometry args={[10.46, 0.02, 11.46]} />
          <meshStandardMaterial color="#34d399" emissive="#059669" emissiveIntensity={1.4} />
        </mesh>

        {/* 4 Corner Stadium Floodlight Towers */}
        <ArenaFloodlightTower position={[-4.85, 0.3, -5.35]} rotation={[0, Math.PI / 4, 0]} glowColor="#34d399" />
        <ArenaFloodlightTower position={[4.85, 0.3, -5.35]} rotation={[0, -Math.PI / 4, 0]} glowColor="#34d399" />
        <ArenaFloodlightTower position={[-4.85, 0.3, 5.35]} rotation={[0, (Math.PI * 3) / 4, 0]} glowColor="#38bdf8" />
        <ArenaFloodlightTower position={[4.85, 0.3, 5.35]} rotation={[0, (-Math.PI * 3) / 4, 0]} glowColor="#38bdf8" />

        {/* Green Astroturf */}
        <mesh position={[0, 0.31, 0]} receiveShadow>
          <boxGeometry args={[10.0, 0.02, 11.0]} />
          <meshStandardMaterial color="#059669" roughness={0.68} />
        </mesh>

        {/* Subtle Alternating Turf Mowing Stripes */}
        {[-3.6, -1.2, 1.2, 3.6].map((zStripe, sIdx) => (
          <mesh key={sIdx} position={[0, 0.321, zStripe]} receiveShadow>
            <boxGeometry args={[9.0, 0.002, 1.1]} />
            <meshStandardMaterial color="#047857" roughness={0.7} />
          </mesh>
        ))}

        {/* Regulation Pitch Markings */}
        <mesh position={[0, 0.325, 0]}>
          <boxGeometry args={[9.0, 0.005, 0.06]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.325, 0]}>
          <ringGeometry args={[1.2, 1.26, 32]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        {/* Touchlines & Goal Lines */}
        <mesh position={[-4.5, 0.325, 0]}>
          <boxGeometry args={[0.05, 0.005, 9.6]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        <mesh position={[4.5, 0.325, 0]}>
          <boxGeometry args={[0.05, 0.005, 9.6]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        {/* Penalty Area Outlines */}
        <mesh position={[0, 0.325, -3.9]}>
          <boxGeometry args={[4.2, 0.005, 0.05]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        <mesh position={[-2.1, 0.325, -4.35]}>
          <boxGeometry args={[0.05, 0.005, 0.9]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        <mesh position={[2.1, 0.325, -4.35]}>
          <boxGeometry args={[0.05, 0.005, 0.9]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        <mesh position={[0, 0.325, 3.9]}>
          <boxGeometry args={[4.2, 0.005, 0.05]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        <mesh position={[-2.1, 0.325, 4.35]}>
          <boxGeometry args={[0.05, 0.005, 0.9]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        <mesh position={[2.1, 0.325, 4.35]}>
          <boxGeometry args={[0.05, 0.005, 0.9]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>

        {/* Corner Flags */}
        {[
          [-4.5, 0.33, -5.0],
          [4.5, 0.33, -5.0],
          [-4.5, 0.33, 5.0],
          [4.5, 0.33, 5.0],
        ].map(([cx, cy, cz], idx) => (
          <group key={idx} position={[cx, cy, cz]}>
            <mesh position={[0, 0.25, 0]}>
              <cylinderGeometry args={[0.015, 0.015, 0.5, 8]} />
              <meshStandardMaterial color="#ffffff" />
            </mesh>
            <mesh position={[0.06, 0.44, 0]}>
              <boxGeometry args={[0.12, 0.08, 0.01]} />
              <meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={0.8} />
            </mesh>
          </group>
        ))}

        {/* Full 4-Sided Tempered Glass Stadium Perimeter Walls */}
        <mesh position={[0, 0.52, -5.5]}>
          <boxGeometry args={[10.0, 0.42, 0.05]} />
          <meshStandardMaterial color="#10b981" transparent opacity={0.32} metalness={0.9} roughness={0.1} />
        </mesh>
        <mesh position={[0, 0.52, 5.5]}>
          <boxGeometry args={[10.0, 0.42, 0.05]} />
          <meshStandardMaterial color="#10b981" transparent opacity={0.32} metalness={0.9} roughness={0.1} />
        </mesh>
        <mesh position={[-5.0, 0.52, 0]}>
          <boxGeometry args={[0.05, 0.42, 11.0]} />
          <meshStandardMaterial color="#10b981" transparent opacity={0.28} metalness={0.9} roughness={0.1} />
        </mesh>
        <mesh position={[5.0, 0.52, 0]}>
          <boxGeometry args={[0.05, 0.42, 11.0]} />
          <meshStandardMaterial color="#10b981" transparent opacity={0.28} metalness={0.9} roughness={0.1} />
        </mesh>

        {/* Flat Arena Floor Plaque */}
        <group position={[0, 0.325, 5.2]} rotation={[-Math.PI / 2, 0, 0]}>
          <mesh>
            <planeGeometry args={[7.2, 0.32]} />
            <meshStandardMaterial color="#0b101c" roughness={0.2} />
          </mesh>
          <Text position={[0, 0, 0.01]} fontSize={0.16} color="#34d399" anchorX="center" anchorY="middle" letterSpacing={0.06}>
            ARENA 2 • ROBO SOCCER PITCH • 2v2 MATCH
          </Text>
        </group>

        {/* North Goalpost (Cyan) with Tubular Crossbar & Goal Net Cage */}
        <group position={[0, 0.32, -4.8]}>
          <mesh position={[-1.1, 0.5, 0]}>
            <cylinderGeometry args={[0.038, 0.038, 1.0, 12]} />
            <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={1.2} />
          </mesh>
          <mesh position={[1.1, 0.5, 0]}>
            <cylinderGeometry args={[0.038, 0.038, 1.0, 12]} />
            <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={1.2} />
          </mesh>
          <mesh position={[0, 1.0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.038, 0.038, 2.24, 12]} />
            <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={1.2} />
          </mesh>
          {/* Translucent Goal Netting Box */}
          <mesh position={[0, 0.5, -0.25]}>
            <boxGeometry args={[2.18, 0.96, 0.48]} />
            <meshStandardMaterial color="#38bdf8" transparent opacity={0.18} wireframe />
          </mesh>
        </group>

        {/* South Goalpost (Rose) with Tubular Crossbar & Goal Net Cage */}
        <group position={[0, 0.32, 4.8]}>
          <mesh position={[-1.1, 0.5, 0]}>
            <cylinderGeometry args={[0.038, 0.038, 1.0, 12]} />
            <meshStandardMaterial color="#f87171" emissive="#dc2626" emissiveIntensity={1.2} />
          </mesh>
          <mesh position={[1.1, 0.5, 0]}>
            <cylinderGeometry args={[0.038, 0.038, 1.0, 12]} />
            <meshStandardMaterial color="#f87171" emissive="#dc2626" emissiveIntensity={1.2} />
          </mesh>
          <mesh position={[0, 1.0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.038, 0.038, 2.24, 12]} />
            <meshStandardMaterial color="#f87171" emissive="#dc2626" emissiveIntensity={1.2} />
          </mesh>
          <mesh position={[0, 0.5, 0.25]}>
            <boxGeometry args={[2.18, 0.96, 0.48]} />
            <meshStandardMaterial color="#f87171" transparent opacity={0.18} wireframe />
          </mesh>
        </group>

        {/* Animated Robots Playing Soccer in Real-Time! */}
        <AnimatedRoboSoccer />
      </group>

      {/* ======================================================== */}
      {/* 3. HIGH-END AUDITORIUM KEYNOTE STAGE & CONCERT TRUSS RIG */}
      {/* (North Wall at x = 10.4, z = -32.5)                      */}
      {/* ======================================================== */}
      <group position={[10.4, 0, -32.5]}>
        {/* Lower Anodized Stage Base Skirt */}
        <mesh position={[0, 0.08, 0]} receiveShadow castShadow>
          <boxGeometry args={[30.8, 0.16, 4.4]} />
          <meshStandardMaterial color="#090d16" metalness={0.85} roughness={0.2} />
        </mesh>

        {/* Stage Deck Riser Platform (Warm Architectural Wood) */}
        <mesh position={[0, 0.28, 0]} receiveShadow castShadow>
          <boxGeometry args={[30.5, 0.32, 4.2]} />
          <meshStandardMaterial color="#9a7049" roughness={0.32} metalness={0.12} />
        </mesh>

        {/* Front Step Edge with Warm Underglow LED Strip */}
        <mesh position={[0, 0.22, 2.12]}>
          <boxGeometry args={[30.5, 0.04, 0.04]} />
          <meshStandardMaterial color="#f59e0b" emissive="#d97706" emissiveIntensity={2.0} />
        </mesh>

        {/* Left & Right Illuminated Stage Access Stairs */}
        {[-15.8, 15.8].map((xStair, sIdx) => (
          <group key={sIdx} position={[xStair, 0, 1.1]}>
            <mesh position={[0, 0.08, 0.4]} castShadow receiveShadow>
              <boxGeometry args={[1.1, 0.16, 0.8]} />
              <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.3} />
            </mesh>
            <mesh position={[0, 0.2, -0.2]} castShadow receiveShadow>
              <boxGeometry args={[1.1, 0.32, 0.8]} />
              <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.3} />
            </mesh>
            <mesh position={[0, 0.165, 0.81]}>
              <boxGeometry args={[1.05, 0.02, 0.02]} />
              <meshBasicMaterial color="#fbbf24" />
            </mesh>
          </group>
        ))}

        {/* 4 Angled Stage Floor Monitor Wedges Along Front Edge */}
        {[-8.0, -3.2, 3.2, 8.0].map((xMon, mIdx) => (
          <group key={mIdx} position={[xMon, 0.48, 1.85]} rotation={[-0.35, 0, 0]}>
            <mesh castShadow>
              <boxGeometry args={[0.65, 0.22, 0.34]} />
              <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.25} />
            </mesh>
            <mesh position={[0, 0.115, 0]}>
              <boxGeometry args={[0.55, 0.01, 0.02]} />
              <meshBasicMaterial color="#38bdf8" />
            </mesh>
          </group>
        ))}

        {/* Executive Keynote Presentation Podium + Teleprompters */}
        <group position={[0, 0.44, 1.2]}>
          {/* Podium Base Plinth */}
          <mesh position={[0, 0.04, 0]}>
            <boxGeometry args={[1.36, 0.08, 0.78]} />
            <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.2} />
          </mesh>
          {/* Sculpted Lectern Body */}
          <mesh position={[0, 0.56, 0]} castShadow>
            <boxGeometry args={[1.2, 1.05, 0.65]} />
            <meshStandardMaterial color="#0f172a" metalness={0.85} roughness={0.2} />
          </mesh>
          {/* Slanted Top Reading Deck */}
          <mesh position={[0, 1.1, -0.02]} rotation={[0.18, 0, 0]}>
            <boxGeometry args={[1.28, 0.04, 0.72]} />
            <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.18} />
          </mesh>
          {/* Edge-lit DPS Emblem Plate */}
          <mesh position={[0, 0.58, 0.33]}>
            <boxGeometry args={[0.82, 0.46, 0.02]} />
            <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={1.6} />
          </mesh>
          {/* Dual Chrome Gooseneck Microphones */}
          {[-0.22, 0.22].map((xMic, micIdx) => (
            <mesh key={micIdx} position={[xMic, 1.22, 0.1]} rotation={[-0.3, 0, 0]}>
              <cylinderGeometry args={[0.008, 0.008, 0.24, 8]} />
              <meshStandardMaterial color="#e2e8f0" metalness={0.98} roughness={0.1} />
            </mesh>
          ))}
        </group>

        {/* ====================================================== */}
        {/* OVERHEAD CONCERT BOX-TRUSS GANTRY & LINE-ARRAY SPEAKERS */}
        {/* ====================================================== */}
        <group position={[0, 0, 0.2]}>
          {/* Left & Right Vertical Truss Towers */}
          {[-13.5, 13.5].map((xTower, tIdx) => (
            <group key={tIdx} position={[xTower, 3.3, 0]}>
              <mesh castShadow>
                <boxGeometry args={[0.38, 6.4, 0.38]} />
                <meshStandardMaterial color="#334155" metalness={0.92} roughness={0.18} />
              </mesh>
              <mesh position={[0, 0, 0.2]}>
                <boxGeometry args={[0.04, 6.2, 0.02]} />
                <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={1.5} />
              </mesh>
            </group>
          ))}

          {/* Overhead Horizontal Box-Truss Bridge */}
          <mesh position={[0, 6.42, 0]} castShadow>
            <boxGeometry args={[27.6, 0.36, 0.36]} />
            <meshStandardMaterial color="#475569" metalness={0.92} roughness={0.18} />
          </mesh>

          {/* 8 Concert Moving-Head Spotlight Fixtures on Overhead Truss */}
          {[-10.5, -7.5, -4.5, -1.5, 1.5, 4.5, 7.5, 10.5].map((xSpot, spIdx) => (
            <group key={spIdx} position={[xSpot, 6.1, 0.12]}>
              <mesh>
                <cylinderGeometry args={[0.1, 0.12, 0.24, 12]} />
                <meshStandardMaterial color="#0f172a" metalness={0.85} roughness={0.2} />
              </mesh>
              <mesh position={[0, -0.13, 0.03]}>
                <circleGeometry args={[0.08, 12]} />
                <meshBasicMaterial color={spIdx % 2 === 0 ? '#fef08a' : '#38bdf8'} />
              </mesh>
            </group>
          ))}

          {/* Left & Right Suspended Line-Array Concert Speaker Clusters */}
          {[-12.2, 12.2].map((xArr, aIdx) => (
            <group key={aIdx} position={[xArr, 5.4, 0.35]} rotation={[0.15, aIdx === 0 ? 0.18 : -0.18, 0]}>
              {[0, -0.24, -0.48, -0.72].map((yCab, cIdx) => (
                <mesh key={cIdx} position={[0, yCab, cIdx * 0.03]} castShadow>
                  <boxGeometry args={[0.85, 0.2, 0.45]} />
                  <meshStandardMaterial color="#090d16" metalness={0.8} roughness={0.25} />
                </mesh>
              ))}
            </group>
          ))}
        </group>

        {/* 
          Acoustic Oak Wood Paneling & Horizontal Reveal Wall (Directly from Image 2!)
          Flanks the stage with rich architectural timber grain, horizontal reveals, and recessed warm sconces.
        */}
        <group position={[0, 4.2, -0.9]}>
          <mesh receiveShadow>
            <boxGeometry args={[32.4, 8.4, 0.3]} />
            <meshStandardMaterial color="#8b5e34" roughness={0.42} metalness={0.08} />
          </mesh>
          {/* Horizontal Brushed Aluminum Reveals */}
          {[-3.0, -1.5, 0.0, 1.5, 3.0].map((yRev, idx) => (
            <mesh key={idx} position={[0, yRev, 0.16]}>
              <boxGeometry args={[32.3, 0.03, 0.02]} />
              <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.15} />
            </mesh>
          ))}
          {/* Architectural Linear Wall Sconces with Warm Indirect Wash */}
          {[-15.2, -10.5, 10.5, 15.2].map((xSconce, idx) => (
            <group key={idx} position={[xSconce, 1.2, 0.18]}>
              <mesh>
                <boxGeometry args={[0.08, 0.65, 0.05]} />
                <meshStandardMaterial color="#0f172a" metalness={0.8} />
              </mesh>
              <mesh position={[0, 0, 0.03]}>
                <boxGeometry args={[0.04, 0.58, 0.02]} />
                <meshStandardMaterial color="#fed7aa" emissive="#f97316" emissiveIntensity={1.8} />
              </mesh>
              <pointLight position={[0, 0, 0.4]} intensity={2.2} distance={6} color="#fef3c7" decay={2} />
            </group>
          ))}
        </group>

        {/* Center Main Ultra-Wide LED Media Wall (World Map & Live Telemetry from Image 2!) */}
        <group position={[0, 3.4, -0.6]}>
          {/* Outer Titanium Structural Surround */}
          <mesh position={[0, 0, -0.04]} castShadow>
            <boxGeometry args={[26.5, 5.65, 0.18]} />
            <meshStandardMaterial color="#1e293b" metalness={0.92} roughness={0.18} />
          </mesh>
          {/* Beveled Matte-Black Frame */}
          <mesh castShadow>
            <boxGeometry args={[26.2, 5.4, 0.2]} />
            <meshStandardMaterial color="#050811" metalness={0.92} roughness={0.15} />
          </mesh>
          {/* High-Resolution Keynote LED Display Face */}
          <mesh position={[0, 0, 0.11]}>
            <planeGeometry args={[25.8, 5.1]} />
            {stageTexture ? (
              <meshStandardMaterial
                map={stageTexture}
                emissive="#ffffff"
                emissiveMap={stageTexture}
                emissiveIntensity={1.05}
                roughness={0.18}
                toneMapped={false}
              />
            ) : (
              <meshStandardMaterial color="#071228" emissive="#0284c7" emissiveIntensity={0.8} />
            )}
          </mesh>
        </group>

        {/* Left & Right Angled Stage Wing Screens (Auxiliary Summit Info from Image 2!) */}
        <group position={[-14.5, 3.4, 0.3]} rotation={[0, 0.32, 0]}>
          <mesh castShadow>
            <boxGeometry args={[3.2, 5.4, 0.15]} />
            <meshStandardMaterial color="#050811" metalness={0.9} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0, 0.08]}>
            <planeGeometry args={[3.0, 5.1]} />
            {auxStageTexture ? (
              <meshStandardMaterial
                map={auxStageTexture}
                emissive="#ffffff"
                emissiveMap={auxStageTexture}
                emissiveIntensity={1.0}
                roughness={0.2}
                toneMapped={false}
              />
            ) : (
              <meshStandardMaterial color="#08142c" emissive="#0284c7" emissiveIntensity={0.5} />
            )}
          </mesh>
          <mesh position={[0, 0, 0.085]}>
            <boxGeometry args={[3.04, 0.04, 0.01]} />
            <meshBasicMaterial color="#38bdf8" />
          </mesh>
        </group>

        <group position={[14.5, 3.4, 0.3]} rotation={[0, -0.32, 0]}>
          <mesh castShadow>
            <boxGeometry args={[3.2, 5.4, 0.15]} />
            <meshStandardMaterial color="#050811" metalness={0.9} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0, 0.08]}>
            <planeGeometry args={[3.0, 5.1]} />
            {auxStageTexture ? (
              <meshStandardMaterial
                map={auxStageTexture}
                emissive="#ffffff"
                emissiveMap={auxStageTexture}
                emissiveIntensity={1.0}
                roughness={0.2}
                toneMapped={false}
              />
            ) : (
              <meshStandardMaterial color="#08142c" emissive="#0284c7" emissiveIntensity={0.5} />
            )}
          </mesh>
          <mesh position={[0, 0, 0.085]}>
            <boxGeometry args={[3.04, 0.04, 0.01]} />
            <meshBasicMaterial color="#fbbf24" />
          </mesh>
        </group>

        {/* Suspended Ceiling Presentation Projector (from Image 2!) */}
        <group position={[0, 7.8, 4.5]}>
          {/* Ceiling Mounting Flange */}
          <mesh position={[0, 0.15, 0]}>
            <cylinderGeometry args={[0.15, 0.15, 0.04, 16]} />
            <meshStandardMaterial color="#334155" metalness={0.8} />
          </mesh>
          {/* Steel Suspension Downrod */}
          <mesh position={[0, -0.6, 0]}>
            <cylinderGeometry args={[0.025, 0.025, 1.2, 10]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.95} />
          </mesh>
          {/* Projector Chassis */}
          <mesh position={[0, -1.25, 0]} castShadow>
            <boxGeometry args={[0.9, 0.32, 0.7]} />
            <meshStandardMaterial color="#f1f5f9" roughness={0.3} metalness={0.5} />
          </mesh>
          {/* Projector Glass Lens (Facing North toward Stage Screen) */}
          <mesh position={[0, -1.25, -0.36]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.08, 0.08, 0.04, 16]} />
            <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={1.5} roughness={0.1} />
          </mesh>
          {/* Subtle throw light beam */}
          <spotLight
            position={[0, -1.25, -0.4]}
            target-position={[0, 3.4, -0.6]}
            intensity={4.5}
            distance={14}
            angle={0.45}
            penumbra={0.6}
            color="#bae6fd"
          />
        </group>

        {/* Professional Stage Floodlights */}
        <pointLight position={[0, 6.2, 1.5]} intensity={5.0} distance={18} color="#fff8e7" decay={2} />
        <spotLight
          position={[-6, 7.5, 3]}
          target-position={[0, 1.2, 0]}
          intensity={6.0}
          distance={20}
          angle={0.55}
          color="#fef08a"
        />
        <spotLight
          position={[6, 7.5, 3]}
          target-position={[0, 1.2, 0]}
          intensity={6.0}
          distance={20}
          angle={0.55}
          color="#bae6fd"
        />
      </group>

      {/* 
        4. ROBOTICS TEAM PRESENTATION STALLS (R01, R02, S01, S02)
        CLEANLY LOCATED ON THE CONCOURSE OUTSIDE THE ARENAS (at z = -18.0)
      */}
      {zone3Projects.map((project) => (
        <BoothMesh key={project.id} project={project} />
      ))}
    </group>
  );
}
