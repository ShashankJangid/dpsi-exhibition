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
      <ambientLight intensity={isLight ? 0.85 : 0.95} color={isLight ? '#f8fafc' : '#ffffff'} />
      
      <directionalLight
        position={[25, 45, 25]}
        intensity={isLight ? 1.2 : 1.5}
        color={isLight ? '#fffdf7' : '#ffffff'}
        castShadow={!isMobile}
        shadow-mapSize={isMobile ? [512, 512] : [1536, 1536]}
        shadow-camera-left={-35}
        shadow-camera-right={35}
        shadow-camera-top={35}
        shadow-camera-bottom={-35}
        shadow-bias={0.0003}
      />

      <directionalLight
        position={[-25, 35, -25]}
        intensity={isLight ? 0.5 : 0.6}
        color={isLight ? '#bae6fd' : '#94a3b8'}
      />

      {/* ========================================================= */}
      {/* 1. ARCHITECTURAL ENCLOSURE BOX WITH FRONT OPENING         */}
      {/* (Back Wall, Left Wall, Right Wall, Ceiling, Front Opening)*/}
      {/* ========================================================= */}
      <group position={[-2.0, 0, -12.0]}>
        {/* BACK WALL (North Wall at z = -22.8 relative to group => world z = -34.8) */}
        <group position={[0, 5.25, -22.8]}>
          <mesh receiveShadow>
            <boxGeometry args={[60, 10.5, 0.4]} />
            <meshStandardMaterial
              color={isLight ? '#94a3b8' : '#0c1322'}
              roughness={0.4}
              metalness={0.15}
            />
          </mesh>
          {/* Decorative Horizontal Architectural Shadow Reveals */}
          {[-3.0, 0.0, 3.0].map((yReveal, idx) => (
            <mesh key={idx} position={[0, yReveal, 0.21]}>
              <boxGeometry args={[59.8, 0.04, 0.02]} />
              <meshStandardMaterial color={isLight ? '#64748b' : '#040812'} />
            </mesh>
          ))}
          {/* North Wall Top Cove Lighting */}
          <pointLight position={[0, 4.8, 1.2]} intensity={isLight ? 3.0 : 4.5} distance={30} color="#fef08a" decay={2} />
        </group>

        {/* LEFT WALL (West Wall at x = -29.8 relative to group => world x = -31.8) */}
        <group position={[-29.8, 5.25, 0]}>
          <mesh receiveShadow>
            <boxGeometry args={[0.4, 10.5, 45.6]} />
            <meshStandardMaterial
              color={isLight ? '#94a3b8' : '#0c1322'}
              roughness={0.4}
              metalness={0.15}
            />
          </mesh>
          {/* Upper Clerestory Window Strips along West Wall */}
          {[-15, -5, 5, 15].map((zWin, idx) => (
            <group key={idx} position={[0.21, 2.8, zWin]}>
              <mesh>
                <boxGeometry args={[0.02, 2.4, 6.5]} />
                <meshStandardMaterial
                  color="#e0f2fe"
                  transparent
                  opacity={isLight ? 0.45 : 0.25}
                  metalness={0.9}
                  roughness={0.1}
                />
              </mesh>
            </group>
          ))}
          <pointLight position={[1.5, 4.8, 0]} intensity={isLight ? 3.0 : 4.5} distance={25} color="#bae6fd" decay={2} />
        </group>

        {/* RIGHT WALL (East Wall at x = 29.8 relative to group => world x = 27.8) */}
        <group position={[29.8, 5.25, 0]}>
          {/* Clean Acoustic Oak Wood Paneling */}
          <mesh receiveShadow>
            <boxGeometry args={[0.4, 10.5, 45.6]} />
            <meshStandardMaterial
              color={isLight ? '#9a7049' : '#1c1511'}
              roughness={0.4}
              metalness={0.1}
            />
          </mesh>
          {/* Vertical Architectural Slats */}
          {[-18, -12, -6, 0, 6, 12, 18].map((zSlat, idx) => (
            <mesh key={idx} position={[-0.22, 0, zSlat]}>
              <boxGeometry args={[0.06, 10.4, 0.12]} />
              <meshStandardMaterial color={isLight ? '#6b4d30' : '#0d0907'} metalness={0.2} />
            </mesh>
          ))}
          <pointLight position={[-1.5, 4.8, 0]} intensity={isLight ? 3.0 : 4.5} distance={25} color="#fed7aa" decay={2} />
        </group>

        {/* CEILING / ROOF SLAB (at y = 10.5) */}
        <group position={[0, 10.5, 0]}>
          <mesh receiveShadow>
            <boxGeometry args={[60, 0.4, 45.6]} />
            <meshStandardMaterial
              color={isLight ? '#64748b' : '#080d18'}
              roughness={0.5}
              metalness={0.2}
            />
          </mesh>
          {/* Recessed Skylight Aperture Bands */}
          {[-10, 10].map((xSky, idx) => (
            <mesh key={idx} position={[xSky, -0.18, 0]}>
              <boxGeometry args={[8.0, 0.05, 40]} />
              <meshStandardMaterial
                color={isLight ? '#f8fafc' : '#1e293b'}
                emissive={isLight ? '#bae6fd' : '#0284c7'}
                emissiveIntensity={isLight ? 0.35 : 0.6}
              />
            </mesh>
          ))}
        </group>

        {/* 
          FRONT OPENING (South Side at z = 22.8 relative to group => world z = 10.8):
          Architectural Portal Frame with a WIDE OPEN FRONT so the viewer looks
          directly inside into the exhibition!
        */}
        <group position={[0, 5.25, 22.8]}>
          {/* Left Column of Front Opening */}
          <mesh position={[-29.8, 0, 0]} castShadow>
            <boxGeometry args={[0.6, 10.5, 0.6]} />
            <meshStandardMaterial color={isLight ? '#475569' : '#0f172a'} metalness={0.8} />
          </mesh>
          {/* Right Column of Front Opening */}
          <mesh position={[29.8, 0, 0]} castShadow>
            <boxGeometry args={[0.6, 10.5, 0.6]} />
            <meshStandardMaterial color={isLight ? '#475569' : '#0f172a'} metalness={0.8} />
          </mesh>
          {/* Top Lintel Beam of Front Opening */}
          <mesh position={[0, 5.0, 0]} castShadow>
            <boxGeometry args={[60.2, 0.6, 0.6]} />
            <meshStandardMaterial color={isLight ? '#475569' : '#0f172a'} metalness={0.8} />
          </mesh>
        </group>
      </group>

      {/* ========================================================= */}
      {/* 2. UNIFIED CONTINUOUS MONOLITHIC FLOOR (ZERO BLANK VOIDS) */}
      {/* ========================================================= */}

      {/* 
        A. Continuous Wall-to-Wall Foundation Slab 
        Covers the ENTIRE interior from West Wall (x = -31.8) to East Wall (x = 27.8)
        and North Wall (z = -34.8) to South Opening (z = 10.8).
        Ensures NO holes, NO voids, and 100% connected solid ground!
      */}
      <mesh position={[-2.0, -0.4, -12.0]} receiveShadow>
        <boxGeometry args={[59.6, 0.8, 45.6]} />
        <meshStandardMaterial
          color={isLight ? '#dbeafe' : '#0a101d'}
          roughness={isLight ? 0.35 : 0.32}
          metalness={isLight ? 0.05 : 0.22}
        />
      </mesh>

      {/* B. Main Exhibition Hall Flooring Zone (Warm Oak Showroom Inlay) */}
      <mesh position={[9, 0.005, -4.5]} receiveShadow>
        <boxGeometry args={[34, 0.01, 25]} />
        <meshStandardMaterial
          color={isLight ? '#c89965' : '#182030'}
          roughness={isLight ? 0.4 : 0.42}
          metalness={isLight ? 0.05 : 0.12}
        />
      </mesh>

      {/* Walkway Runners (Architectural inlays across the main hall aisles) */}
      <mesh position={[8.5, 0.012, -10.75]} receiveShadow>
        <boxGeometry args={[23.5, 0.01, 3.8]} />
        <meshStandardMaterial color={isLight ? '#b88652' : '#121824'} roughness={0.5} metalness={0.04} />
      </mesh>

      <mesh position={[8.5, 0.012, 0.5]} receiveShadow>
        <boxGeometry args={[23.5, 0.01, 4.2]} />
        <meshStandardMaterial color={isLight ? '#b88652' : '#121824'} roughness={0.5} metalness={0.04} />
      </mesh>

      <mesh position={[19.8, 0.014, -4.5]} receiveShadow>
        <boxGeometry args={[3.2, 0.01, 24.5]} />
        <meshStandardMaterial color={isLight ? '#ad7d4c' : '#101520'} roughness={0.5} metalness={0.04} />
      </mesh>

      <mesh position={[-3.8, 0.014, -4.5]} receiveShadow>
        <boxGeometry args={[3.6, 0.01, 24.5]} />
        <meshStandardMaterial color={isLight ? '#ad7d4c' : '#101520'} roughness={0.5} metalness={0.04} />
      </mesh>

      <mesh position={[8.5, 0.014, -5.5]} receiveShadow>
        <boxGeometry args={[23.5, 0.01, 1.8]} />
        <meshStandardMaterial color={isLight ? '#a37445' : '#0e131d'} roughness={0.5} metalness={0.04} />
      </mesh>

      {/* C. Seamless Connecting Concourse between Main Hall and Arenas */}
      <mesh position={[9, 0.006, -17.75]} receiveShadow>
        <boxGeometry args={[26, 0.01, 2.5]} />
        <meshStandardMaterial color={isLight ? '#b88652' : '#141b27'} roughness={0.4} metalness={0.05} />
      </mesh>

      {/* Glass Balustrade along the Concourse Overlook */}
      <group position={[9, 0, -18.9]}>
        {[-8, -2, 4, 10].map((xGlass, idx) => (
          <group key={idx} position={[xGlass, 0.55, 0]}>
            <mesh>
              <boxGeometry args={[4.8, 0.95, 0.03]} />
              <meshStandardMaterial
                color="#e0f2fe"
                transparent
                opacity={0.3}
                metalness={0.95}
                roughness={0.08}
              />
            </mesh>
            <mesh position={[0, 0.5, 0]}>
              <boxGeometry args={[4.82, 0.04, 0.06]} />
              <meshStandardMaterial color="#cbd5e1" metalness={0.98} roughness={0.1} />
            </mesh>
          </group>
        ))}
        {[-10.5, -5.5, -0.5, 4.5, 9.5, 12.5].map((xPost, idx) => (
          <mesh key={idx} position={[xPost, 0.55, 0]}>
            <cylinderGeometry args={[0.025, 0.025, 1.1, 10]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.98} roughness={0.1} />
          </mesh>
        ))}
      </group>

      {/* D. Top Arena Wing Floor Inlay */}
      <mesh position={[8.5, 0.005, -25.5]} receiveShadow>
        <boxGeometry args={[33, 0.01, 14.5]} />
        <meshStandardMaterial
          color={isLight ? '#94a3b8' : '#0c1320'}
          roughness={isLight ? 0.55 : 0.45}
          metalness={isLight ? 0.08 : 0.25}
        />
      </mesh>

      {/* E. Concourse Corridor to Show & Tell (Fully Connected) */}
      <mesh position={[-11.5, 0.005, -3.0]} receiveShadow>
        <boxGeometry args={[9, 0.01, 8]} />
        <meshStandardMaterial color={isLight ? '#b88652' : '#141a28'} roughness={0.45} metalness={0.05} />
      </mesh>

      {/* F. Left Angled Show & Tell Pavilion Inlay */}
      <group position={[-18.5, 0, -3.0]} rotation={[0, -0.38, 0]}>
        <mesh position={[0, 0.006, 0]} receiveShadow>
          <boxGeometry args={[22, 0.01, 13.5]} />
          <meshStandardMaterial
            color={isLight ? '#99cfb9' : '#0f382a'}
            roughness={isLight ? 0.45 : 0.5}
            metalness={0.05}
          />
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
      {/* 3. THE 4 WEST ENTRANCE DOORS & WEST PARTITION WALL        */}
      {/* ========================================================= */}
      <group position={[-7.0, 0, 0]}>
        {[-16.5, -11.5, -8.0, -3.0, 3.5, 8.0].map((zPos, idx) => (
          <mesh key={idx} position={[0, 2.5, zPos]} castShadow>
            <boxGeometry args={[0.2, 5.0, 0.2]} />
            <meshStandardMaterial color={isLight ? '#475569' : '#0f172a'} metalness={0.9} roughness={0.2} />
          </mesh>
        ))}

        {[-9.75, -2.5, 5.75].map((zPos, idx) => (
          <mesh key={idx} position={[0, 2.4, zPos]}>
            <boxGeometry args={[0.06, 4.8, 3.2]} />
            <meshStandardMaterial
              color={isLight ? '#e0f2fe' : '#38bdf8'}
              metalness={0.9}
              roughness={0.1}
              transparent
              opacity={isLight ? 0.3 : 0.4}
            />
          </mesh>
        ))}

        {/* 4 Architectural Swing Doors */}
        {[-14.0, -5.5, 1.5, 7.5].map((zDoor, i) => (
          <group key={i} position={[0, 0, zDoor]}>
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
                <meshStandardMaterial color={isLight ? '#a87848' : '#1e293b'} roughness={0.3} metalness={0.2} />
              </mesh>
              <mesh position={[-0.04, 1.3, -1.6]}>
                <cylinderGeometry args={[0.018, 0.018, 0.6, 8]} />
                <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.1} />
              </mesh>
            </group>
            <mesh position={[-0.4, 0.015, 0.0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[1.5, 1.56, 24, 1, 0, Math.PI / 2.2]} />
              <meshBasicMaterial color={isLight ? '#0284c7' : '#38bdf8'} />
            </mesh>
          </group>
        ))}
      </group>

      {/* ========================================================= */}
      {/* 4. HYDROPONICS / BIO-GARDEN SMART FARM (NEXT TO B03)      */}
      {/* ========================================================= */}
      <group position={[17.0, 0, 4.5]}>
        <mesh position={[0, 0.06, 0]} receiveShadow castShadow>
          <boxGeometry args={[2.4, 0.12, 1.8]} />
          <meshStandardMaterial color={isLight ? '#334155' : '#0f172a'} metalness={0.7} />
        </mesh>
        
        {[-0.5, 0.0, 0.5].map((zPos, tier) => (
          <group key={tier} position={[0, 0.35 + tier * 0.45, zPos]}>
            <mesh castShadow>
              <boxGeometry args={[2.2, 0.14, 0.35]} />
              <meshStandardMaterial color="#f8fafc" roughness={0.3} />
            </mesh>
            <mesh position={[0, -0.08, 0]}>
              <boxGeometry args={[2.1, 0.02, 0.05]} />
              <meshStandardMaterial color="#c084fc" emissive="#a855f7" emissiveIntensity={2.5} />
            </mesh>
            {[-0.8, -0.48, -0.16, 0.16, 0.48, 0.8].map((xPlant, pIdx) => (
              <group key={pIdx} position={[xPlant, 0.15, 0]}>
                <mesh castShadow>
                  <sphereGeometry args={[0.13, 12, 12]} />
                  <meshStandardMaterial color={pIdx % 2 === 0 ? '#16a34a' : '#22c55e'} roughness={0.8} />
                </mesh>
                <mesh position={[0.04, 0.06, 0.02]} castShadow>
                  <sphereGeometry args={[0.09, 8, 8]} />
                  <meshStandardMaterial color="#4ade80" roughness={0.8} />
                </mesh>
              </group>
            ))}
          </group>
        ))}

        <group position={[-0.95, 0.4, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.3, 0.65, 0.5]} />
            <meshStandardMaterial color="#38bdf8" transparent opacity={0.65} roughness={0.1} />
          </mesh>
          <mesh position={[0, -0.08, 0]}>
            <boxGeometry args={[0.26, 0.45, 0.46]} />
            <meshStandardMaterial color="#0284c7" emissive="#0369a1" emissiveIntensity={0.6} />
          </mesh>
        </group>

        {/* Floating Green Cross '+' Eco Indicator */}
        <group position={[0, 2.2, 0]}>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.48, 0.14, 0.08]} />
            <meshStandardMaterial color="#22c55e" emissive="#16a34a" emissiveIntensity={2.0} />
          </mesh>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.14, 0.48, 0.08]} />
            <meshStandardMaterial color="#22c55e" emissive="#16a34a" emissiveIntensity={2.0} />
          </mesh>
        </group>
      </group>

      {/* ========================================================= */}
      {/* 5. DEDICATED LIGHTING ALL OVER STALLS & ARENAS           */}
      {/* ========================================================= */}
      <group position={[0, 0, 0]}>
        {/* Row 1 Stalls (P01 - P06) Downlights */}
        {[0.0, 3.4, 6.8, 10.2, 13.6, 17.0].map((xStall, idx) => (
          <pointLight
            key={`r1-${idx}`}
            position={[xStall, 4.2, -14.0]}
            intensity={isLight ? 2.2 : 3.5}
            distance={8}
            color="#fff8ed"
            decay={2}
          />
        ))}

        {/* Upper East Column Stalls (P07 - P10) Downlights */}
        {[-13.5, -10.5, -7.5, -4.5].map((zStall, idx) => (
          <pointLight
            key={`east-p-${idx}`}
            position={[22.5, 4.2, zStall]}
            intensity={isLight ? 2.2 : 3.5}
            distance={8}
            color="#fff8ed"
            decay={2}
          />
        ))}

        {/* Row 2 Stalls (D04 - P11) Downlights */}
        {[0.0, 3.4, 6.8, 10.2, 13.6, 17.0].map((xStall, idx) => (
          <pointLight
            key={`r2-${idx}`}
            position={[xStall, 4.2, -7.5]}
            intensity={isLight ? 2.2 : 3.5}
            distance={8}
            color="#f0f9ff"
            decay={2}
          />
        ))}

        {/* Row 3 Stalls (D05 - D10) Downlights */}
        {[0.0, 3.4, 6.8, 10.2, 13.6, 17.0].map((xStall, idx) => (
          <pointLight
            key={`r3-${idx}`}
            position={[xStall, 4.2, -3.5]}
            intensity={isLight ? 2.2 : 3.5}
            distance={8}
            color="#f0f9ff"
            decay={2}
          />
        ))}

        {/* Lower East Column Stalls (D11 - B02) Downlights */}
        {[-1.5, 1.5, 4.5, 7.5].map((zStall, idx) => (
          <pointLight
            key={`east-d-${idx}`}
            position={[22.5, 4.2, zStall]}
            intensity={isLight ? 2.2 : 3.5}
            distance={8}
            color="#ecfdf5"
            decay={2}
          />
        ))}

        {/* Row 4 Stalls (B07 - B03) Downlights */}
        {[0.0, 3.4, 6.8, 10.2, 13.6].map((xStall, idx) => (
          <pointLight
            key={`r4-${idx}`}
            position={[xStall, 4.2, 4.5]}
            intensity={isLight ? 2.2 : 3.5}
            distance={8}
            color="#ecfdf5"
            decay={2}
          />
        ))}

        {/* Concourse Stalls Outside Arena (R01, R02, S01, S02) Downlights */}
        {[0.5, 4.2, 12.8, 16.5].map((xStall, idx) => (
          <pointLight
            key={`pit-${idx}`}
            position={[xStall, 4.2, -18.0]}
            intensity={isLight ? 2.5 : 3.8}
            distance={8}
            color="#fffdf5"
            decay={2}
          />
        ))}

        {/* Left Pavilion (Show & Tell ST01 - ST08) Downlights */}
        {[-21.0, -18.5, -16.0, -13.5, -11.0].map((xStall, idx) => (
          <pointLight
            key={`st-${idx}`}
            position={[xStall, 4.0, -3.5]}
            intensity={isLight ? 2.2 : 3.5}
            distance={8}
            color="#faf5ff"
            decay={2}
          />
        ))}
      </group>

      {/* ========================================================= */}
      {/* 6. CEILING SPACE-FRAME TRUSS SYSTEM & SPOTLIGHT FIXTURES  */}
      {/* ========================================================= */}
      <group position={[9, 8.5, -4.5]}>
        {[-10, 0, 10].map((xTruss, i) => (
          <group key={i} position={[xTruss, 0, 0]}>
            <mesh>
              <boxGeometry args={[0.2, 0.25, 26]} />
              <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.3} />
            </mesh>
            {[-10, -5, 0, 5, 10].map((zSpot, j) => (
              <group key={j} position={[0, -0.2, zSpot]}>
                <mesh>
                  <cylinderGeometry args={[0.12, 0.16, 0.28, 12]} />
                  <meshStandardMaterial color="#334155" metalness={0.8} />
                </mesh>
                <mesh position={[0, -0.15, 0]}>
                  <circleGeometry args={[0.11, 12]} />
                  <meshStandardMaterial color="#fef08a" emissive="#fef08a" emissiveIntensity={2.5} />
                </mesh>
              </group>
            ))}
          </group>
        ))}

        {[-10, -5, 0, 5, 10].map((zCross, i) => (
          <mesh key={i} position={[0, 0, zCross]}>
            <boxGeometry args={[32, 0.18, 0.18]} />
            <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.3} />
          </mesh>
        ))}
      </group>
    </>
  );
}
