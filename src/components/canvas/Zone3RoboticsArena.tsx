'use client';

import { useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { useExhibitionStore } from '@/store/useExhibitionStore';
import { getStageMediaWallTexture } from '@/lib/screenTextures';
import BoothMesh from './BoothMesh';

/**
 * Animated High-Speed Autonomous Rover that tackles the Elevated Ramp Obstacle Course!
 * Drives up the ascending ramp, crosses the elevated bridge, descends the down ramp,
 * and powers through the turns with live wheel spinning, headlight beams, and roof LiDAR.
 */
function AnimatedRoboRacer() {
  const roverRef = useRef<THREE.Group>(null);
  const wheelsRef = useRef<THREE.Group[]>([]);
  const lidarRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }, delta) => {
    if (!roverRef.current) return;

    // Track loop speed
    const t = (clock.getElapsedTime() * 0.85) % (Math.PI * 2);

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
        const rampProgress = (posX - (-2.5)) / 1.6;
        posY = 0.45 + rampProgress * 0.65;
        pitch = -0.36; // Nose pitched UP
      } else if (posX >= -0.9 && posX <= 0.9) {
        // 2. Elevated Bridge Deck (Cruising high above track)
        posY = 1.10;
        pitch = 0.0;
      } else if (posX > 0.9 && posX <= 2.5) {
        // 3. Descending Ramp (Sloping down)
        const rampProgress = (posX - 0.9) / 1.6;
        posY = 1.10 - rampProgress * 0.65;
        pitch = 0.36; // Nose pitched DOWN
      }
    }

    roverRef.current.position.set(posX, posY, posZ);
    roverRef.current.rotation.set(pitch, heading, 0);

    // Spin roof LiDAR sensor
    if (lidarRef.current) {
      lidarRef.current.rotation.y += delta * 12;
    }

    // Spin wheels with track speed
    wheelsRef.current.forEach((wheel) => {
      if (wheel) wheel.rotation.x += delta * 18;
    });
  });

  return (
    <group ref={roverRef} castShadow>
      {/* Aerodynamic Carbon/Orange Race Chassis */}
      <mesh position={[0, 0.1, 0]} castShadow>
        <boxGeometry args={[0.55, 0.14, 0.95]} />
        <meshStandardMaterial color="#ea580c" roughness={0.3} metalness={0.7} />
      </mesh>

      {/* Front Splitter / Carbon Underbody */}
      <mesh position={[0, 0.04, 0.48]} castShadow>
        <boxGeometry args={[0.58, 0.02, 0.12]} />
        <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Cockpit / Electronics Canopy */}
      <mesh position={[0, 0.22, -0.05]} castShadow>
        <boxGeometry args={[0.38, 0.13, 0.55]} />
        <meshStandardMaterial color="#090d16" roughness={0.2} metalness={0.9} />
      </mesh>

      {/* Rear High-Downforce GT Wing with Dual Struts */}
      <mesh position={[0, 0.32, -0.42]}>
        <boxGeometry args={[0.62, 0.02, 0.16]} />
        <meshStandardMaterial color="#090d16" metalness={0.8} />
      </mesh>
      <mesh position={[-0.22, 0.24, -0.42]}>
        <boxGeometry args={[0.02, 0.16, 0.08]} />
        <meshStandardMaterial color="#ea580c" />
      </mesh>
      <mesh position={[0.22, 0.24, -0.42]}>
        <boxGeometry args={[0.02, 0.16, 0.08]} />
        <meshStandardMaterial color="#ea580c" />
      </mesh>

      {/* Roof Spinning LiDAR Scanner with Projection Ring */}
      <group position={[0, 0.31, 0.05]}>
        <mesh position={[0, 0.03, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.06, 12]} />
          <meshStandardMaterial color="#475569" />
        </mesh>
        <mesh ref={lidarRef} position={[0, 0.07, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 0.04, 12]} />
          <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={2.0} />
        </mesh>
      </group>

      {/* Glowing Headlights (Cyan LEDs with projection cones) */}
      <mesh position={[-0.2, 0.1, 0.48]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshBasicMaterial color="#38bdf8" />
      </mesh>
      <mesh position={[0.2, 0.1, 0.48]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshBasicMaterial color="#38bdf8" />
      </mesh>

      {/* Headlight Beams */}
      <mesh position={[-0.2, 0.08, 0.75]} rotation={[Math.PI / 12, 0, 0]}>
        <coneGeometry args={[0.18, 0.6, 12]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.2} />
      </mesh>
      <mesh position={[0.2, 0.08, 0.75]} rotation={[Math.PI / 12, 0, 0]}>
        <coneGeometry args={[0.18, 0.6, 12]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.2} />
      </mesh>

      {/* Rear Brake Light Bar */}
      <mesh position={[0, 0.14, -0.48]}>
        <boxGeometry args={[0.42, 0.03, 0.02]} />
        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={2.5} />
      </mesh>

      {/* 4 Rubber Tires with Multi-Spoke Alloy Rims */}
      {[
        [-0.32, 0.08, 0.28, 0],
        [0.32, 0.08, 0.28, 1],
        [-0.32, 0.08, -0.28, 2],
        [0.32, 0.08, -0.28, 3],
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
            <cylinderGeometry args={[0.09, 0.09, 0.08, 14]} />
            <meshStandardMaterial color="#18181b" roughness={0.8} />
          </mesh>
          {/* Rim */}
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.05, 0.05, 0.082, 8]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.2} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/**
 * Animated Robo Soccer: 2 Autonomous Robots playing soccer on the pitch
 */
function AnimatedRoboSoccer() {
  const strikerRef = useRef<THREE.Group>(null);
  const keeperRef = useRef<THREE.Group>(null);
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
          <cylinderGeometry args={[0.34, 0.36, 0.24, 18]} />
          <meshStandardMaterial color="#0284c7" metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.25, 0]}>
          <cylinderGeometry args={[0.32, 0.32, 0.03, 18]} />
          <meshStandardMaterial color="#0f172a" roughness={0.2} />
        </mesh>
        {/* Solenoid Kicker Plate */}
        <mesh position={[0, 0.08, 0.35]}>
          <boxGeometry args={[0.34, 0.12, 0.06]} />
          <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={1.4} />
        </mesh>
        {/* Top Camera Turret */}
        <mesh position={[0, 0.32, 0.05]} castShadow>
          <sphereGeometry args={[0.1, 14, 14]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
        <mesh position={[0, 0.32, 0.13]}>
          <sphereGeometry args={[0.04, 10, 10]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>
        {/* Team Cyan Status Ring */}
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.38, 0.42, 24]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>
        <Text position={[0, 0.58, 0]} fontSize={0.16} color="#38bdf8" anchorX="center" anchorY="middle">
          S01 • STRIKER
        </Text>
      </group>

      {/* 2. GOALKEEPER BOT (Team Rose • S02 TitanKeeper) */}
      <group ref={keeperRef} castShadow>
        <mesh position={[0, 0.14, 0]} castShadow>
          <boxGeometry args={[0.78, 0.26, 0.4]} />
          <meshStandardMaterial color="#dc2626" metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.12, 0.22]}>
          <boxGeometry args={[0.82, 0.18, 0.06]} />
          <meshStandardMaterial color="#f87171" emissive="#dc2626" emissiveIntensity={1.4} />
        </mesh>
        {/* Goal Defense Antennas */}
        <mesh position={[-0.32, 0.35, -0.1]}>
          <cylinderGeometry args={[0.015, 0.015, 0.22, 8]} />
          <meshStandardMaterial color="#94a3b8" />
        </mesh>
        <mesh position={[-0.32, 0.46, -0.1]}>
          <sphereGeometry args={[0.035, 8, 8]} />
          <meshBasicMaterial color="#f87171" />
        </mesh>
        <mesh position={[0.32, 0.35, -0.1]}>
          <cylinderGeometry args={[0.015, 0.015, 0.22, 8]} />
          <meshStandardMaterial color="#94a3b8" />
        </mesh>
        <mesh position={[0.32, 0.46, -0.1]}>
          <sphereGeometry args={[0.035, 8, 8]} />
          <meshBasicMaterial color="#f87171" />
        </mesh>
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.45, 0.49, 24]} />
          <meshBasicMaterial color="#f87171" />
        </mesh>
        <Text position={[0, 0.58, 0]} fontSize={0.16} color="#f87171" anchorX="center" anchorY="middle">
          S02 • KEEPER
        </Text>
      </group>

      {/* 3. HIGH-TORQUE SOCCER BALL */}
      <mesh ref={ballRef} castShadow>
        <sphereGeometry args={[0.16, 24, 24]} />
        <meshStandardMaterial color="#fbbf24" roughness={0.3} metalness={0.2} />
      </mesh>
    </group>
  );
}

