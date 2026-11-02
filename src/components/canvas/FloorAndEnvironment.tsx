'use client';

import { Environment, Float, Text } from '@react-three/drei';
import { useExhibitionStore } from '@/store/useExhibitionStore';

export default function FloorAndEnvironment() {
  const isMobile = useExhibitionStore((state) => state.isMobile);
  const theme = useExhibitionStore((state) => state.theme);
  const isLight = theme === 'light';

  return (
    <>
      {/* Studio Lighting Environment (Low intensity in light mode to prevent washout) */}
      <Environment preset={isLight ? "studio" : "city"} environmentIntensity={isLight ? 0.2 : 0.7} />

      {/* 
        Balanced Studio Directional Light 
        Warm daylight spectrum enhances architectural timber & glass reflections
        Positive shadow-bias prevents shadow acne & floor moiré lines
      */}
      <ambientLight intensity={isLight ? 0.55 : 0.75} color={isLight ? "#e2e8f0" : "#f8fafc"} />
      <directionalLight
        position={[30, 50, 30]}
        intensity={isLight ? 0.75 : 1.2}
        color={isLight ? "#fffcf4" : "#ffffff"}
        castShadow={!isMobile}
        shadow-mapSize={isMobile ? [512, 512] : [2048, 2048]}
        shadow-camera-left={-60}
        shadow-camera-right={60}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
        shadow-bias={0.0004}
      />

      <directionalLight
        position={[-30, 35, -30]}
        intensity={isLight ? 0.35 : 0.4}
        color={isLight ? "#bae6fd" : "#94a3b8"}
      />

      {/* ========================================================= */}
      {/* 1. ARCHITECTURAL POLISHED WOOD PARQUET FLOOR SLABS        */}
      {/* (Inspired by warm timber summit hall in reference images)  */}
      {/* ========================================================= */}
      
      {/* 
        Main Exhibition Hall Floor 
        Warm polished oak parquet in light mode, executive smoked oak in dark mode
        Solid box: top at y=0.0, height=0.8, bottom at y=-0.8
      */}
      <mesh position={[-1, -0.4, 0]} receiveShadow>
        <boxGeometry args={[46, 0.8, 42]} />
        <meshStandardMaterial
          color={isLight ? "#b88b5a" : "#1a2130"}
          roughness={isLight ? 0.38 : 0.42}
          metalness={isLight ? 0.04 : 0.12}
        />
      </mesh>

      {/* Main Center Walkway Runner Inlay (Contrasting polished architectural band) */}
      <mesh position={[-1, 0.005, 0]} receiveShadow>
        <boxGeometry args={[4.4, 0.01, 41.6]} />
        <meshStandardMaterial
          color={isLight ? "#a4794a" : "#141a26"}
          roughness={isLight ? 0.45 : 0.5}
          metalness={0.05}
        />
      </mesh>

      {/* Main Hall Outer Base Accent (strictly BELOW at y=-0.82) */}
      <mesh position={[-1, -0.82, 0]}>
        <boxGeometry args={[46.6, 0.08, 42.6]} />
        <meshStandardMaterial
          color={isLight ? "#0284c7" : "#0ea5e9"}
          emissive="#0284c7"
          emissiveIntensity={isLight ? 0.35 : 0.6}
        />
      </mesh>

      {/* 
        Connecting Corridor 1: Main Hall <-> Robotics Arena Concourse
        Links Main Hall (z=-21) and Robotics Arena (z=-24) seamlessly
      */}
      <mesh position={[-1, -0.4, -22.5]} receiveShadow>
        <boxGeometry args={[32, 0.8, 5]} />
        <meshStandardMaterial
          color={isLight ? "#af8252" : "#161d2a"}
          roughness={isLight ? 0.4 : 0.45}
          metalness={isLight ? 0.04 : 0.1}
        />
      </mesh>

      {/* Connecting Corridor 1 Base Accent */}
      <mesh position={[-1, -0.82, -22.5]}>
        <boxGeometry args={[32.4, 0.08, 5.4]} />
        <meshStandardMaterial
          color="#f59e0b"
          emissive="#d97706"
          emissiveIntensity={isLight ? 0.35 : 0.6}
        />
      </mesh>

      {/* 
        Top Arena Floor (Robotics Arenas)
        High-tech slate / engineered surface
        Solid box: top at y=0.0, height=0.8, bottom at y=-0.8
      */}
      <mesh position={[-1, -0.4, -36]} receiveShadow>
        <boxGeometry args={[46, 0.8, 24]} />
        <meshStandardMaterial
          color={isLight ? "#788796" : "#0d1422"}
          roughness={isLight ? 0.75 : 0.45}
          metalness={isLight ? 0.08 : 0.25}
        />
      </mesh>

      {/* Top Arena Outer Base Accent */}
      <mesh position={[-1, -0.82, -36]}>
        <boxGeometry args={[46.6, 0.08, 24.6]} />
        <meshStandardMaterial
          color="#f59e0b"
          emissive="#d97706"
          emissiveIntensity={isLight ? 0.35 : 0.6}
        />
      </mesh>

      {/* 
        Connecting Corridor 2: Covered Concourse to Show & Tell
        Links West Wall Entrance to Show & Tell Pavilion seamlessly
      */}
      <mesh position={[-28, -0.4, -6]} receiveShadow>
        <boxGeometry args={[14, 0.8, 8]} />
        <meshStandardMaterial
          color={isLight ? "#b08455" : "#181f2c"}
          roughness={isLight ? 0.42 : 0.45}
          metalness={0.05}
        />
      </mesh>

      {/* Connecting Corridor 2 Base Accent */}
      <mesh position={[-28, -0.82, -6]}>
        <boxGeometry args={[14.4, 0.08, 8.4]} />
        <meshStandardMaterial
          color="#8b5cf6"
          emissive="#7c3aed"
          emissiveIntensity={isLight ? 0.35 : 0.6}
        />
      </mesh>

      {/* 
        Left Angled Pavilion (Show & Tell)
        Warm honey-timber parquet
        Solid box: top at y=0.0, height=0.8, bottom at y=-0.8
      */}
      <group position={[-36, 0, -6]} rotation={[0, -0.3208, 0]}>
        <mesh position={[0, -0.4, 0]} receiveShadow>
          <boxGeometry args={[26, 0.8, 14]} />
          <meshStandardMaterial
            color={isLight ? "#a87848" : "#1a172c"}
            roughness={isLight ? 0.42 : 0.45}
            metalness={0.05}
          />
        </mesh>
        {/* Base Accent */}
        <mesh position={[0, -0.82, 0]}>
          <boxGeometry args={[26.5, 0.08, 14.5]} />
          <meshStandardMaterial
            color="#9333ea"
            emissive="#7e22ce"
            emissiveIntensity={isLight ? 0.35 : 0.6}
          />
        </mesh>
      </group>

      {/* ========================================================= */}
      {/* 2. ARCHITECTURAL BOUNDARIES & ACOUSTIC TIMBER WALLS       */}
      {/* (Inspired by Image 1 Panoramic Windows & Image 2 Panels)  */}
      {/* ========================================================= */}

      {/* EAST WALL: Acoustic Oak Wood Paneling with Horizontal Reveals (Image 2) */}
      <group position={[22, 0, 0]}>
        {/* 4 Stacked horizontal wood panels separated by shadow reveal grooves */}
        {[0.6, 1.8, 3.0, 4.2].map((yPos, i) => (
          <group key={i} position={[0, yPos, 0]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[0.35, 1.12, 42]} />
              <meshStandardMaterial
                color={isLight ? "#9c7247" : "#241d1a"}
                roughness={0.45}
                metalness={0.05}
              />
            </mesh>
            {/* Recessed dark shadow reveal line */}
            <mesh position={[-0.02, -0.58, 0]}>
              <boxGeometry args={[0.32, 0.06, 42]} />
              <meshStandardMaterial color="#090d16" roughness={0.9} />
            </mesh>
          </group>
        ))}
        {/* Wall Top Cornice */}
        <mesh position={[0, 4.8, 0]}>
          <boxGeometry args={[0.45, 0.15, 42.2]} />
          <meshStandardMaterial color={isLight ? "#334155" : "#0f172a"} metalness={0.8} />
        </mesh>
      </group>

      {/* SOUTH WALL: Matching Acoustic Oak Wood Paneling */}
      <group position={[-1, 0, 21]}>
        {[0.6, 1.8, 3.0, 4.2].map((yPos, i) => (
          <group key={i} position={[0, yPos, 0]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[46, 1.12, 0.35]} />
              <meshStandardMaterial
                color={isLight ? "#9c7247" : "#241d1a"}
                roughness={0.45}
                metalness={0.05}
              />
            </mesh>
            <mesh position={[0, -0.58, -0.02]}>
              <boxGeometry args={[46, 0.06, 0.32]} />
              <meshStandardMaterial color="#090d16" roughness={0.9} />
            </mesh>
          </group>
        ))}
        <mesh position={[0, 4.8, 0]}>
          <boxGeometry args={[46.2, 0.15, 0.45]} />
          <meshStandardMaterial color={isLight ? "#334155" : "#0f172a"} metalness={0.8} />
        </mesh>
      </group>

      {/* WEST WALL: Panoramic Floor-to-Ceiling Glass Window Curtain Wall (Image 1) */}
      <group position={[-24, 0, 0]}>
        {/* Structural Steel Mullion Columns every 6 meters */}
        {[-21, -15, -9, -3, 3, 9, 15, 21].map((zPos, i) => (
          <mesh key={i} position={[0, 2.8, zPos]} castShadow>
            <boxGeometry args={[0.22, 5.6, 0.22]} />
            <meshStandardMaterial color={isLight ? "#475569" : "#0f172a"} metalness={0.85} roughness={0.2} />
          </mesh>
        ))}
        {/* Horizontal Steel Transom Bars at y=1.2, 3.0, 5.0 */}
        {[1.2, 3.0, 5.0].map((yPos, i) => (
          <mesh key={i} position={[0, yPos, 0]}>
            <boxGeometry args={[0.16, 0.1, 42]} />
            <meshStandardMaterial color={isLight ? "#475569" : "#0f172a"} metalness={0.85} roughness={0.2} />
          </mesh>
        ))}
        {/* Tinted Architectural Glass Curtain Panes (Non-entrance sections) */}
        {[-18, -10.5, -2, 6, 14].map((zPos, i) => (
          <mesh key={i} position={[0, 2.8, zPos]}>
            <boxGeometry args={[0.06, 5.4, 5.2]} />
            <meshStandardMaterial
              color={isLight ? "#e0f2fe" : "#38bdf8"}
              metalness={0.9}
              roughness={0.1}
              transparent
              opacity={isLight ? 0.3 : 0.45}
            />
          </mesh>
        ))}
        {/* Exterior Horizon / Skyline Silhouette Backdrop (Visible through glass, Image 1) */}
        <mesh position={[-6, 6.0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[56, 16]} />
          <meshBasicMaterial
            color={isLight ? "#b8cad8" : "#0a101f"}
            transparent
            opacity={0.85}
          />
        </mesh>
      </group>

      {/* ========================================================= */}
      {/* 3. NORTH WALL & ELEVATED SUMMIT KEYNOTE STAGE             */}
      {/* (Inspired by Image 2 bottom: Stage, Screen & Repeater TVs)*/}
      {/* ========================================================= */}
      
      {/* Elevated Keynote Speaker Stage Platform */}
      <group position={[-1, 0, -19.4]}>
        {/* Stage platform riser */}
        <mesh position={[0, 0.25, 0]} receiveShadow castShadow>
          <boxGeometry args={[26, 0.5, 3.2]} />
          <meshStandardMaterial
            color={isLight ? "#2d3748" : "#0b101c"}
            roughness={0.3}
            metalness={0.4}
          />
        </mesh>
        {/* Glowing Stage Edge Fascia Strip */}
        <mesh position={[0, 0.48, 1.61]}>
          <boxGeometry args={[26, 0.04, 0.04]} />
          <meshStandardMaterial
            color="#f59e0b"
            emissive="#d97706"
            emissiveIntensity={isLight ? 0.6 : 1.2}
          />
        </mesh>
        {/* Keynote Speaker Podium / Lectern (Image 2 bottom) */}
        <group position={[-5, 0.5, 0.4]}>
          <mesh position={[0, 0.55, 0]} castShadow>
            <boxGeometry args={[0.7, 1.1, 0.5]} />
            <meshStandardMaterial color={isLight ? "#94a3b8" : "#1e293b"} metalness={0.7} roughness={0.3} />
          </mesh>
          <mesh position={[0, 1.12, 0]} rotation={[-0.15, 0, 0]}>
            <boxGeometry args={[0.74, 0.04, 0.54]} />
            <meshStandardMaterial color={isLight ? "#c8965e" : "#0f172a"} roughness={0.3} />
          </mesh>
          <mesh position={[0, 1.16, -0.05]}>
            <cylinderGeometry args={[0.008, 0.008, 0.16, 8]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.9} />
          </mesh>
        </group>
      </group>

      {/* Grand Central 16:9 Presentation Display Board (Image 1 & 2) */}
      <group position={[-1, 3.8, -20.8]}>
        {/* Display Frame / Bezel */}
        <mesh castShadow>
          <boxGeometry args={[13.2, 4.5, 0.2]} />
          <meshStandardMaterial
            color={isLight ? "#1e293b" : "#030712"}
            metalness={0.9}
            roughness={0.2}
          />
        </mesh>
        {/* Glowing Screen Outer Border Accent */}
        <mesh position={[0, 0, 0.02]}>
          <boxGeometry args={[13.35, 4.65, 0.06]} />
          <meshStandardMaterial
            color="#0284c7"
            emissive="#0284c7"
            emissiveIntensity={isLight ? 0.4 : 0.8}
          />
        </mesh>
        {/* High-Tech Presentation Slide Canvas */}
        <mesh position={[0, 0, 0.11]}>
          <planeGeometry args={[12.8, 4.1]} />
          <meshStandardMaterial
            color={isLight ? "#0f172a" : "#070b14"}
            emissive="#0f172a"
            emissiveIntensity={0.2}
          />
        </mesh>
        {/* Slide Screen Typography */}
        <Text
          position={[0, 1.25, 0.13]}
          fontSize={0.65}
          color="#38bdf8"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.06}
        >
          DPS INDIRAPURAM TECH & INNOVATION SUMMIT
        </Text>
        <Text
          position={[0, 0.45, 0.13]}
          fontSize={0.36}
          color="#f8fafc"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.04}
        >
          LIVE STUDENT EXHIBITION • 35 BREAKTHROUGH PROJECTS
        </Text>
        <Text
          position={[0, -0.4, 0.13]}
          fontSize={0.3}
          color="#fbbf24"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.08}
        >
          PHYSICAL TECH • DIGITAL SYSTEMS • BUSINESS • ROBOTICS
        </Text>
        <Text
          position={[0, -1.2, 0.13]}
          fontSize={0.24}
          color="#94a3b8"
          anchorX="center"
          anchorY="middle"
        >
          SELECT ANY DESK TO INSPECT ARCHITECTURE & CAST YOUR VOTE
        </Text>
      </group>

      {/* Left Angled Side Repeater Screen (Image 2 bottom) */}
      <group position={[-11.2, 3.2, -20.2]} rotation={[0, 0.28, 0]}>
        <mesh castShadow>
          <boxGeometry args={[4.2, 2.5, 0.12]} />
          <meshStandardMaterial color="#0f172a" metalness={0.8} />
        </mesh>
        <mesh position={[0, 0, 0.07]}>
          <planeGeometry args={[4.0, 2.3]} />
          <meshStandardMaterial color="#0284c7" emissive="#0369a1" emissiveIntensity={0.5} />
        </mesh>
        <Text position={[0, 0.5, 0.09]} fontSize={0.28} color="#ffffff" anchorX="center" anchorY="middle">
          LEADERBOARD STREAM
        </Text>
        <Text position={[0, -0.2, 0.09]} fontSize={0.2} color="#bae6fd" anchorX="center" anchorY="middle">
          REAL-TIME VOTE TALLY
        </Text>
      </group>

      {/* Right Angled Side Repeater Screen (Image 2 bottom) */}
      <group position={[9.2, 3.2, -20.2]} rotation={[0, -0.28, 0]}>
        <mesh castShadow>
          <boxGeometry args={[4.2, 2.5, 0.12]} />
          <meshStandardMaterial color="#0f172a" metalness={0.8} />
        </mesh>
        <mesh position={[0, 0, 0.07]}>
          <planeGeometry args={[4.0, 2.3]} />
          <meshStandardMaterial color="#7c3aed" emissive="#6d28d9" emissiveIntensity={0.5} />
        </mesh>
        <Text position={[0, 0.5, 0.09]} fontSize={0.28} color="#ffffff" anchorX="center" anchorY="middle">
          ROBOTICS ARENA FEED
        </Text>
        <Text position={[0, -0.2, 0.09]} fontSize={0.2} color="#ddd6fe" anchorX="center" anchorY="middle">
          SPEEDWAY & SOCCER PITCH
        </Text>
      </group>

      {/* North Portal Overhead Header Lintel into Robotics Arena */}
      <mesh position={[-1, 5.6, -21]}>
        <boxGeometry args={[26, 0.8, 0.4]} />
        <meshStandardMaterial
          color={isLight ? "#334155" : "#0f172a"}
          metalness={0.8}
          roughness={0.3}
        />
      </mesh>

      {/* ========================================================= */}
      {/* 4. SUSPENDED LINEAR ARCHITECTURAL LED FIXTURES            */}
      {/* (Inspired by suspended LED tube lights in Image 1 & 2)    */}
      {/* ========================================================= */}
      <group position={[0, 6.8, 0]}>
        {/* 4 Rows of suspended linear LED fixtures aligned over walkways & aisles */}
        {[-14, -5, 5, 14].map((zPos, i) => (
          <group key={i} position={[-1, 0, zPos]}>
            {/* Fixture Body (Long linear tube housing) */}
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[28, 0.1, 0.18]} />
              <meshStandardMaterial color={isLight ? "#475569" : "#1e293b"} metalness={0.8} />
            </mesh>
            {/* Glowing Diffuser Lens (Casts soft architectural daylight downward) */}
            <mesh position={[0, -0.06, 0]}>
              <boxGeometry args={[27.8, 0.04, 0.14]} />
              <meshStandardMaterial
                color="#ffffff"
                emissive="#fffbeb"
                emissiveIntensity={isLight ? 0.9 : 1.3}
              />
            </mesh>
            {/* Left suspension cable */}
            <mesh position={[-11, 0.9, 0]}>
              <cylinderGeometry args={[0.012, 0.012, 1.8, 6]} />
              <meshStandardMaterial color="#94a3b8" metalness={0.9} />
            </mesh>
            {/* Right suspension cable */}
            <mesh position={[11, 0.9, 0]}>
              <cylinderGeometry args={[0.012, 0.012, 1.8, 6]} />
              <meshStandardMaterial color="#94a3b8" metalness={0.9} />
            </mesh>
          </group>
        ))}
      </group>

      {/* Internal Aisle Dividers (Architectural Low Glass & Steel Railings) */}
      <group position={[0, 0.6, 0]}>
        {/* Horizontal divider above P07-P10 */}
        <mesh position={[7.5, 0, -11.5]}>
          <boxGeometry args={[21, 1.1, 0.1]} />
          <meshStandardMaterial
            color={isLight ? "#cbd5e1" : "#1e293b"}
            metalness={0.7}
            roughness={0.15}
            transparent
            opacity={isLight ? 0.45 : 0.6}
          />
        </mesh>
        {/* Divider Base Steel Channel */}
        <mesh position={[7.5, -0.52, -11.5]}>
          <boxGeometry args={[21.1, 0.08, 0.14]} />
          <meshStandardMaterial color={isLight ? "#64748b" : "#0f172a"} metalness={0.9} />
        </mesh>

        <mesh position={[18, 0, -9.25]}>
          <boxGeometry args={[0.1, 1.1, 4.5]} />
          <meshStandardMaterial
            color={isLight ? "#cbd5e1" : "#1e293b"}
            metalness={0.7}
            roughness={0.15}
            transparent
            opacity={isLight ? 0.45 : 0.6}
          />
        </mesh>
        <mesh position={[18, -0.52, -9.25]}>
          <boxGeometry args={[0.14, 0.08, 4.55]} />
          <meshStandardMaterial color={isLight ? "#64748b" : "#0f172a"} metalness={0.9} />
        </mesh>

        {/* Partition 2 (Between P11-D02 and D05-D08) */}
        <mesh position={[7.5, 0, 2.5]}>
          <boxGeometry args={[21, 1.1, 0.1]} />
          <meshStandardMaterial
            color={isLight ? "#cbd5e1" : "#1e293b"}
            metalness={0.7}
            roughness={0.15}
            transparent
            opacity={isLight ? 0.45 : 0.6}
          />
        </mesh>
        <mesh position={[7.5, -0.52, 2.5]}>
          <boxGeometry args={[21.1, 0.08, 0.14]} />
          <meshStandardMaterial color={isLight ? "#64748b" : "#0f172a"} metalness={0.9} />
        </mesh>

        <mesh position={[18, 0, 4.75]}>
          <boxGeometry args={[0.1, 1.1, 4.5]} />
          <meshStandardMaterial
            color={isLight ? "#cbd5e1" : "#1e293b"}
            metalness={0.7}
            roughness={0.15}
            transparent
            opacity={isLight ? 0.45 : 0.6}
          />
        </mesh>
        <mesh position={[18, -0.52, 4.75]}>
          <boxGeometry args={[0.14, 0.08, 4.55]} />
          <meshStandardMaterial color={isLight ? "#64748b" : "#0f172a"} metalness={0.9} />
        </mesh>

        {/* Partition 3 (Between D09-D12 and Business B aisle) */}
        <mesh position={[7.5, 0, 15]}>
          <boxGeometry args={[21, 1.1, 0.1]} />
          <meshStandardMaterial
            color={isLight ? "#cbd5e1" : "#1e293b"}
            metalness={0.7}
            roughness={0.15}
            transparent
            opacity={isLight ? 0.45 : 0.6}
          />
        </mesh>
        <mesh position={[7.5, -0.52, 15]}>
          <boxGeometry args={[21.1, 0.08, 0.14]} />
          <meshStandardMaterial color={isLight ? "#64748b" : "#0f172a"} metalness={0.9} />
        </mesh>
      </group>

      {/* Entrance Reception Welcome Counters (Near West Window Entrance) */}
      <group position={[-21, 0, 0]}>
        {[-14, -6, 2, 10].map((z, i) => (
          <group key={i} position={[0, 0.45, z]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[1.4, 0.9, 0.8]} />
              <meshStandardMaterial color={isLight ? "#334155" : "#111827"} roughness={0.4} metalness={0.3} />
            </mesh>
            {/* Polished Oak Countertop */}
            <mesh position={[0, 0.46, 0]}>
              <boxGeometry args={[1.5, 0.04, 0.85]} />
              <meshStandardMaterial color={isLight ? "#c69862" : "#1e2638"} roughness={0.3} />
            </mesh>
            {/* Front Amber Welcome LED accent */}
            <mesh position={[0.71, 0.15, 0]}>
              <boxGeometry args={[0.02, 0.04, 0.7]} />
              <meshStandardMaterial color="#f59e0b" emissive="#d97706" emissiveIntensity={0.8} />
            </mesh>
          </group>
        ))}
      </group>

      {/* Robotics Arena Concourse Entrance Archway Sign */}
      <group position={[-1, 6.2, -23.5]}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[22, 1.2, 0.18]} />
          <meshStandardMaterial
            color={isLight ? "#334155" : "#0a0f1d"}
            metalness={0.85}
            roughness={0.25}
          />
        </mesh>
        <mesh position={[0, -0.6, 0]}>
          <boxGeometry args={[22.2, 0.05, 0.2]} />
          <meshStandardMaterial
            color="#f59e0b"
            emissive="#d97706"
            emissiveIntensity={isLight ? 0.5 : 0.9}
          />
        </mesh>
        <Text
          position={[0, 0.1, 0.11]}
          fontSize={0.45}
          color="#fbbf24"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.12}
        >
          ROBOTICS ARENA & AUTONOMOUS CIRCUIT
        </Text>
        <Text
          position={[0, -0.32, 0.11]}
          fontSize={0.22}
          color="#94a3b8"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.08}
        >
          ARENA 1 SPEEDWAY • ARENA 2 SOCCER PITCH
        </Text>
      </group>
    </>
  );
}
