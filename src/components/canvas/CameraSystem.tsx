'use client';

import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { CameraControls } from '@react-three/drei';
import * as THREE from 'three';
import { useExhibitionStore } from '@/store/useExhibitionStore';
import { initSpatialAudio, updateSpatialAudio, stopSpatialAudio } from '@/lib/sound';

export default function CameraSystem() {
  const controlsRef = useRef<CameraControls | null>(null);
  const cameraConfig = useExhibitionStore((state) => state.cameraConfig);
  const isMobile = useExhibitionStore((state) => state.isMobile);

  const lastUpdateRef = useRef<number>(0);
  const targetVec = useRef(new THREE.Vector3());

  useEffect(() => {
    // Attempt lazy initialization of spatial soundscape (activates on first user gesture)
    initSpatialAudio();
    return () => {
      stopSpatialAudio();
    };
  }, []);

  useFrame(({ camera }) => {
    // Smooth spatial arena audio volume attenuation based on camera coordinates
    updateSpatialAudio(camera.position.x, camera.position.z);

    // Throttle minimap state updates to ~15fps (66ms) to avoid unnecessary React re-renders
    const now = performance.now();
    if (now - lastUpdateRef.current > 66) {
      lastUpdateRef.current = now;
      if (controlsRef.current) {
        controlsRef.current.getTarget(targetVec.current);
        useExhibitionStore.getState().setLiveCameraTracking(
          [camera.position.x, camera.position.z],
          [targetVec.current.x, targetVec.current.z]
        );
      }
    }
  });

  useEffect(() => {
    if (!controlsRef.current) return;

    const [px, py, pz] = cameraConfig.position;
    const [tx, ty, tz] = cameraConfig.target;

    // Smoothly fly camera to new position and target with animation damping
    controlsRef.current.setLookAt(px, py, pz, tx, ty, tz, true);
  }, [cameraConfig]);

  return (
    <CameraControls
      ref={controlsRef}
      makeDefault
      smoothTime={isMobile ? 0.65 : 0.75}
      minDistance={isMobile ? 5 : 4}
      maxDistance={isMobile ? 320 : 260} // Allows zooming out to view the full floating floor & Milky Way
      maxPolarAngle={Math.PI / 2.02} // Prevent camera going below floor level
      minPolarAngle={Math.PI / 10}
      dollySpeed={isMobile ? 1.0 : 0.85}
      truckSpeed={isMobile ? 1.0 : 0.85}
      azimuthRotateSpeed={isMobile ? 0.8 : 0.9}
      polarRotateSpeed={isMobile ? 0.7 : 0.8}
      draggingSmoothTime={0.12}
    />
  );
}
