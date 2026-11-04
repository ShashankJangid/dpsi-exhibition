# DPSI Tech & Innovation Summit 2026 — Robotics World Export
### High-Fidelity Physics World & Spatial Environment for Robot Training, Navigation, & Simulation

This directory contains the physical blueprint layout of the **DPS Indirapuram (DPSI) 2026 Tech & Innovation Summit** exported into industry-standard robotics simulation formats:

1. **MuJoCo MJCF (`dpsi_exhibition.xml`)** — Native physics model for Deep Reinforcement Learning (RL), locomotion, and robot control. Includes a differential-drive Autonomous Mobile Robot (AMR) with LiDAR rangefinder and camera.
2. **ROS / RViz URDF (`dpsi_exhibition.urdf`)** — Unified Robot Description Format for ROS 2 navigation (Nav2), SLAM (Cartographer/SLAM Toolbox), and 3D visualization.
3. **RViz 2 View Configuration (`dpsi_exhibition.rviz`)** — Preset RViz 2 layout with orbit camera, floor grid, and coordinate frames.
4. **Gazebo / Ignition SDF (`dpsi_exhibition.sdf`)** — Simulation Description Format with ODE physics, sun lighting, and collision bounds.
5. **Universal 3D Mesh (`dpsi_exhibition.obj` + `dpsi_exhibition.mtl`)** — Wavefront 3D mesh compatible with Isaac Sim, Webots, PyBullet, Unity, and Blender.
6. **Floor Plan JSON (`world_layout.json`)** — Machine-readable structured database of all zones, rooms, perimeter walls, obstacles, ramp coordinates, and 35 booth colliders.

---

## 🏛️ World Geometry & Spatial Specifications

- **Total Dimensions:** $59.6\,\text{m} \times 45.6\,\text{m} \times 10.5\,\text{m}$ ($X \in [-31.8, 27.8]$, $Y \in [-10.8, 34.8]$)
- **Coordinate System:** Standard Right-Handed Robotics (REP-103):
  - $+X$: East / Right
  - $+Y$: North / Forward (moving into the exhibition from South entrance)
  - $+Z$: Up / Vertical Elevation ($Z = 0.0\,\text{m}$ is ground floor)
- **Enclosure:** Solid exterior walls (North, East, West) with front entrance portal at $Y = -10.8\,\text{m}$.
- **Partitions:** West wing acoustic dividing wall along $X = -7.0\,\text{m}$ with a **9.0m clear open portal** ($Y \in [-1.5, 7.5]$) connecting the Main Concourse to Zone 1.
- **Zone 1 (Show & Tell Pavilion):** Angled pavilion layout with 8 research kiosks (ST01–ST08) along the back wall.
- **Zone 2 (Innovation Hub):** 32 structured stalls in three category aisles:
  - Physical Computing (Amber, $Y = 14.0\,\text{m}$)
  - Digital & AI Solutions (Cyan, $Y = 8.5\,\text{m}$)
  - Sustainable Business Pods (Emerald, $Y = 3.0\,\text{m}$)
- **Zone 3 (Robotics Arena):**
  - **Arena 1 (Autonomous Speedway):** Center $[-1.0, 25.5]$, includes a 3D obstacle ramp:
    - Ascending ramp: $X \in [-2.5, -0.9]$, climb from $Z = 0.0\,\text{m} \to 0.65\,\text{m}$
    - Elevated bridge deck: $X \in [-0.9, 0.9]$ at $Z = 0.65\,\text{m}$
    - Descending ramp: $X \in [0.9, 2.5]$, descent to $Z = 0.0\,\text{m}$
  - **Arena 2 (Robo Soccer Pitch):** Center $[18.0, 25.5]$, $10\,\text{m} \times 14\,\text{m}$ turf pitch with boundary containment walls and North/South goal frames.
- **Booths:** 44 distinct stalls, each featuring:
  - Solid dais base: $2.3\,\text{m} \times 1.7\,\text{m} \times 0.06\,\text{m}$
  - Workstation desk: $2.0\,\text{m} \times 0.8\,\text{m} \times 0.72\,\text{m}$
  - Collision box: $2.2\,\text{m} \times 1.6\,\text{m} \times 1.5\,\text{m}$
  - Interaction waypoint site located $1.2\,\text{m}$ in front of the counter desk.

---

## 🚀 How to Load and Use

### 1. In MuJoCo (Python or Interactive Viewer)

#### A. Run the Verification Script
```bash
python3 robotics_world/test_mujoco.py
```
This script loads the world, initializes the AMR robot at the entrance, commands wheel velocity, steps physics for 500 iterations, and logs LiDAR distance measurements.

#### B. Launch the Interactive 3D MuJoCo GUI Viewer
```bash
python3 -m mujoco.viewer --mjcf=robotics_world/dpsi_exhibition.xml
```
*Controls:*
- **Left click + drag:** Rotate camera orbit
- **Right click + drag:** Pan camera
- **Scroll wheel:** Zoom in/out
- **Space:** Pause/Resume simulation
- **Ctrl + Right click:** Apply external disturbance force to robot or objects

#### C. In Python (Custom Training / RL Loop)
```python
import mujoco

model = mujoco.MjModel.from_xml_path("robotics_world/dpsi_exhibition.xml")
data = mujoco.MjData(model)

# Reset to entrance spawn keyframe
mujoco.mj_resetDataKeyframe(model, data, 0)

# Apply wheel control velocities [rad/s]
data.ctrl[0] = 4.0  # left_wheel
data.ctrl[1] = 4.0  # right_wheel

for step in range(1000):
    mujoco.mj_step(model, data)
    lidar_reading = data.sensordata[0]  # Front rangefinder distance
    robot_pos = data.xpos[model.body("robot").id]
```

---

### 2. In ROS 2 & RViz

#### A. Validate the URDF
```bash
check_urdf robotics_world/dpsi_exhibition.urdf
```

#### B. Publish to RViz 2
```bash
# Terminal 1: Publish robot state description
ros2 run robot_state_publisher robot_state_publisher --ros-args -p robot_description:="$(cat robotics_world/dpsi_exhibition.urdf)"

# Terminal 2: Launch RViz with preset layout
rviz2 -d robotics_world/dpsi_exhibition.rviz
```

---

### 3. In Gazebo / Ignition

```bash
# Launch world in Ignition Gazebo
ign gazebo robotics_world/dpsi_exhibition.sdf

# Or classic Gazebo
gazebo robotics_world/dpsi_exhibition.sdf
```

---

### 4. In NVIDIA Isaac Sim / Webots / PyBullet / Blender

Import `robotics_world/dpsi_exhibition.obj` directly. The accompanying `dpsi_exhibition.mtl` automatically applies PBR colors for all zones (Amber for Physical, Cyan for Digital, Emerald for Business, Purple for Show & Tell, and Crimson for Robotics).

---

### 5. Programmatic Access via JSON

To use the raw geometry directly in a custom Python planner, A* pathfinder, or graph SLAM node:
```python
import json

with open("robotics_world/world_layout.json", "r") as f:
    world = json.load(f)

# Inspect all booth collision boxes
for booth in world["booths"]:
    code = booth["booth_code"]
    pos = booth["pos"]
    size = booth["collision_box"]["size"]
    print(f"Stall {code} at {pos} with extents {size}")

# Access 3D ramp parameters
ramps = world["robotics_arena"]["arena_1_speedway"]["ramp_obstacle"]
print("Elevated bridge deck height:", ramps[1]["pos"][2], "meters")
```
