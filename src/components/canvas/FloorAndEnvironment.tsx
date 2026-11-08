'use client';

import { Environment } from '@react-three/drei';
import { useExhibitionStore } from '@/store/useExhibitionStore';

export default function FloorAndEnvironment() {
  const isMobile = useExhibitionStore((state) => state.isMobile);
  const theme = useExhibitionStore((state) => state.theme);
  const isLight = theme === 'light';

  return (
    <>
      {/* Studio Lighting Environment */}
      <Environment preset={isLight ? 'studio' : 'city'} environmentIntensity={isLight ? 0.35 : 0.75} />

      {/* Balanced Studio Directional Lighting */}
      <ambientLight intensity={isLight ? 0.55 : 0.95} color={isLight ? '#f8fafc' : '#ffffff'} />

      <directionalLight
        position={[25, 45, 25]}
        intensity={isLight ? 1.05 : 1.5}
        color={isLight ? '#fffdf7' : '#ffffff'}
        castShadow={!isMobile}
        shadow-mapSize={isMobile ? [512, 512] : [1024, 1024]}
        shadow-camera-left={-35}
        shadow-camera-right={35}
        shadow-camera-top={35}
        shadow-camera-bottom={-35}
        shadow-bias={-0.0001}
      />

      <directionalLight
        position={[-25, 35, -25]}
        intensity={isLight ? 0.4 : 0.6}
        color={isLight ? '#bae6fd' : '#94a3b8'}
      />

      {/* ========================================================= */}
      {/* 1. ARCHITECTURAL ENCLOSURE BOX WITH FRONT OPENING         */}
      {/* (Back Wall, Left Wall, Right Wall, Grand Portal Frame)    */}
      {/* ========================================================= */}
      <group position={[-2.0, 0, -12.0]}>
        {/* BACK WALL (North Wall at z = -22.8 relative to group => world z = -34.8) */}
        <group position={[0, 5.25, -22.8]}>
          {/* Primary Insulated Architectural Wall Core */}
          <mesh receiveShadow>
            <boxGeometry args={[60, 10.5, 0.4]} />
            <meshStandardMaterial
              color={isLight ? '#f1f5f9' : '#0c1322'}
              roughness={0.4}
              metalness={0.18}
            />
          </mesh>

          {/* Bottom Polished Dark Granite Baseboard Plinth */}
          <mesh position={[0, -5.0, 0.23]}>
            <boxGeometry args={[60, 0.5, 0.08]} />
            <meshStandardMaterial color={isLight ? '#334155' : '#050811'} metalness={0.7} roughness={0.2} />
          </mesh>

          {/* Upper Crown Cornice Beam & Continuous Warm LED Cove Strip */}
          <mesh position={[0, 5.05, 0.35]}>
            <boxGeometry args={[60, 0.4, 0.35]} />
            <meshStandardMaterial color={isLight ? '#475569' : '#090e1a'} metalness={0.8} roughness={0.25} />
          </mesh>
          <mesh position={[0, 4.82, 0.42]}>
            <boxGeometry args={[59.2, 0.05, 0.05]} />
            <meshStandardMaterial color="#fef08a" emissive="#f59e0b" emissiveIntensity={1.6} />
          </mesh>

          {/* Decorative Horizontal Architectural Shadow Reveals */}
          {[-3.0, 0.0, 3.0].map((yReveal, idx) => (
            <mesh key={idx} position={[0, yReveal, 0.21]}>
              <boxGeometry args={[59.8, 0.04, 0.02]} />
              <meshStandardMaterial color={isLight ? '#64748b' : '#040812'} />
            </mesh>
          ))}

          {/* Structural Steel Mega-Pilasters along North Wall with Vertical Light Strips */}
          {[-26, -18, -10, -2, 6, 14, 22, 28].map((xCol, idx) => (
            <group key={`n-pilaster-${idx}`} position={[xCol, 0, 0.28]}>
              <mesh receiveShadow>
                <boxGeometry args={[0.45, 10.4, 0.22]} />
                <meshStandardMaterial color={isLight ? '#475569' : '#111a2e'} metalness={0.85} roughness={0.22} />
              </mesh>
              {/* Recessed Warm Vertical Accent Light Strip */}
              <mesh position={[0, 0, 0.12]}>
                <boxGeometry args={[0.04, 9.2, 0.02]} />
                <meshStandardMaterial color="#fde68a" emissive="#f59e0b" emissiveIntensity={1.1} />
              </mesh>
            </group>
          ))}

          {/* North Wall Top Cove Lighting */}
          <pointLight position={[0, 4.8, 1.2]} intensity={isLight ? 2.5 : 3.5} distance={20} color="#fef08a" decay={2} />
        </group>

        {/* LEFT WALL (West Wall at x = -29.8 relative to group => world x = -31.8) */}
        <group position={[-29.8, 5.25, 0]}>
          <mesh receiveShadow>
            <boxGeometry args={[0.4, 10.5, 45.6]} />
            <meshStandardMaterial
              color={isLight ? '#f1f5f9' : '#0c1322'}
              roughness={0.4}
              metalness={0.18}
            />
          </mesh>

          {/* Bottom Baseboard Plinth */}
          <mesh position={[0.23, -5.0, 0]}>
            <boxGeometry args={[0.08, 0.5, 45.6]} />
            <meshStandardMaterial color={isLight ? '#334155' : '#050811'} metalness={0.7} roughness={0.2} />
          </mesh>

          {/* Upper Crown Cornice & Cool Daylight LED Cove */}
          <mesh position={[0.35, 5.05, 0]}>
            <boxGeometry args={[0.35, 0.4, 45.6]} />
            <meshStandardMaterial color={isLight ? '#475569' : '#090e1a'} metalness={0.8} roughness={0.25} />
          </mesh>
          <mesh position={[0.42, 4.82, 0]}>
            <boxGeometry args={[0.05, 0.05, 44.8]} />
            <meshStandardMaterial color="#bae6fd" emissive="#0284c7" emissiveIntensity={1.5} />
          </mesh>

          {/* Structural Steel Curtain-Wall Columns along West Wall */}
          {[-20, -10, 0, 10, 20].map((zCol, idx) => (
            <group key={`w-col-${idx}`} position={[0.28, 0, zCol]}>
              <mesh>
                <boxGeometry args={[0.22, 10.4, 0.42]} />
                <meshStandardMaterial color={isLight ? '#475569' : '#111a2e'} metalness={0.85} roughness={0.22} />
              </mesh>
              <mesh position={[0.12, 0, 0]}>
                <boxGeometry args={[0.02, 9.2, 0.04]} />
                <meshStandardMaterial color="#7dd3fc" emissive="#0284c7" emissiveIntensity={1.1} />
              </mesh>
            </group>
          ))}

          {/* Upper Clerestory Window Strips along West Wall with Mullion Frames */}
          {[-15, -5, 5, 15].map((zWin, idx) => (
            <group key={idx} position={[0.22, 2.6, zWin]}>
              {/* Outer Aluminum Window Box Frame */}
              <mesh>
                <boxGeometry args={[0.08, 2.6, 6.8]} />
                <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.2} />
              </mesh>
              {/* Glowing Clerestory Glass Pane */}
              <mesh position={[0.03, 0, 0]}>
                <boxGeometry args={[0.03, 2.38, 6.5]} />
                <meshStandardMaterial
                  color="#e0f2fe"
                  emissive="#38bdf8"
                  emissiveIntensity={isLight ? 0.35 : 0.55}
                  transparent
                  opacity={isLight ? 0.6 : 0.4}
                  metalness={0.9}
                  roughness={0.08}
                />
              </mesh>
              {/* Vertical Window Mullion Bars */}
              {[-2.15, 0, 2.15].map((zMul, mIdx) => (
                <mesh key={mIdx} position={[0.045, 0, zMul]}>
                  <boxGeometry args={[0.04, 2.4, 0.08]} />
                  <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.2} />
                </mesh>
              ))}
              {/* Horizontal Transom Bar */}
              <mesh position={[0.045, 0, 0]}>
                <boxGeometry args={[0.04, 0.06, 6.5]} />
                <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.2} />
              </mesh>
            </group>
          ))}
          <pointLight position={[1.5, 4.8, 0]} intensity={isLight ? 2.5 : 3.5} distance={20} color="#bae6fd" decay={2} />
        </group>

        {/* RIGHT WALL (East Wall at x = 29.8 relative to group => world x = 27.8) */}
        <group position={[29.8, 5.25, 0]}>
          {/* Clean Acoustic Oak Wood Paneling */}
          <mesh receiveShadow>
            <boxGeometry args={[0.4, 10.5, 45.6]} />
            <meshStandardMaterial
              color={isLight ? '#e2d5c3' : '#1c1511'}
              roughness={0.4}
              metalness={0.12}
            />
          </mesh>

          {/* Bottom Baseboard Plinth */}
          <mesh position={[-0.23, -5.0, 0]}>
            <boxGeometry args={[0.08, 0.5, 45.6]} />
            <meshStandardMaterial color={isLight ? '#334155' : '#050811'} metalness={0.7} roughness={0.2} />
          </mesh>

          {/* Upper Crown Cornice & Warm Amber Cove LED */}
          <mesh position={[-0.35, 5.05, 0]}>
            <boxGeometry args={[0.35, 0.4, 45.6]} />
            <meshStandardMaterial color={isLight ? '#475569' : '#090e1a'} metalness={0.8} roughness={0.25} />
          </mesh>
          <mesh position={[-0.42, 4.82, 0]}>
            <boxGeometry args={[0.05, 0.05, 44.8]} />
            <meshStandardMaterial color="#fed7aa" emissive="#ea580c" emissiveIntensity={1.4} />
          </mesh>

          {/* Horizontal Dark-Bronze Belt Courses */}
          {[-2.2, 2.2].map((yBelt, bIdx) => (
            <mesh key={bIdx} position={[-0.24, yBelt, 0]}>
              <boxGeometry args={[0.08, 0.12, 45.4]} />
              <meshStandardMaterial color="#1e293b" metalness={0.85} roughness={0.2} />
            </mesh>
          ))}

          {/* Rhythmic 3D Vertical Architectural Timber Fins & Warm Light Strips */}
          {[-21, -18, -15, -12, -9, -6, -3, 0, 3, 6, 9, 12, 15, 18, 21].map((zSlat, idx) => (
            <group key={idx} position={[-0.24, 0, zSlat]}>
              <mesh>
                <boxGeometry args={[0.1, 10.2, 0.16]} />
                <meshStandardMaterial color={isLight ? '#c4a480' : '#291d15'} metalness={0.25} roughness={0.35} />
              </mesh>
              {idx % 2 === 0 && (
                <mesh position={[-0.055, 0, 0]}>
                  <boxGeometry args={[0.015, 9.4, 0.03]} />
                  <meshStandardMaterial color="#fed7aa" emissive="#f59e0b" emissiveIntensity={1.1} />
                </mesh>
              )}
            </group>
          ))}
          <pointLight position={[-1.5, 4.8, 0]} intensity={isLight ? 2.5 : 3.5} distance={20} color="#fed7aa" decay={2} />
        </group>

        {/* 
          FRONT OPENING (South Side at z = 22.8 relative to group => world z = 10.8):
          Sculpted Architectural Portal Pylons with Open Roof and Front Access
        */}
        <group position={[0, 5.25, 22.8]}>
          {/* Left Grand Portal Pylon */}
          <group position={[-29.8, 0, 0]}>
            <mesh castShadow>
              <boxGeometry args={[0.75, 10.5, 0.75]} />
              <meshStandardMaterial color={isLight ? '#334155' : '#0f172a'} metalness={0.88} roughness={0.2} />
            </mesh>
            <mesh position={[0.39, 0, 0.39]}>
              <boxGeometry args={[0.06, 10.2, 0.06]} />
              <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={1.8} />
            </mesh>
          </group>

          {/* Right Grand Portal Pylon */}
          <group position={[29.8, 0, 0]}>
            <mesh castShadow>
              <boxGeometry args={[0.75, 10.5, 0.75]} />
              <meshStandardMaterial color={isLight ? '#334155' : '#0f172a'} metalness={0.88} roughness={0.2} />
            </mesh>
            <mesh position={[-0.39, 0, 0.39]}>
              <boxGeometry args={[0.06, 10.2, 0.06]} />
              <meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={1.8} />
            </mesh>
          </group>
        </group>
      </group>

      {/* ========================================================= */}
      {/* 2. UNIFIED CONTINUOUS MONOLITHIC FLOOR (ZERO BLANK VOIDS) */}
      {/* ========================================================= */}

      {/* A. Continuous Wall-to-Wall Foundation Slab */}
      <mesh position={[-2.0, -0.4, -12.0]} receiveShadow>
        <boxGeometry args={[59.6, 0.8, 45.6]} />
        <meshStandardMaterial
          color={isLight ? '#e2e8f0' : '#0a101d'}
          roughness={isLight ? 0.35 : 0.32}
          metalness={isLight ? 0.05 : 0.22}
        />
      </mesh>

      {/* South Entrance Threshold Architectural Strip & Recessed Floor Beacons */}
      <group position={[-2.0, 0.008, 10.5]}>
        <mesh receiveShadow>
          <boxGeometry args={[58.8, 0.01, 0.45]} />
          <meshStandardMaterial color="#1e293b" metalness={0.85} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0.006, 0]}>
          <boxGeometry args={[58.0, 0.006, 0.05]} />
          <meshStandardMaterial color="#fbbf24" emissive="#d97706" emissiveIntensity={1.4} />
        </mesh>
      </group>

      {/* B. Main Exhibition Hall Flooring Zone (Warm Oak Showroom Inlay) */}
      <mesh position={[10.5, 0.005, -2.5]} receiveShadow>
        <boxGeometry args={[37, 0.01, 27]} />
        <meshStandardMaterial
          color={isLight ? '#f8fafc' : '#182030'}
          roughness={isLight ? 0.4 : 0.42}
          metalness={isLight ? 0.05 : 0.12}
        />
      </mesh>

      {/* Brushed Metallic Perimeter Expansion Trim Framing the Main Hall Inlay */}
      <group position={[10.5, 0.011, -2.5]}>
        <mesh position={[0, 0, -13.5]}>
          <boxGeometry args={[37.1, 0.006, 0.08]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0, 13.5]}>
          <boxGeometry args={[37.1, 0.006, 0.08]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.2} />
        </mesh>
      </group>

      {/* Walkway Runners (Architectural inlays aligned with stalls and central promenade) */}
      {/* Physical Aisle Runner (Row 1 to Row 2) + Amber Edge Guide Strips */}
      <group position={[6.4, 0.012, -11.25]}>
        <mesh receiveShadow>
          <boxGeometry args={[16.0, 0.01, 3.8]} />
          <meshStandardMaterial color={isLight ? '#e2e8f0' : '#121824'} roughness={0.5} metalness={0.04} />
        </mesh>
        <mesh position={[0, 0.006, -1.88]}>
          <boxGeometry args={[15.8, 0.004, 0.035]} />
          <meshStandardMaterial color="#fbbf24" emissive="#d97706" emissiveIntensity={0.9} />
        </mesh>
        <mesh position={[0, 0.006, 1.88]}>
          <boxGeometry args={[15.8, 0.004, 0.035]} />
          <meshStandardMaterial color="#fbbf24" emissive="#d97706" emissiveIntensity={0.9} />
        </mesh>
      </group>

      {/* Digital Aisle Runner (Row 2 to Row 3) + Cyan Edge Guide Strips */}
      <group position={[6.4, 0.012, -6.0]}>
        <mesh receiveShadow>
          <boxGeometry args={[16.0, 0.01, 3.8]} />
          <meshStandardMaterial color={isLight ? '#e2e8f0' : '#0e131d'} roughness={0.5} metalness={0.04} />
        </mesh>
        <mesh position={[0, 0.006, -1.88]}>
          <boxGeometry args={[15.8, 0.004, 0.035]} />
          <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={0.9} />
        </mesh>
        <mesh position={[0, 0.006, 1.88]}>
          <boxGeometry args={[15.8, 0.004, 0.035]} />
          <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={0.9} />
        </mesh>
      </group>

      {/* Business Aisle Runner (Row 3 to Row 4) + Emerald Edge Guide Strips */}
      <group position={[6.4, 0.012, -0.75]}>
        <mesh receiveShadow>
          <boxGeometry args={[16.0, 0.01, 3.8]} />
          <meshStandardMaterial color={isLight ? '#e2e8f0' : '#121824'} roughness={0.5} metalness={0.04} />
        </mesh>
        <mesh position={[0, 0.006, -1.88]}>
          <boxGeometry args={[15.8, 0.004, 0.035]} />
          <meshStandardMaterial color="#34d399" emissive="#059669" emissiveIntensity={0.9} />
        </mesh>
        <mesh position={[0, 0.006, 1.88]}>
          <boxGeometry args={[15.8, 0.004, 0.035]} />
          <meshStandardMaterial color="#34d399" emissive="#059669" emissiveIntensity={0.9} />
        </mesh>
      </group>

      {/* South Entrance Aisle Runner (in front of Row 4) */}
      <group position={[6.4, 0.012, 5.0]}>
        <mesh receiveShadow>
          <boxGeometry args={[16.0, 0.01, 3.8]} />
          <meshStandardMaterial color={isLight ? '#e2e8f0' : '#0e131d'} roughness={0.5} metalness={0.04} />
        </mesh>
        <mesh position={[0, 0.006, -1.88]}>
          <boxGeometry args={[15.8, 0.004, 0.035]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0.006, 1.88]}>
          <boxGeometry args={[15.8, 0.004, 0.035]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.2} />
        </mesh>
      </group>

      {/* Wide Central Promenade (between Horizontal rows and the 12 Vertical stalls) */}
      <group position={[17.2, 0.014, -2.5]}>
        <mesh receiveShadow>
          <boxGeometry args={[4.2, 0.01, 26.5]} />
          <meshStandardMaterial color={isLight ? '#e2e8f0' : '#101520'} roughness={0.5} metalness={0.04} />
        </mesh>
        <mesh position={[-2.08, 0.006, 0]}>
          <boxGeometry args={[0.04, 0.004, 26.4]} />
          <meshStandardMaterial color="#34d399" emissive="#059669" emissiveIntensity={0.85} />
        </mesh>
        <mesh position={[2.08, 0.006, 0]}>
          <boxGeometry args={[0.04, 0.004, 26.4]} />
          <meshStandardMaterial color="#34d399" emissive="#059669" emissiveIntensity={0.85} />
        </mesh>
      </group>

      {/* West Walkway Runner (along Show & Tell boundary) */}
      <group position={[-3.8, 0.014, -2.5]}>
        <mesh receiveShadow>
          <boxGeometry args={[3.6, 0.01, 26.5]} />
          <meshStandardMaterial color={isLight ? '#e2e8f0' : '#101520'} roughness={0.5} metalness={0.04} />
        </mesh>
        <mesh position={[-1.78, 0.006, 0]}>
          <boxGeometry args={[0.04, 0.004, 26.4]} />
          <meshStandardMaterial color="#c084fc" emissive="#7c3aed" emissiveIntensity={0.85} />
        </mesh>
        <mesh position={[1.78, 0.006, 0]}>
          <boxGeometry args={[0.04, 0.004, 26.4]} />
          <meshStandardMaterial color="#c084fc" emissive="#7c3aed" emissiveIntensity={0.85} />
        </mesh>
      </group>

      {/* C. Seamless Connecting Concourse between Main Hall and Arenas */}
      <mesh position={[9, 0.006, -17.75]} receiveShadow>
        <boxGeometry args={[26, 0.01, 2.5]} />
        <meshStandardMaterial color={isLight ? '#e2e8f0' : '#141b27'} roughness={0.4} metalness={0.05} />
      </mesh>

      {/* Architectural Glass Balustrade along the Concourse Overlook */}
      <group position={[10.4, 0, -18.9]}>
        {/* Continuous Anodized Base Curb with Glowing Cyan Edge Channel */}
        <mesh position={[0, 0.04, 0]} receiveShadow>
          <boxGeometry args={[32.4, 0.08, 0.14]} />
          <meshStandardMaterial color="#1e293b" metalness={0.88} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0.085, 0]}>
          <boxGeometry args={[32.2, 0.015, 0.06]} />
          <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={1.4} />
        </mesh>

        {[-13.8, -9.2, -4.6, 0.0, 4.6, 9.2, 13.8].map((xGlass, idx) => (
          <group key={idx} position={[xGlass, 0.56, 0]}>
            {/* Tempered Laminated Balustrade Glass */}
            <mesh>
              <boxGeometry args={[4.4, 0.94, 0.03]} />
              <meshStandardMaterial
                color="#e0f2fe"
                transparent
                opacity={0.32}
                metalness={0.95}
                roughness={0.08}
              />
            </mesh>
            {/* Top Brushed Stainless Steel Handrail */}
            <mesh position={[0, 0.49, 0]}>
              <boxGeometry args={[4.44, 0.045, 0.07]} />
              <meshStandardMaterial color="#e2e8f0" metalness={0.98} roughness={0.1} />
            </mesh>
            {/* Secondary Mid-Rail */}
            <mesh position={[0, 0.36, 0]}>
              <boxGeometry args={[4.42, 0.02, 0.05]} />
              <meshStandardMaterial color="#94a3b8" metalness={0.95} roughness={0.15} />
            </mesh>
          </group>
        ))}

        {[-16.1, -11.5, -6.9, -2.3, 2.3, 6.9, 11.5, 16.1].map((xPost, idx) => (
          <group key={idx} position={[xPost, 0.55, 0]}>
            <mesh>
              <cylinderGeometry args={[0.028, 0.028, 1.1, 12]} />
              <meshStandardMaterial color="#e2e8f0" metalness={0.98} roughness={0.1} />
            </mesh>
            {/* Base Flange Collar */}
            <mesh position={[0, -0.49, 0]}>
              <cylinderGeometry args={[0.055, 0.06, 0.04, 12]} />
              <meshStandardMaterial color="#64748b" metalness={0.9} roughness={0.2} />
            </mesh>
          </group>
        ))}
      </group>

      {/* D. Top Arena Wing Floor Inlay */}
      <mesh position={[10.4, 0.005, -25.5]} receiveShadow>
        <boxGeometry args={[34.8, 0.01, 14.5]} />
        <meshStandardMaterial
          color={isLight ? '#e2e8f0' : '#0c1320'}
          roughness={isLight ? 0.55 : 0.45}
          metalness={isLight ? 0.08 : 0.25}
        />
      </mesh>

      {/* E. Concourse Corridor to Show & Tell (Fully Connected) */}
      <mesh position={[-11.5, 0.005, -3.0]} receiveShadow>
        <boxGeometry args={[9, 0.01, 8]} />
        <meshStandardMaterial color={isLight ? '#e2e8f0' : '#141a28'} roughness={0.45} metalness={0.05} />
      </mesh>

      {/* F. Left Angled Show & Tell Pavilion Inlay */}
      <group position={[-18.5, 0, -3.0]} rotation={[0, -0.38, 0]}>
        <mesh position={[0, 0.006, 0]} receiveShadow>
          <boxGeometry args={[22, 0.01, 13.5]} />
          <meshStandardMaterial
            color={isLight ? '#f5f3ff' : '#0f172a'}
            roughness={isLight ? 0.45 : 0.5}
            metalness={0.05}
          />
        </mesh>
        {/* Glowing Neon Purple & Emerald Perimeter Trim around Angled Pavilion Carpet */}
        <mesh position={[0, 0.013, -6.75]}>
          <boxGeometry args={[22.1, 0.006, 0.06]} />
          <meshStandardMaterial color="#c084fc" emissive="#7c3aed" emissiveIntensity={1.2} />
        </mesh>
        <mesh position={[0, 0.013, 6.75]}>
          <boxGeometry args={[22.1, 0.006, 0.06]} />
          <meshStandardMaterial color="#c084fc" emissive="#7c3aed" emissiveIntensity={1.2} />
        </mesh>
      </group>

      {/* Blueprint Visual Guide Lines */}
      <group position={[0, 0.018, 0]}>
        <mesh position={[-12, 0, -11]} rotation={[0, -0.38, 0]}>
          <boxGeometry args={[14, 0.005, 0.06]} />
          <meshBasicMaterial color={isLight ? '#64748b' : '#475569'} />
        </mesh>
        <mesh position={[-12, 0, 4.5]} rotation={[0, 0.38, 0]}>
          <boxGeometry args={[14, 0.005, 0.06]} />
          <meshBasicMaterial color={isLight ? '#64748b' : '#475569'} />
        </mesh>
      </group>

      {/* ========================================================= */}
      {/* 3. WEST WING PARTITIONS & GRAND PORTAL ARCH TO SHOW&TELL  */}
      {/* Extends continuously from North wall (-34.8) to South wall (+10.8) */}
      {/* With 9.0m Grand Entrance Portal to Show & Tell at [-7.5, 1.5] */}
      {/* ========================================================= */}
      <group position={[-7.0, 0, 0]}>
        {/* Grand Portal Framing Columns with Glowing Violet Light Channels */}
        {[-7.5, 1.5].map((zPillar, pIdx) => (
          <group key={pIdx} position={[0, 2.5, zPillar]}>
            <mesh castShadow>
              <boxGeometry args={[0.34, 5.0, 0.34]} />
              <meshStandardMaterial color={isLight ? '#334155' : '#0f172a'} metalness={0.9} roughness={0.18} />
            </mesh>
            {/* Base Plinth */}
            <mesh position={[0, -2.44, 0]}>
              <boxGeometry args={[0.46, 0.12, 0.46]} />
              <meshStandardMaterial color="#64748b" metalness={0.92} roughness={0.15} />
            </mesh>
            {/* Vertical Neon Violet Beacon Strip on East & West Faces */}
            <mesh position={[0.175, 0, 0]}>
              <boxGeometry args={[0.02, 4.5, 0.06]} />
              <meshStandardMaterial color="#c084fc" emissive="#9333ea" emissiveIntensity={2.0} />
            </mesh>
            <mesh position={[-0.175, 0, 0]}>
              <boxGeometry args={[0.02, 4.5, 0.06]} />
              <meshStandardMaterial color="#c084fc" emissive="#9333ea" emissiveIntensity={2.0} />
            </mesh>
          </group>
        ))}

        {/* Overhead Grand Portal Lintel Bridge (Clear 9.0m Open Walkway Below) */}
        <group position={[0, 4.82, -3.0]}>
          <mesh castShadow>
            <boxGeometry args={[0.38, 0.48, 9.3]} />
            <meshStandardMaterial color={isLight ? '#334155' : '#0f172a'} metalness={0.9} roughness={0.2} />
          </mesh>
          {/* Upper Crown Cap */}
          <mesh position={[0, 0.27, 0]}>
            <boxGeometry args={[0.46, 0.06, 9.4]} />
            <meshStandardMaterial color="#64748b" metalness={0.95} roughness={0.15} />
          </mesh>
          {/* Dual Neon Purple Archway Edge Trims */}
          <mesh position={[0, -0.22, 0]}>
            <boxGeometry args={[0.40, 0.045, 9.0]} />
            <meshStandardMaterial color="#c084fc" emissive="#7c3aed" emissiveIntensity={2.2} />
          </mesh>
          <mesh position={[0, 0.16, 0]}>
            <boxGeometry args={[0.40, 0.025, 9.0]} />
            <meshStandardMaterial color="#e879f9" emissive="#a855f7" emissiveIntensity={1.6} />
          </mesh>
        </group>

        {/* NORTH EXTENSION TO BACK WALL (z: -7.5 all the way to -34.8) */}
        {[-34.8, -30.0, -25.5, -21.0, -16.5, -12.0].map((zPos, idx) => (
          <group key={`n-col-${idx}`} position={[0, 2.5, zPos]}>
            <mesh castShadow>
              <boxGeometry args={[0.24, 5.0, 0.24]} />
              <meshStandardMaterial color={isLight ? '#475569' : '#0f172a'} metalness={0.9} roughness={0.2} />
            </mesh>
            <mesh position={[0, -2.45, 0]}>
              <boxGeometry args={[0.32, 0.1, 0.32]} />
              <meshStandardMaterial color="#64748b" metalness={0.9} roughness={0.2} />
            </mesh>
          </group>
        ))}

        {/* North Wing Glass Partitions with Top/Bottom Transom Rails */}
        {[-9.75, -18.75, -27.75].map((zGlass, idx) => (
          <group key={`n-glass-${idx}`} position={[0, 2.4, zGlass]}>
            <mesh>
              <boxGeometry args={[0.06, 4.7, 4.3]} />
              <meshStandardMaterial
                color={isLight ? '#e0f2fe' : '#38bdf8'}
                metalness={0.9}
                roughness={0.1}
                transparent
                opacity={isLight ? 0.32 : 0.38}
              />
            </mesh>
            <mesh position={[0, 2.38, 0]}>
              <boxGeometry args={[0.14, 0.08, 4.35]} />
              <meshStandardMaterial color="#475569" metalness={0.9} roughness={0.2} />
            </mesh>
            <mesh position={[0, -2.35, 0]}>
              <boxGeometry args={[0.14, 0.1, 4.35]} />
              <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.2} />
            </mesh>
          </group>
        ))}

        {/* North Wing Architectural Swing Gates along wall to -34.8 */}
        {[-14.25, -23.25, -32.4].map((zDoor, idx) => (
          <group key={`n-door-${idx}`} position={[0, 0, zDoor]}>
            <mesh position={[0, 1.5, -1.0]} castShadow>
              <boxGeometry args={[0.18, 3.0, 0.1]} />
              <meshStandardMaterial color={isLight ? '#334155' : '#1e293b'} metalness={0.8} />
            </mesh>
            <mesh position={[0, 1.5, 1.0]} castShadow>
              <boxGeometry args={[0.18, 3.0, 0.1]} />
              <meshStandardMaterial color={isLight ? '#334155' : '#1e293b'} metalness={0.8} />
            </mesh>
            <mesh position={[0, 3.05, 0]}>
              <boxGeometry args={[0.18, 0.1, 2.1]} />
              <meshStandardMaterial color={isLight ? '#334155' : '#1e293b'} metalness={0.8} />
            </mesh>
            <group position={[0, 0, 0.95]} rotation={[0, 0.85, 0]}>
              <mesh position={[0, 1.45, -0.85]} castShadow>
                <boxGeometry args={[0.05, 2.85, 1.7]} />
                <meshStandardMaterial color={isLight ? '#334155' : '#1e293b'} roughness={0.3} metalness={0.2} />
              </mesh>
              <mesh position={[-0.04, 1.3, -1.6]}>
                <cylinderGeometry args={[0.018, 0.018, 0.6, 8]} />
                <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.1} />
              </mesh>
            </group>
          </group>
        ))}

        {/* SOUTH EXTENSION TO FRONT OPENING (z: 1.5 all the way to 10.8) */}
        {[6.0, 10.8].map((zPos, idx) => (
          <group key={`s-col-${idx}`} position={[0, 2.5, zPos]}>
            <mesh castShadow>
              <boxGeometry args={[0.24, 5.0, 0.24]} />
              <meshStandardMaterial color={isLight ? '#475569' : '#0f172a'} metalness={0.9} roughness={0.2} />
            </mesh>
            <mesh position={[0, -2.45, 0]}>
              <boxGeometry args={[0.32, 0.1, 0.32]} />
              <meshStandardMaterial color="#64748b" metalness={0.9} roughness={0.2} />
            </mesh>
          </group>
        ))}

        {/* South Wing Glass Partition */}
        <group position={[0, 2.4, 3.75]}>
          <mesh>
            <boxGeometry args={[0.06, 4.7, 4.3]} />
            <meshStandardMaterial
              color={isLight ? '#e0f2fe' : '#38bdf8'}
              metalness={0.9}
              roughness={0.1}
              transparent
              opacity={isLight ? 0.32 : 0.38}
            />
          </mesh>
          <mesh position={[0, 2.38, 0]}>
            <boxGeometry args={[0.14, 0.08, 4.35]} />
            <meshStandardMaterial color="#475569" metalness={0.9} roughness={0.2} />
          </mesh>
          <mesh position={[0, -2.35, 0]}>
            <boxGeometry args={[0.14, 0.1, 4.35]} />
            <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.2} />
          </mesh>
        </group>

        {/* South Wing Architectural Swing Gate to wall at 10.8 */}
        <group position={[0, 0, 8.4]}>
          <mesh position={[0, 1.5, -1.0]} castShadow>
            <boxGeometry args={[0.18, 3.0, 0.1]} />
            <meshStandardMaterial color={isLight ? '#334155' : '#1e293b'} metalness={0.8} />
          </mesh>
          <mesh position={[0, 1.5, 1.0]} castShadow>
            <boxGeometry args={[0.18, 3.0, 0.1]} />
            <meshStandardMaterial color={isLight ? '#334155' : '#1e293b'} metalness={0.8} />
          </mesh>
          <mesh position={[0, 3.05, 0]}>
            <boxGeometry args={[0.18, 0.1, 2.1]} />
            <meshStandardMaterial color={isLight ? '#334155' : '#1e293b'} metalness={0.8} />
          </mesh>
          <group position={[0, 0, 0.95]} rotation={[0, 0.85, 0]}>
            <mesh position={[0, 1.45, -0.85]} castShadow>
              <boxGeometry args={[0.05, 2.85, 1.7]} />
              <meshStandardMaterial color={isLight ? '#334155' : '#1e293b'} roughness={0.3} metalness={0.2} />
            </mesh>
            <mesh position={[-0.04, 1.3, -1.6]}>
              <cylinderGeometry args={[0.018, 0.018, 0.6, 8]} />
              <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.1} />
            </mesh>
          </group>
        </group>
      </group>

      {/* ========================================================= */}
      {/* 4. HYDROPONICS / BIO-GARDEN SMART FARM BIOME MODULE        */}
      {/* Aligned alongside B08 in the Single Vertical Line          */}
      {/* ========================================================= */}
      <group position={[23.6, 0, 9.7]} rotation={[0, -Math.PI / 2, 0]}>
        {/* Sculpted Multi-Tier Dais with Emerald Bio-Glow Perimeter */}
        <mesh position={[0, 0.04, 0]} receiveShadow castShadow>
          <boxGeometry args={[2.4, 0.08, 1.8]} />
          <meshStandardMaterial color={isLight ? '#334155' : '#0b111e'} metalness={0.8} roughness={0.25} />
        </mesh>
        <mesh position={[0, 0.085, 0]}>
          <boxGeometry args={[2.32, 0.018, 1.72]} />
          <meshStandardMaterial color="#4ade80" emissive="#16a34a" emissiveIntensity={1.6} />
        </mesh>

        {/* 4 Corner Structural Chrome Hydro-Columns & Glass Bio-Canopy Frame */}
        {[
          [-1.08, 0.92, -0.76],
          [1.08, 0.92, -0.76],
          [-1.08, 0.92, 0.76],
          [1.08, 0.92, 0.76],
        ].map(([cx, cy, cz], cIdx) => (
          <mesh key={cIdx} position={[cx, cy, cz]} castShadow>
            <cylinderGeometry args={[0.025, 0.025, 1.72, 12]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.12} />
          </mesh>
        ))}

        {/* Overhead Glass Greenhouse Canopy Roof & UV Light Bar */}
        <group position={[0, 1.78, 0]}>
          <mesh>
            <boxGeometry args={[2.24, 0.04, 1.62]} />
            <meshStandardMaterial
              color="#e0f2fe"
              transparent
              opacity={0.35}
              metalness={0.95}
              roughness={0.08}
            />
          </mesh>
          <mesh position={[0, -0.03, 0]}>
            <boxGeometry args={[2.1, 0.02, 0.08]} />
            <meshStandardMaterial color="#c084fc" emissive="#a855f7" emissiveIntensity={2.5} />
          </mesh>
        </group>

        {/* 3 Tiered Aero-Hydroponic Grow Trays with UV Grow-Light Hoods & Lush Foliage */}
        {[-0.48, 0.0, 0.48].map((zPos, tier) => (
          <group key={tier} position={[0, 0.38 + tier * 0.44, zPos]}>
            {/* White Hydroponic Nutrient Channel Trough */}
            <mesh castShadow receiveShadow>
              <boxGeometry args={[1.65, 0.12, 0.36]} />
              <meshStandardMaterial color="#f8fafc" roughness={0.25} metalness={0.15} />
            </mesh>
            {/* Glowing Nutrient Water Line Inside Trough */}
            <mesh position={[0, 0.055, 0]}>
              <boxGeometry args={[1.58, 0.015, 0.28]} />
              <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={0.8} />
            </mesh>
            {/* Underslung UV-Magenta & Full-Spectrum Grow Light Strip */}
            <mesh position={[0, -0.075, 0]}>
              <boxGeometry args={[1.6, 0.022, 0.06]} />
              <meshStandardMaterial color="#e879f9" emissive="#a855f7" emissiveIntensity={2.8} />
            </mesh>
            {/* Organic Multi-Sphere Botanical Canopy */}
            {[-0.65, -0.39, -0.13, 0.13, 0.39, 0.65].map((xPlant, pIdx) => (
              <group key={pIdx} position={[xPlant, 0.14, 0]}>
                <mesh castShadow>
                  <sphereGeometry args={[0.12, 12, 12]} />
                  <meshStandardMaterial color={pIdx % 2 === 0 ? '#16a34a' : '#22c55e'} roughness={0.75} />
                </mesh>
                <mesh position={[0.04, 0.06, 0.025]} castShadow>
                  <sphereGeometry args={[0.085, 10, 10]} />
                  <meshStandardMaterial color="#4ade80" roughness={0.7} />
                </mesh>
                <mesh position={[-0.035, 0.05, -0.02]} castShadow>
                  <sphereGeometry args={[0.07, 8, 8]} />
                  <meshStandardMaterial color="#86efac" roughness={0.75} />
                </mesh>
              </group>
            ))}
          </group>
        ))}

        {/* Left Dual Cylindrical Aqua-Nutrient Bioreactor Tanks */}
        {[-0.32, 0.28].map((zTank, tIdx) => (
          <group key={tIdx} position={[-0.95, 0.52, zTank]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.16, 0.16, 0.85, 18]} />
              <meshStandardMaterial color="#38bdf8" transparent opacity={0.55} roughness={0.08} metalness={0.9} />
            </mesh>
            <mesh position={[0, -0.06, 0]}>
              <cylinderGeometry args={[0.135, 0.135, 0.68, 16]} />
              <meshStandardMaterial color="#0284c7" emissive="#0369a1" emissiveIntensity={1.2} />
            </mesh>
            {/* Top & Bottom Chrome Caps */}
            <mesh position={[0, 0.43, 0]}>
              <cylinderGeometry args={[0.17, 0.17, 0.03, 18]} />
              <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.12} />
            </mesh>
            <mesh position={[0, -0.43, 0]}>
              <cylinderGeometry args={[0.17, 0.17, 0.03, 18]} />
              <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.12} />
            </mesh>
          </group>
        ))}

        {/* Right Digital Climate & pH Telemetry Control Kiosk */}
        <group position={[0.96, 0.55, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.18, 0.92, 0.44]} />
            <meshStandardMaterial color="#0f172a" metalness={0.85} roughness={0.2} />
          </mesh>
          <mesh position={[0.095, 0.22, 0]} rotation={[0, Math.PI / 2, -0.2]}>
            <planeGeometry args={[0.34, 0.22]} />
            <meshStandardMaterial color="#10b981" emissive="#059669" emissiveIntensity={1.6} />
          </mesh>
        </group>

        {/* Floating Green Cross '+' Eco Indicator */}
        <group position={[0, 2.25, 0]}>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.48, 0.14, 0.08]} />
            <meshStandardMaterial color="#22c55e" emissive="#16a34a" emissiveIntensity={2.2} />
          </mesh>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.14, 0.48, 0.08]} />
            <meshStandardMaterial color="#22c55e" emissive="#16a34a" emissiveIntensity={2.2} />
          </mesh>
          <mesh rotation={[0, 0, 0]}>
            <torusGeometry args={[0.38, 0.018, 10, 28]} />
            <meshBasicMaterial color="#4ade80" />
          </mesh>
        </group>
      </group>

      {/* ========================================================= */}
      {/* 5. STRATEGIC ZONE ARCHITECTURAL DOWNLIGHTS (HIGH FPS OPTIMIZATION: 8 LIGHTS VS 42) */}
      <group position={[0, 0, 0]}>
        {/* Main Hall - Quadrant 1 (North-West) */}
        <pointLight
          position={[4.0, 5.5, -11.0]}
          intensity={isLight ? 2.8 : 4.0}
          distance={22}
          color="#fff8ed"
          decay={2}
        />
        {/* Main Hall - Quadrant 2 (North-East) */}
        <pointLight
          position={[16.0, 5.5, -11.0]}
          intensity={isLight ? 2.8 : 4.0}
          distance={22}
          color="#fff8ed"
          decay={2}
        />
        {/* Main Hall - Quadrant 3 (South-West) */}
        <pointLight
          position={[4.0, 5.5, 0.0]}
          intensity={isLight ? 2.8 : 4.0}
          distance={22}
          color="#f0f9ff"
          decay={2}
        />
        {/* Main Hall - Quadrant 4 (South-East) */}
        <pointLight
          position={[16.0, 5.5, 0.0]}
          intensity={isLight ? 2.8 : 4.0}
          distance={22}
          color="#ecfdf5"
          decay={2}
        />
        {/* Show & Tell Pavilion - North Bay */}
        <pointLight
          position={[-18.5, 5.5, -6.0]}
          intensity={isLight ? 3.0 : 4.2}
          distance={20}
          color="#f3e8ff"
          decay={2}
        />
        {/* Show & Tell Pavilion - South Bay */}
        <pointLight
          position={[-18.5, 5.5, 1.5]}
          intensity={isLight ? 3.0 : 4.2}
          distance={20}
          color="#f3e8ff"
          decay={2}
        />
        {/* Concourse West Corridor */}
        <pointLight
          position={[-4.0, 5.5, -18.0]}
          intensity={isLight ? 2.8 : 4.0}
          distance={18}
          color="#fffdf5"
          decay={2}
        />
        {/* Concourse East Corridor */}
        <pointLight
          position={[20.0, 5.5, -18.0]}
          intensity={isLight ? 2.8 : 4.0}
          distance={18}
          color="#fffdf5"
          decay={2}
        />
      </group>
    </>
  );
}