export default function Zone3RoboticsArena() {
  const [hoveredArena, setHoveredArena] = useState<string | null>(null);
  const projects = useExhibitionStore((state) => state.projects);
  const zone3Projects = projects.filter((p) => p.zone === 'zone-3');
  const setActiveZone = useExhibitionStore((state) => state.setActiveZone);
  const isMobile = useExhibitionStore((state) => state.isMobile);

  const stageTexture = useMemo(() => {
    if (typeof window === 'undefined') return null;
    return getStageMediaWallTexture();
  }, []);

  const handleArenaClick = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    setActiveZone('zone-3');
  };

  return (
    <group position={[0, 0, 0]}>
      {/* ======================================================== */}
      {/* 1. LEFT ARENA: ROBO SPEEDWAY CIRCUIT WITH REAL RAMPS     */}
      {/* (x = 2.5, z = -25.5)                                     */}
      {/* ======================================================== */}
      <group
        position={[2.5, 0, -25.5]}
        onClick={handleArenaClick}
        onPointerOver={(e) => {
          if (!isMobile) {
            e.stopPropagation();
            setHoveredArena('speedway');
            document.body.style.cursor = 'pointer';
          }
        }}
        onPointerOut={() => {
          if (!isMobile) {
            setHoveredArena(null);
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

        {/* Platform Base Dais */}
        <mesh position={[0, 0.15, 0]} receiveShadow castShadow>
          <boxGeometry args={[10.5, 0.3, 11.5]} />
          <meshStandardMaterial color="#0f172a" metalness={0.7} roughness={0.3} />
        </mesh>

        {/* Green Turf Infield & Surrounds (matching blueprint green rectangle) */}
        <mesh position={[0, 0.31, 0]} receiveShadow>
          <boxGeometry args={[10.0, 0.02, 11.0]} />
          <meshStandardMaterial color="#065f46" roughness={0.7} />
        </mesh>

        {/* Ground Asphalt Circuit Track */}
        <mesh position={[0, 0.32, 0]} receiveShadow>
          <boxGeometry args={[9.0, 0.015, 10.0]} />
          <meshStandardMaterial color="#1e2430" roughness={0.8} />
        </mesh>

        {/* Track Apex Kerbs (Red & White Racing Strips on Turn Apices) */}
        {[
          [-3.8, 0.33, -3.8],
          [3.8, 0.33, -3.8],
          [-3.8, 0.33, 3.8],
          [3.8, 0.33, 3.8],
        ].map(([kx, ky, kz], idx) => (
          <mesh key={idx} position={[kx, ky, kz]}>
            <boxGeometry args={[1.2, 0.02, 1.2]} />
            <meshStandardMaterial color="#ef4444" roughness={0.5} />
          </mesh>
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
              <boxGeometry args={[1.75, 0.06, 1.2]} />
              <meshStandardMaterial color="#334155" roughness={0.4} metalness={0.3} />
            </mesh>
            {/* Yellow/Black High-Contrast Grip Surface */}
            <mesh position={[0, 0.035, 0]}>
              <boxGeometry args={[1.7, 0.01, 1.15]} />
              <meshStandardMaterial color="#f59e0b" roughness={0.6} />
            </mesh>
            {/* Safety Edge Rail */}
            <mesh position={[0, 0.08, -0.58]}>
              <boxGeometry args={[1.75, 0.1, 0.04]} />
              <meshStandardMaterial color="#ef4444" />
            </mesh>
            <mesh position={[0, 0.08, 0.58]}>
              <boxGeometry args={[1.75, 0.1, 0.04]} />
              <meshStandardMaterial color="#ef4444" />
            </mesh>
          </group>

          {/* Elevated Central Bridge Platform */}
          <group position={[0, 0.96, 0]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[1.85, 0.08, 1.2]} />
              <meshStandardMaterial color="#1e293b" roughness={0.3} metalness={0.5} />
            </mesh>
            {/* Top Deck Line */}
            <mesh position={[0, 0.045, 0]}>
              <boxGeometry args={[1.8, 0.01, 1.15]} />
              <meshStandardMaterial color="#f59e0b" roughness={0.5} />
            </mesh>
            {/* Safety Handrails */}
            <mesh position={[0, 0.12, -0.58]}>
              <boxGeometry args={[1.85, 0.16, 0.04]} />
              <meshStandardMaterial color="#ef4444" />
            </mesh>
            <mesh position={[0, 0.12, 0.58]}>
              <boxGeometry args={[1.85, 0.16, 0.04]} />
              <meshStandardMaterial color="#ef4444" />
            </mesh>
            {/* Structural Steel I-Beam Trusses Beneath Bridge */}
            {[-0.8, 0.8].map((legX, i) => (
              <mesh key={i} position={[legX, -0.32, 0]} castShadow>
                <boxGeometry args={[0.08, 0.56, 1.15]} />
                <meshStandardMaterial color="#475569" metalness={0.9} roughness={0.2} />
              </mesh>
            ))}
          </group>

          {/* Descending Down-Ramp (East side) */}
          <group position={[1.7, 0.64, 0]} rotation={[0, 0, -0.38]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[1.75, 0.06, 1.2]} />
              <meshStandardMaterial color="#334155" roughness={0.4} metalness={0.3} />
            </mesh>
            <mesh position={[0, 0.035, 0]}>
              <boxGeometry args={[1.7, 0.01, 1.15]} />
              <meshStandardMaterial color="#f59e0b" roughness={0.6} />
            </mesh>
            <mesh position={[0, 0.08, -0.58]}>
              <boxGeometry args={[1.75, 0.1, 0.04]} />
              <meshStandardMaterial color="#ef4444" />
            </mesh>
            <mesh position={[0, 0.08, 0.58]}>
              <boxGeometry args={[1.75, 0.1, 0.04]} />
              <meshStandardMaterial color="#ef4444" />
            </mesh>
          </group>
        </group>

        {/* Center Island Barrier */}
        <mesh position={[0, 0.5, 0.4]} castShadow receiveShadow>
          <boxGeometry args={[3.6, 0.38, 3.8]} />
          <meshStandardMaterial color="#0f172a" roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.7, 0.4]}>
          <boxGeometry args={[3.7, 0.04, 3.9]} />
          <meshStandardMaterial color="#f59e0b" emissive="#d97706" emissiveIntensity={1.2} />
        </mesh>

        {/* Outer Crimson Perimeter Safety Walls */}
        <mesh position={[0, 0.48, -5.5]}>
          <boxGeometry args={[10.0, 0.32, 0.06]} />
          <meshStandardMaterial color="#ef4444" emissive="#dc2626" emissiveIntensity={0.8} />
        </mesh>
        <mesh position={[0, 0.48, 5.5]}>
          <boxGeometry args={[10.0, 0.32, 0.06]} />
          <meshStandardMaterial color="#ef4444" emissive="#dc2626" emissiveIntensity={0.8} />
        </mesh>
        <mesh position={[-5.0, 0.48, 0]}>
          <boxGeometry args={[0.06, 0.32, 11.0]} />
          <meshStandardMaterial color="#ef4444" emissive="#dc2626" emissiveIntensity={0.8} />
        </mesh>
        <mesh position={[5.0, 0.48, 0]}>
          <boxGeometry args={[0.06, 0.32, 11.0]} />
          <meshStandardMaterial color="#ef4444" emissive="#dc2626" emissiveIntensity={0.8} />
        </mesh>

        {/* Clean Integrated Perimeter Ribbon (No Midair Collision with Stage!) */}
        <group position={[0, 0.55, 5.54]}>
          <mesh>
            <planeGeometry args={[7.2, 0.26]} />
            <meshStandardMaterial color="#0b101c" roughness={0.2} />
          </mesh>
          <Text position={[0, 0, 0.02]} fontSize={0.15} color="#f87171" anchorX="center" anchorY="middle" letterSpacing={0.06}>
            ARENA 1 • ROBO SPEEDWAY & RAMP CIRCUIT
          </Text>
        </group>

        {/* Start / Finish Gantry Arch */}
        <group position={[0, 0.32, 3.6]}>
          <mesh position={[-3.6, 1.1, 0]}>
            <boxGeometry args={[0.12, 2.2, 0.12]} />
            <meshStandardMaterial color="#ef4444" />
          </mesh>
          <mesh position={[3.6, 1.1, 0]}>
            <boxGeometry args={[0.12, 2.2, 0.12]} />
            <meshStandardMaterial color="#ef4444" />
          </mesh>
          <mesh position={[0, 2.1, 0]}>
            <boxGeometry args={[7.3, 0.35, 0.14]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>
          <Text position={[0, 2.1, 0.08]} fontSize={0.14} color="#fbbf24" anchorX="center" anchorY="middle" letterSpacing={0.08}>
            START / FINISH • RAMP OBSTACLE READY
          </Text>
        </group>

        {/* Animated Racing Robot Rover tackling the ramps! */}
        <AnimatedRoboRacer />
      </group>

      {/* ======================================================== */}
      {/* 2. RIGHT ARENA: ROBO SOCCER STADIUM (x = 14.5, z = -25.5) */}
      {/* ======================================================== */}
      <group
        position={[14.5, 0, -25.5]}
        onClick={handleArenaClick}
        onPointerOver={(e) => {
          if (!isMobile) {
            e.stopPropagation();
            setHoveredArena('soccer');
            document.body.style.cursor = 'pointer';
          }
        }}
        onPointerOut={() => {
          if (!isMobile) {
            setHoveredArena(null);
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

        {/* Platform Base */}
        <mesh position={[0, 0.15, 0]} receiveShadow castShadow>
          <boxGeometry args={[10.5, 0.3, 11.5]} />
          <meshStandardMaterial color="#0f172a" metalness={0.7} roughness={0.3} />
        </mesh>

        {/* Green Astroturf */}
        <mesh position={[0, 0.31, 0]} receiveShadow>
          <boxGeometry args={[10.0, 0.02, 11.0]} />
          <meshStandardMaterial color="#059669" roughness={0.7} />
        </mesh>

        {/* Regulation Pitch Markings */}
        <mesh position={[0, 0.325, 0]}>
          <boxGeometry args={[9.0, 0.005, 0.06]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.325, 0]}>
          <ringGeometry args={[1.2, 1.26, 28]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        {/* Penalty Area Outlines */}
        <mesh position={[0, 0.325, -4.2]}>
          <boxGeometry args={[4.2, 0.005, 0.05]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        <mesh position={[0, 0.325, 4.2]}>
          <boxGeometry args={[4.2, 0.005, 0.05]} />
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
              <meshStandardMaterial color="#fbbf24" />
            </mesh>
          </group>
        ))}

        {/* Acrylic Perimeter Safety Walls */}
        <mesh position={[0, 0.52, -5.5]}>
          <boxGeometry args={[10.0, 0.42, 0.06]} />
          <meshStandardMaterial color="#10b981" transparent opacity={0.35} />
        </mesh>
        <mesh position={[0, 0.52, 5.5]}>
          <boxGeometry args={[10.0, 0.42, 0.06]} />
          <meshStandardMaterial color="#10b981" transparent opacity={0.35} />
        </mesh>

        {/* Clean Integrated Perimeter Ribbon (No Midair Collision with Stage!) */}
        <group position={[0, 0.55, 5.54]}>
          <mesh>
            <planeGeometry args={[7.2, 0.26]} />
            <meshStandardMaterial color="#0b101c" roughness={0.2} />
          </mesh>
          <Text position={[0, 0, 0.02]} fontSize={0.15} color="#34d399" anchorX="center" anchorY="middle" letterSpacing={0.06}>
            ARENA 2 • ROBO SOCCER PITCH • 2v2 MATCH
          </Text>
        </group>

        {/* North Goalpost (Cyan) with Tubular Crossbar */}
        <group position={[0, 0.32, -4.8]}>
          <mesh position={[-1.1, 0.5, 0]}>
            <cylinderGeometry args={[0.035, 0.035, 1.0, 12]} />
            <meshStandardMaterial color="#38bdf8" />
          </mesh>
          <mesh position={[1.1, 0.5, 0]}>
            <cylinderGeometry args={[0.035, 0.035, 1.0, 12]} />
            <meshStandardMaterial color="#38bdf8" />
          </mesh>
          <mesh position={[0, 1.0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.035, 0.035, 2.2, 12]} />
            <meshStandardMaterial color="#38bdf8" />
          </mesh>
        </group>

        {/* South Goalpost (Rose) with Tubular Crossbar */}
        <group position={[0, 0.32, 4.8]}>
          <mesh position={[-1.1, 0.5, 0]}>
            <cylinderGeometry args={[0.035, 0.035, 1.0, 12]} />
            <meshStandardMaterial color="#f87171" />
          </mesh>
          <mesh position={[1.1, 0.5, 0]}>
            <cylinderGeometry args={[0.035, 0.035, 1.0, 12]} />
            <meshStandardMaterial color="#f87171" />
          </mesh>
          <mesh position={[0, 1.0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.035, 0.035, 2.2, 12]} />
            <meshStandardMaterial color="#f87171" />
          </mesh>
        </group>

        {/* 2 Animated Robots Playing Soccer in Real-Time! */}
        <AnimatedRoboSoccer />
      </group>

      {/* 
        3. HIGH-END AUDITORIUM KEYNOTE STAGE & ULTRA-WIDE LED MEDIA WALL
        (North Wall at x = 8.5, z = -32.5)
        Curved modern media wall with crisp keynote graphics, stage riser, and downlights.
      */}
      <group position={[8.5, 0, -32.5]}>
        {/* Stage Deck Riser Platform (Warm Architectural Wood) */}
        <mesh position={[0, 0.22, 0]} receiveShadow castShadow>
          <boxGeometry args={[26.5, 0.44, 4.2]} />
          <meshStandardMaterial color="#9a7049" roughness={0.35} metalness={0.1} />
        </mesh>
        {/* Front Step Edge with Warm Underglow LED Strip */}
        <mesh position={[0, 0.22, 2.12]}>
          <boxGeometry args={[26.5, 0.04, 0.04]} />
          <meshStandardMaterial color="#f59e0b" emissive="#d97706" emissiveIntensity={1.8} />
        </mesh>

        {/* Stage Presentation Podium */}
        <group position={[0, 0.44, 1.2]}>
          <mesh position={[0, 0.55, 0]} castShadow>
            <boxGeometry args={[1.2, 1.1, 0.65]} />
            <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.2} />
          </mesh>
          {/* Edge-lit DPS Emblem Plate */}
          <mesh position={[0, 0.55, 0.33]}>
            <boxGeometry args={[0.8, 0.45, 0.02]} />
            <meshStandardMaterial color="#0284c7" emissive="#0284c7" emissiveIntensity={1.2} />
          </mesh>
          {/* Chrome Microphone */}
          <mesh position={[0.25, 1.18, 0.1]} rotation={[-0.3, 0, 0]}>
            <cylinderGeometry args={[0.008, 0.008, 0.22, 6]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.98} />
          </mesh>
        </group>

        {/* Center Main Ultra-Wide LED Media Wall */}
        <group position={[0, 3.4, -0.6]}>
          {/* Beveled Matte-Black Frame */}
          <mesh castShadow>
            <boxGeometry args={[24.2, 5.4, 0.2]} />
            <meshStandardMaterial color="#050811" metalness={0.92} roughness={0.15} />
          </mesh>
          {/* High-Resolution Keynote LED Display Face */}
          <mesh position={[0, 0, 0.11]}>
            <planeGeometry args={[23.8, 5.1]} />
            {stageTexture ? (
              <meshStandardMaterial
                map={stageTexture}
                emissive="#ffffff"
                emissiveMap={stageTexture}
                emissiveIntensity={0.95}
                roughness={0.2}
              />
            ) : (
              <meshStandardMaterial color="#071228" emissive="#0284c7" emissiveIntensity={0.8} />
            )}
          </mesh>
        </group>

        {/* Left & Right Angled Stage Wing Screens */}
        <group position={[-13.5, 3.4, 0.3]} rotation={[0, 0.32, 0]}>
          <mesh castShadow>
            <boxGeometry args={[3.2, 5.4, 0.15]} />
            <meshStandardMaterial color="#050811" metalness={0.9} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0, 0.08]}>
            <planeGeometry args={[3.0, 5.1]} />
            <meshStandardMaterial color="#08142c" emissive="#0284c7" emissiveIntensity={0.4} />
          </mesh>
        </group>

        <group position={[13.5, 3.4, 0.3]} rotation={[0, -0.32, 0]}>
          <mesh castShadow>
            <boxGeometry args={[3.2, 5.4, 0.15]} />
            <meshStandardMaterial color="#050811" metalness={0.9} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0, 0.08]}>
            <planeGeometry args={[3.0, 5.1]} />
            <meshStandardMaterial color="#08142c" emissive="#0284c7" emissiveIntensity={0.4} />
          </mesh>
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
