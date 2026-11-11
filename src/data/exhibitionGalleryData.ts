export type PictureFrameStyle = "black" | "oak" | "white";

export interface PictureRailItem {
  id: string;
  title: string;
  artist?: string;
  year?: string;
  image: string;
  aspect?: number;
  frame?: PictureFrameStyle;
  mat?: boolean;
  drop?: number;
  tag?: string;
  details?: string[];
}

export const EXHIBITION_GALLERY_ITEMS: PictureRailItem[] = [
  {
    id: "p01",
    title: "Stepwise AI: Biomechanical Gait Analysis",
    artist: "Pulkit Chandra (11-C) & Aryan Jindal (11-A)",
    year: "2026",
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=85",
    aspect: 0.82,
    frame: "black",
    mat: true,
    drop: 0.05,
    tag: "Booth P01 • Physical",
    details: [
      "Hardware: ESP32-S3 + FSR Sensor Matrix",
      "Software: TensorFlow Lite Edge Inference",
      "Domain: Biomechanical Rehabilitation",
      "Edition: DPS Indirapuram Summit '26",
    ],
  },
  {
    id: "p02",
    title: "Move Smarter: Edge ADAS Collision Avoidance",
    artist: "Srishti Jain, Shivangi Negi, Pranshoo Mittal",
    year: "2026",
    image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=1200&q=85",
    aspect: 0.76,
    frame: "oak",
    mat: true,
    drop: -0.06,
    tag: "Booth P02 • Physical",
    details: [
      "Vision: Dual-Camera Stereoscopic Pipeline",
      "Safety: Ultrasonic Array + CAN Bus Hook",
      "Domain: Automotive Edge AI",
      "Edition: DPS Indirapuram Summit '26",
    ],
  },
  {
    id: "p04",
    title: "Neural Vision: Real-time Defect Classifier",
    artist: "Aarav Sharma (12-B) & Riya Verma (12-D)",
    year: "2026",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=85",
    aspect: 0.84,
    frame: "white",
    mat: false,
    drop: 0.12,
    tag: "Booth D01 • Digital",
    details: [
      "Architecture: YOLOv9 Nano Quantized",
      "Processing: WebGPU High-Throughput Canvas",
      "Domain: Industrial Quality Assurance",
      "Edition: DPS Indirapuram Summit '26",
    ],
  },
  {
    id: "p06",
    title: "AeroGuard: Autonomous Campus Patrol Drone",
    artist: "Kabir Malhotra & Ananya Gupta (11-E)",
    year: "2026",
    image: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=1200&q=85",
    aspect: 0.8,
    frame: "black",
    mat: true,
    drop: -0.02,
    tag: "Booth P06 • Physical",
    details: [
      "Propulsion: Custom Quad-Rotor Carbon Frame",
      "Telemetry: MAVLink + Real-time Geofencing",
      "Domain: Autonomous Aerial Robotics",
      "Edition: DPS Indirapuram Summit '26",
    ],
  },
  {
    id: "p08",
    title: "Bionic Gripper: Tactile Prosthetic Arm",
    artist: "Devansh Patel (10-A) & Simran Kaur (10-C)",
    year: "2026",
    image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=85",
    aspect: 0.78,
    frame: "oak",
    mat: true,
    drop: 0.08,
    tag: "Booth P08 • Physical",
    details: [
      "Actuation: MG996R Servos + Tendon Cabling",
      "Feedback: Piezoelectric Slip Detection",
      "Domain: Affordable Assistive Tech",
      "Edition: DPS Indirapuram Summit '26",
    ],
  },
  {
    id: "p10",
    title: "HelioTrack: Dual-Axis Solar Optimizer",
    artist: "Tanmay Sen (9-D) & Ishita Roy (9-D)",
    year: "2026",
    image: "https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=1200&q=85",
    aspect: 0.86,
    frame: "white",
    mat: false,
    drop: -0.08,
    tag: "Booth P10 • Physical",
    details: [
      "Orientation: LDR Quadrant Differential",
      "Efficiency: +34% Solar Yield Gain",
      "Domain: Renewable Clean Energy",
      "Edition: DPS Indirapuram Summit '26",
    ],
  },
  {
    id: "p14",
    title: "BioPlast: Algae-Derived Polymer Packaging",
    artist: "Meera Nair (11-C) & Rohan Das (11-B)",
    year: "2026",
    image: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=1200&q=85",
    aspect: 0.8,
    frame: "oak",
    mat: true,
    drop: 0.04,
    tag: "Booth B02 • Business",
    details: [
      "Composition: Agar-Agar + Spirulina Matrix",
      "Degradation: 100% Soil Biodegradable in 28 Days",
      "Domain: Circular Green Enterprise",
      "Edition: DPS Indirapuram Summit '26",
    ],
  },
];
