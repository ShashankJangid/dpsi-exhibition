#!/usr/bin/env python3
"""
DPSI Exhibition Physical Layout Exporter for Robotics Simulators
Exports the blueprint-accurate 3D world to:
1. MuJoCo MJCF (.xml)
2. ROS / RViz URDF (.urdf)
3. Gazebo / Ignition Simulation Description (.sdf)
4. Universal 3D Mesh (.obj + .mtl)
5. Machine-readable Floor Plan JSON (world_layout.json)
"""

import os
import re
import math
import json

def parse_seed_projects(seed_path):
    with open(seed_path, 'r', encoding='utf-8') as f:
        text = f.read()

    pattern = re.compile(
        r'\{\s*id:\s*[\'\"](?P<id>[^\'\"]+)[\'\"].*?'
        r'booth_code:\s*[\'\"](?P<code>[^\'\"]+)[\'\"].*?'
        r'title:\s*[\'\"](?P<title>[^\'\"]+)[\'\"].*?'
        r'zone:\s*[\'\"](?P<zone>[^\'\"]+)[\'\"].*?'
        r'category:\s*[\'\"](?P<category>[^\'\"]+)[\'\"].*?'
        r'position_x:\s*(?P<x>[-\d.]+).*?'
        r'position_y:\s*(?P<y>[-\d.]+).*?'
        r'position_z:\s*(?P<z>[-\d.]+).*?'
        r'rotation_y:\s*(?P<rot>[-\d.]+)',
        re.DOTALL
    )

    projects = []
    for m in pattern.finditer(text):
        d = m.groupdict()
        projects.append({
            'id': d['id'],
            'booth_code': d['code'],
            'title': d['title'],
            'zone': d['zone'],
            'category': d['category'],
            'three_x': float(d['x']),
            'three_y': float(d['y']),
            'three_z': float(d['z']),
            'three_rot_y': float(d['rot']),
            # Robotics Coordinate Mapping (Ground: X-Y, Elevation: Z):
            # x_sim = x_three
            # y_sim = -z_three (North is +Y, South entrance is -Y)
            # z_sim = y_three (ground is z=0)
            # yaw = -rot_y
            'sim_x': round(float(d['x']), 4),
            'sim_y': round(-float(d['z']), 4),
            'sim_z': round(float(d['y']), 4),
            'sim_yaw': round(-float(d['rot']), 4),
        })

    # Deduplicate by id if needed
    seen = set()
    deduped = []
    for p in projects:
        if p['id'] not in seen:
            seen.add(p['id'])
            deduped.append(p)

    return deduped

def build_world_elements(projects):
    """
    Returns structured representations of all physical colliders in the world:
    - Walls (North, South, East, West, Partitions)
    - Entrance portal & columns
    - Balustrades & concourses
    - Zone 3 Robotics Arena (Obstacle Speedway, Ramps, Bridge Deck, Soccer pitch)
    - All Exhibition Stalls & Booths
    """
    elements = {
        'metadata': {
            'name': 'DPSI Tech & Innovation Summit 2026 - Physical World',
            'venue': 'Delhi Public School Indirapuram - Main Exhibition Hall',
            'coordinate_convention': 'Right-Handed REP-103: X=East/Right, Y=North/Forward, Z=Up',
            'dimensions_meters': {
                'length_x': 59.6,
                'width_y': 45.6,
                'height_z': 10.5,
                'bounds_x': [-31.8, 27.8],
                'bounds_y': [-10.8, 34.8],
                'elevation_z': [0.0, 10.5]
            }
        },
        'walls': [
            # 1. North Wall (Back Wall)
            {
                'name': 'north_back_wall',
                'pos': [-2.0, 34.8, 5.25],
                'size': [59.6, 0.4, 10.5], # Full extent dx, dy, dz
                'color': [0.15, 0.20, 0.30, 1.0],
                'material': 'matte_wall'
            },
            # 2. West Wall (Show & Tell Outer Wall)
            {
                'name': 'west_wall',
                'pos': [-31.8, 12.0, 5.25],
                'size': [0.4, 45.6, 10.5],
                'color': [0.15, 0.20, 0.30, 1.0],
                'material': 'matte_wall'
            },
            # 3. East Wall (Wood Acoustic Wall)
            {
                'name': 'east_wall',
                'pos': [27.8, 12.0, 5.25],
                'size': [0.4, 45.6, 10.5],
                'color': [0.45, 0.30, 0.20, 1.0],
                'material': 'wood_wall'
            },
            # 4. South Entrance Wall (Left curb)
            {
                'name': 'south_wall_left',
                'pos': [-24.0, -10.8, 2.5],
                'size': [15.6, 0.4, 5.0],
                'color': [0.2, 0.25, 0.35, 1.0],
                'material': 'portal_frame'
            },
            # 5. South Entrance Wall (Right curb)
            {
                'name': 'south_wall_right',
                'pos': [20.0, -10.8, 2.5],
                'size': [15.6, 0.4, 5.0],
                'color': [0.2, 0.25, 0.35, 1.0],
                'material': 'portal_frame'
            },
            # 6. West Dividing Partition (between Main Hall & Show & Tell)
            # North segment: y in [7.5, 34.8]
            {
                'name': 'west_partition_north',
                'pos': [-7.0, 21.15, 2.5],
                'size': [0.25, 27.3, 5.0],
                'color': [0.3, 0.4, 0.5, 0.6],
                'material': 'glass_partition'
            },
            # South segment: y in [-10.8, -1.5]
            {
                'name': 'west_partition_south',
                'pos': [-7.0, -6.15, 2.5],
                'size': [0.25, 9.3, 5.0],
                'color': [0.3, 0.4, 0.5, 0.6],
                'material': 'glass_partition'
            },
            # Note: Clear 9.0m open grand entrance portal between y = -1.5 and y = 7.5!
            # 7. Concourse Balustrade (separating Zone 2 & Zone 3 Robotics Arena)
            {
                'name': 'robotics_balustrade',
                'pos': [10.4, 18.9, 0.55],
                'size': [32.0, 0.08, 1.1],
                'color': [0.7, 0.8, 0.9, 0.5],
                'material': 'balustrade'
            }
        ],
        'portal_columns': [
            {'name': 'portal_col_south', 'pos': [-7.0, -1.5, 2.5], 'size': [0.3, 0.3, 5.0]},
            {'name': 'portal_col_north', 'pos': [-7.0, 7.5, 2.5], 'size': [0.3, 0.3, 5.0]},
            {'name': 'portal_lintel', 'pos': [-7.0, 3.0, 4.8], 'size': [0.3, 9.0, 0.4]}
        ],
        'robotics_arena': {
            'arena_1_speedway': {
                'center': [-1.0, 25.5, 0.0],
                'track_bounds': {'min_x': -4.5, 'max_x': 4.5, 'min_y': 21.5, 'max_y': 29.5},
                # Safety containment boundary walls around speedway
                'boundary_walls': [
                    {'name': 'speedway_wall_n', 'pos': [-1.0, 29.5, 0.3], 'size': [8.0, 0.15, 0.6]},
                    {'name': 'speedway_wall_s', 'pos': [-1.0, 21.5, 0.3], 'size': [8.0, 0.15, 0.6]},
                    {'name': 'speedway_wall_w', 'pos': [-5.0, 25.5, 0.3], 'size': [0.15, 8.0, 0.6]},
                    {'name': 'speedway_wall_e', 'pos': [3.0, 25.5, 0.3], 'size': [0.15, 8.0, 0.6]},
                ],
                # 3D Ramp Obstacle Course
                'ramp_obstacle': [
                    # Ascending Ramp: x in [-2.5, -0.9], y around 27.5, climbing z: 0.0 -> 0.65
                    {
                        'name': 'ascending_ramp',
                        'pos': [-1.7, 27.5, 0.325],
                        'size': [1.6, 1.2, 0.65],
                        'type': 'ramp_up',
                        'incline_rad': 0.36
                    },
                    # Elevated Bridge Deck: x in [-0.9, 0.9], at elevation z = 0.65 (height above ground)
                    {
                        'name': 'elevated_bridge_deck',
                        'pos': [0.0, 27.5, 0.65],
                        'size': [1.8, 1.2, 0.1],
                        'type': 'bridge'
                    },
                    # Descending Ramp: x in [0.9, 2.5], sloping down from z: 0.65 -> 0.0
                    {
                        'name': 'descending_ramp',
                        'pos': [1.7, 27.5, 0.325],
                        'size': [1.6, 1.2, 0.65],
                        'type': 'ramp_down',
                        'incline_rad': -0.36
                    }
                ]
            },
            'arena_2_soccer': {
                'center': [18.0, 25.5, 0.0],
                'pitch_size': [10.0, 14.0],
                'boundary_walls': [
                    {'name': 'soccer_wall_n', 'pos': [18.0, 32.5, 0.25], 'size': [10.0, 0.12, 0.5]},
                    {'name': 'soccer_wall_s', 'pos': [18.0, 18.5, 0.25], 'size': [10.0, 0.12, 0.5]},
                    {'name': 'soccer_wall_w', 'pos': [13.0, 25.5, 0.25], 'size': [0.12, 14.0, 0.5]},
                    {'name': 'soccer_wall_e', 'pos': [23.0, 25.5, 0.25], 'size': [0.12, 14.0, 0.5]},
                ],
                'goals': [
                    {'name': 'goal_north', 'pos': [18.0, 32.2, 0.3], 'size': [2.4, 0.6, 0.6]},
                    {'name': 'goal_south', 'pos': [18.0, 18.8, 0.3], 'size': [2.4, 0.6, 0.6]}
                ]
            }
        },
        'booths': []
    }

    # Add booths with exact physical collision bounds
    for p in projects:
        # Desk is 2.0m (width) x 0.8m (depth) x 0.72m (height)
        # Dais base is 2.3m x 1.7m x 0.06m
        # Left acrylic glass partition is 0.04m x 1.6m x 1.35m
        # Overall tight collision bounding box around the stall:
        # width=2.4m, depth=1.8m, height=1.5m
        stall = {
            'id': p['id'],
            'booth_code': p['booth_code'],
            'title': p['title'],
            'zone': p['zone'],
            'category': p['category'],
            'pos': [p['sim_x'], p['sim_y'], p['sim_z']],
            'yaw': p['sim_yaw'],
            'desk_surface': {
                'center': [p['sim_x'], p['sim_y'], p['sim_z'] + 0.72],
                'size': [2.0, 0.8, 0.05]
            },
            'collision_box': {
                'center': [p['sim_x'], p['sim_y'], p['sim_z'] + 0.75],
                'size': [2.2, 1.6, 1.5] # dx, dy, dz
            }
        }
        elements['booths'].append(stall)

    return elements

def export_json(elements, out_path):
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(elements, f, indent=2)
    print(f"[✓] Exported JSON layout: {out_path}")

def export_mujoco_mjcf(elements, out_path):
    """
    Generates a full MuJoCo MJCF XML model with:
    - Floor plane & friction
    - Perimeter walls & partitions
    - 35 Exhibition stalls with desk colliders
    - Zone 3 Robotics Arena (Speedway, Ramps, Soccer pitch)
    - Autonomous Mobile Robot (Differential Drive AMR with LiDAR site and camera)
    - Preset cameras (isometric, robot POV, arena overview)
    """
    lines = []
    lines.append('<mujoco model="dpsi_exhibition_world">')
    lines.append('  <compiler angle="radian" coordinate="local" autolimits="true"/>')
    lines.append('  <option gravity="0 0 -9.81" timestep="0.005" integrator="implicitfast"/>')
    lines.append('')
    lines.append('  <visual>')
    lines.append('    <global elevation="-25" azimuth="130"/>')
    lines.append('    <headlight ambient="0.4 0.4 0.4" diffuse="0.8 0.8 0.8" specular="0.2 0.2 0.2"/>')
    lines.append('  </visual>')
    lines.append('')
    lines.append('  <asset>')
    lines.append('    <texture type="skybox" builtin="gradient" rgb1="0.08 0.12 0.22" rgb2="0.02 0.04 0.08" width="512" height="512"/>')
    lines.append('    <texture name="floor_grid" type="2d" builtin="checker" rgb1="0.85 0.88 0.92" rgb2="0.75 0.78 0.83" width="1024" height="1024"/>')
    lines.append('    <material name="floor_mat" texture="floor_grid" texrepeat="30 25" reflectance="0.15" roughness="0.4"/>')
    lines.append('    <material name="wall_mat" rgba="0.25 0.32 0.42 1.0" roughness="0.5"/>')
    lines.append('    <material name="wood_mat" rgba="0.65 0.45 0.28 1.0" roughness="0.4"/>')
    lines.append('    <material name="portal_mat" rgba="0.20 0.25 0.35 1.0" specular="0.8" shininess="0.5"/>')
    lines.append('    <material name="glass_mat" rgba="0.70 0.85 0.95 0.45" roughness="0.1"/>')
    lines.append('    <material name="desk_mat" rgba="0.78 0.60 0.40 1.0" roughness="0.3"/>')
    lines.append('    <material name="plinth_mat" rgba="0.12 0.16 0.24 1.0" roughness="0.5"/>')
    lines.append('    <material name="screen_mat" rgba="0.05 0.08 0.15 1.0" roughness="0.2"/>')
    # Category materials
    lines.append('    <material name="mat_physical" rgba="0.96 0.62 0.07 1.0"/>')
    lines.append('    <material name="mat_digital" rgba="0.02 0.52 0.78 1.0"/>')
    lines.append('    <material name="mat_business" rgba="0.02 0.59 0.41 1.0"/>')
    lines.append('    <material name="mat_showntell" rgba="0.49 0.23 0.93 1.0"/>')
    lines.append('    <material name="mat_robotics" rgba="0.86 0.15 0.15 1.0"/>')
    lines.append('    <material name="track_mat" rgba="0.12 0.14 0.18 1.0" roughness="0.8"/>')
    lines.append('    <material name="turf_mat" rgba="0.10 0.45 0.22 1.0" roughness="0.9"/>')
    lines.append('    <material name="robot_mat" rgba="0.92 0.35 0.05 1.0" specular="0.5" shininess="0.4"/>')
    lines.append('    <material name="wheel_mat" rgba="0.1 0.1 0.1 1.0" roughness="0.8"/>')
    lines.append('  </asset>')
    lines.append('')
    lines.append('  <worldbody>')
    lines.append('    <!-- 1. Ambient & Directional Lights -->')
    lines.append('    <light pos="0 10 25" dir="0 0 -1" diffuse="0.8 0.8 0.8" specular="0.3 0.3 0.3" castshadow="true"/>')
    lines.append('    <light pos="20 25 20" dir="-0.5 -0.5 -1" diffuse="0.5 0.5 0.5"/>')
    lines.append('    <light pos="-20 -5 18" dir="0.5 0.5 -1" diffuse="0.5 0.5 0.5"/>')
    lines.append('')
    lines.append('    <!-- 2. Global Ground Floor (MuJoCo Half-Extents) -->')
    lines.append('    <geom name="ground_floor" type="plane" pos="-2.0 12.0 0.0" size="30.0 23.0 0.1" material="floor_mat" friction="0.8 0.1 0.1" contype="1" conaffinity="1"/>')
    lines.append('')
    lines.append('    <!-- 3. Perimeter Enclosure Walls -->')
    for w in elements['walls']:
        # MuJoCo size is HALF-EXTENT: dx/2, dy/2, dz/2
        hx = w['size'][0] / 2.0
        hy = w['size'][1] / 2.0
        hz = w['size'][2] / 2.0
        mat = 'wall_mat'
        if 'wood' in w['material']: mat = 'wood_mat'
        elif 'portal' in w['material']: mat = 'portal_mat'
        elif 'glass' in w['material'] or 'balustrade' in w['material']: mat = 'glass_mat'
        lines.append(f'    <geom name="{w["name"]}" type="box" pos="{w["pos"][0]} {w["pos"][1]} {w["pos"][2]}" size="{hx:.4f} {hy:.4f} {hz:.4f}" material="{mat}" contype="1" conaffinity="1"/>')

    lines.append('')
    lines.append('    <!-- 4. Portal Framing Columns -->')
    for col in elements['portal_columns']:
        hx, hy, hz = col['size'][0]/2.0, col['size'][1]/2.0, col['size'][2]/2.0
        lines.append(f'    <geom name="{col["name"]}" type="box" pos="{col["pos"][0]} {col["pos"][1]} {col["pos"][2]}" size="{hx:.4f} {hy:.4f} {hz:.4f}" material="portal_mat" contype="1" conaffinity="1"/>')

    lines.append('')
    lines.append('    <!-- 5. Zone 3 Robotics Arena: Speedway & Ramps -->')
    speedway = elements['robotics_arena']['arena_1_speedway']
    # Speedway floor
    lines.append(f'    <geom name="speedway_floor" type="box" pos="{speedway["center"][0]} {speedway["center"][1]} 0.01" size="4.0 4.0 0.02" material="track_mat"/>')
    # Speedway boundary walls
    for bw in speedway['boundary_walls']:
        hx, hy, hz = bw['size'][0]/2.0, bw['size'][1]/2.0, bw['size'][2]/2.0
        lines.append(f'    <geom name="{bw["name"]}" type="box" pos="{bw["pos"][0]} {bw["pos"][1]} {bw["pos"][2]}" size="{hx:.4f} {hy:.4f} {hz:.4f}" material="portal_mat" contype="1" conaffinity="1"/>')

    # Ramps
    for r in speedway['ramp_obstacle']:
        hx, hy, hz = r['size'][0]/2.0, r['size'][1]/2.0, r['size'][2]/2.0
        if r['type'] == 'bridge':
            lines.append(f'    <geom name="{r["name"]}" type="box" pos="{r["pos"][0]} {r["pos"][1]} {r["pos"][2]}" size="{hx:.4f} {hy:.4f} {hz:.4f}" material="track_mat" contype="1" conaffinity="1"/>')
        elif r['type'] == 'ramp_up':
            # Slanted box geom using euler angle pitch
            lines.append(f'    <geom name="{r["name"]}" type="box" pos="{r["pos"][0]} {r["pos"][1]} {r["pos"][2]}" size="{hx:.4f} {hy:.4f} 0.04" euler="0 -0.36 0" material="track_mat" contype="1" conaffinity="1"/>')
        elif r['type'] == 'ramp_down':
            lines.append(f'    <geom name="{r["name"]}" type="box" pos="{r["pos"][0]} {r["pos"][1]} {r["pos"][2]}" size="{hx:.4f} {hy:.4f} 0.04" euler="0 0.36 0" material="track_mat" contype="1" conaffinity="1"/>')

    lines.append('')
    lines.append('    <!-- 6. Zone 3 Robotics Arena: Robo Soccer Pitch -->')
    soccer = elements['robotics_arena']['arena_2_soccer']
    lines.append(f'    <geom name="soccer_turf" type="box" pos="{soccer["center"][0]} {soccer["center"][1]} 0.01" size="5.0 7.0 0.02" material="turf_mat"/>')
    for bw in soccer['boundary_walls']:
        hx, hy, hz = bw['size'][0]/2.0, bw['size'][1]/2.0, bw['size'][2]/2.0
        lines.append(f'    <geom name="{bw["name"]}" type="box" pos="{bw["pos"][0]} {bw["pos"][1]} {bw["pos"][2]}" size="{hx:.4f} {hy:.4f} {hz:.4f}" material="portal_mat" contype="1" conaffinity="1"/>')
    for g in soccer['goals']:
        hx, hy, hz = g['size'][0]/2.0, g['size'][1]/2.0, g['size'][2]/2.0
        lines.append(f'    <geom name="{g["name"]}" type="box" pos="{g["pos"][0]} {g["pos"][1]} {g["pos"][2]}" size="{hx:.4f} {hy:.4f} {hz:.4f}" rgba="0.9 0.9 0.9 0.6" contype="1" conaffinity="1"/>')

    lines.append('')
    lines.append('    <!-- 7. 35 Exhibition Booths with Colliders & Desk Surfaces -->')
    cat_mat_map = {
        'Physical': 'mat_physical',
        'Digital': 'mat_digital',
        'Business': 'mat_business',
        'Show & Tell': 'mat_showntell',
        'Robo Race': 'mat_robotics',
        'Robo Soccer': 'mat_robotics'
    }

    for b in elements['booths']:
        bid = b['booth_code']
        px, py, pz = b['pos']
        yaw = b['yaw']
        mat = cat_mat_map.get(b['category'], 'mat_physical')

        # Create body for each stall with local rotation
        lines.append(f'    <body name="stall_{bid}" pos="{px} {py} {pz}" euler="0 0 {yaw}">')
        # Plinth base
        lines.append(f'      <geom name="plinth_{bid}" type="box" pos="0 0 0.03" size="1.15 0.85 0.03" material="plinth_mat" contype="1" conaffinity="1"/>')
        # Accent perimeter
        lines.append(f'      <geom name="accent_{bid}" type="box" pos="0 0 0.065" size="1.11 0.81 0.008" material="{mat}"/>')
        # Desk surface (y = 0.72m)
        lines.append(f'      <geom name="desk_{bid}" type="box" pos="0 0 0.72" size="1.0 0.4 0.025" material="desk_mat" contype="1" conaffinity="1"/>')
        # Desk legs
        lines.append(f'      <geom name="leg_l_{bid}" type="box" pos="-0.92 0 0.36" size="0.02 0.36 0.34" material="portal_mat" contype="1" conaffinity="1"/>')
        lines.append(f'      <geom name="leg_r_{bid}" type="box" pos="0.92 0 0.36" size="0.02 0.36 0.34" material="portal_mat" contype="1" conaffinity="1"/>')
        # Left acrylic glass partition
        lines.append(f'      <geom name="glass_{bid}" type="box" pos="-1.12 0 0.75" size="0.01 0.77 0.67" material="glass_mat" contype="1" conaffinity="1"/>')
        # Display monitor screen
        lines.append(f'      <geom name="monitor_{bid}" type="box" pos="0 -0.15 1.15" size="0.6 0.03 0.35" material="screen_mat" contype="1" conaffinity="1"/>')
        # Site for interaction / robot navigation waypoint in front of booth
        lines.append(f'      <site name="waypoint_{bid}" pos="0 -1.2 0.2" size="0.1" rgba="0 1 0 0.4"/>')
        lines.append('    </body>')

    lines.append('')
    lines.append('    <!-- 8. Autonomous Mobile Robot (Differential Drive AMR) -->')
    # Spawn at Entrance facing North
    lines.append('    <body name="robot" pos="6.4 -5.0 0.15" euler="0 0 1.5708">')
    lines.append('      <freejoint name="robot_freejoint"/>')
    # Chassis
    lines.append('      <geom name="robot_chassis" type="box" pos="0 0 0.08" size="0.30 0.22 0.08" mass="15.0" material="robot_mat" contype="1" conaffinity="1"/>')
    lines.append('      <geom name="robot_lidar_turret" type="cylinder" pos="0.15 0 0.20" size="0.06 0.04" material="portal_mat"/>')
    # Camera on robot
    lines.append('      <camera name="robot_front_cam" pos="0.28 0 0.18" euler="-1.5708 0 -1.5708"/>')
    # Sensor site for laser rangefinder
    lines.append('      <site name="robot_lidar_site" pos="0.15 0 0.24" size="0.02" rgba="0 0.8 1 1"/>')
    # Left wheel
    lines.append('      <body name="left_wheel" pos="0.0 0.25 0.0">')
    lines.append('        <joint name="left_wheel_joint" type="hinge" axis="0 1 0" damping="0.05"/>')
    lines.append('        <geom name="left_wheel_geom" type="cylinder" size="0.10 0.04" euler="1.5708 0 0" mass="1.5" material="wheel_mat" friction="1.2 0.05 0.05" contype="1" conaffinity="1"/>')
    lines.append('      </body>')
    # Right wheel
    lines.append('      <body name="right_wheel" pos="0.0 -0.25 0.0">')
    lines.append('        <joint name="right_wheel_joint" type="hinge" axis="0 1 0" damping="0.05"/>')
    lines.append('        <geom name="right_wheel_geom" type="cylinder" size="0.10 0.04" euler="1.5708 0 0" mass="1.5" material="wheel_mat" friction="1.2 0.05 0.05" contype="1" conaffinity="1"/>')
    lines.append('      </body>')
    # Passive caster spheres (Front and rear)
    lines.append('      <geom name="caster_front" type="sphere" pos="0.22 0 -0.05" size="0.05" mass="0.5" friction="0.01 0.01 0.01" contype="1" conaffinity="1"/>')
    lines.append('      <geom name="caster_rear" type="sphere" pos="-0.22 0 -0.05" size="0.05" mass="0.5" friction="0.01 0.01 0.01" contype="1" conaffinity="1"/>')
    lines.append('    </body>')
    lines.append('')
    lines.append('    <!-- Preset World Cameras -->')
    lines.append('    <camera name="isometric_overview" pos="18.0 -22.0 28.0" euler="0.75 0 0.65"/>')
    lines.append('    <camera name="show_and_tell_cam" pos="-18.0 -12.0 12.0" euler="0.65 0 0"/>')
    lines.append('    <camera name="robotics_arena_cam" pos="10.0 10.0 15.0" euler="0.70 0 0"/>')
    lines.append('  </worldbody>')
    lines.append('')
    lines.append('  <!-- Actuators for Differential Drive Robot -->')
    lines.append('  <actuator>')
    lines.append('    <velocity name="left_wheel_velocity" joint="left_wheel_joint" kv="50" ctrlrange="-15 15"/>')
    lines.append('    <velocity name="right_wheel_velocity" joint="right_wheel_joint" kv="50" ctrlrange="-15 15"/>')
    lines.append('  </actuator>')
    lines.append('')
    lines.append('  <!-- Sensors -->')
    lines.append('  <sensor>')
    lines.append('    <rangefinder name="front_rangefinder" site="robot_lidar_site"/>')
    lines.append('    <accelerometer name="robot_accel" site="robot_lidar_site"/>')
    lines.append('    <gyro name="robot_gyro" site="robot_lidar_site"/>')
    lines.append('  </sensor>')
    lines.append('')
    lines.append('  <!-- Initial Spawn Keyframe (Spawn AMR at entrance facing North) -->')
    lines.append('  <keyframe>')
    lines.append('    <key name="entrance_spawn" qpos="6.4 -5.0 0.12 0.7071 0 0 0.7071 0 0"/>')
    lines.append('  </keyframe>')
    lines.append('</mujoco>')

    with open(out_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines))
    print(f"[✓] Exported MuJoCo MJCF: {out_path}")

def export_urdf(elements, out_path):
    """
    Generates a full ROS / RViz URDF world description:
    - Base link at origin
    - Visual and Collision geometry for all physical hall structures, stalls, and arenas
    """
    lines = []
    lines.append('<?xml version="1.0"?>')
    lines.append('<robot name="dpsi_exhibition_world">')
    lines.append('  <!-- Materials -->')
    lines.append('  <material name="floor_color"><color rgba="0.82 0.85 0.90 1.0"/></material>')
    lines.append('  <material name="wall_color"><color rgba="0.25 0.32 0.42 1.0"/></material>')
    lines.append('  <material name="wood_color"><color rgba="0.65 0.45 0.28 1.0"/></material>')
    lines.append('  <material name="portal_color"><color rgba="0.20 0.25 0.35 1.0"/></material>')
    lines.append('  <material name="glass_color"><color rgba="0.70 0.85 0.95 0.45"/></material>')
    lines.append('  <material name="desk_color"><color rgba="0.78 0.60 0.40 1.0"/></material>')
    lines.append('  <material name="amber_color"><color rgba="0.96 0.62 0.07 1.0"/></material>')
    lines.append('  <material name="cyan_color"><color rgba="0.02 0.52 0.78 1.0"/></material>')
    lines.append('  <material name="emerald_color"><color rgba="0.02 0.59 0.41 1.0"/></material>')
    lines.append('  <material name="purple_color"><color rgba="0.49 0.23 0.93 1.0"/></material>')
    lines.append('  <material name="red_color"><color rgba="0.86 0.15 0.15 1.0"/></material>')
    lines.append('')
    lines.append('  <link name="world"/>')
    lines.append('')
    lines.append('  <!-- Main Exhibition Structure Link -->')
    lines.append('  <link name="exhibition_hall">')
    # Ground floor
    lines.append('    <!-- Ground Floor -->')
    lines.append('    <visual>')
    lines.append('      <origin xyz="-2.0 12.0 -0.05" rpy="0 0 0"/>')
    lines.append('      <geometry><box size="59.6 45.6 0.1"/></geometry>')
    lines.append('      <material name="floor_color"/>')
    lines.append('    </visual>')
    lines.append('    <collision>')
    lines.append('      <origin xyz="-2.0 12.0 -0.05" rpy="0 0 0"/>')
    lines.append('      <geometry><box size="59.6 45.6 0.1"/></geometry>')
    lines.append('    </collision>')

    # Walls
    for w in elements['walls']:
        mat = 'wall_color'
        if 'wood' in w['material']: mat = 'wood_color'
        elif 'portal' in w['material']: mat = 'portal_color'
        elif 'glass' in w['material'] or 'balustrade' in w['material']: mat = 'glass_color'
        px, py, pz = w['pos']
        sx, sy, sz = w['size']
        lines.append(f'    <!-- Wall: {w["name"]} -->')
        lines.append('    <visual>')
        lines.append(f'      <origin xyz="{px} {py} {pz}" rpy="0 0 0"/>')
        lines.append(f'      <geometry><box size="{sx} {sy} {sz}"/></geometry>')
        lines.append(f'      <material name="{mat}"/>')
        lines.append('    </visual>')
        lines.append('    <collision>')
        lines.append(f'      <origin xyz="{px} {py} {pz}" rpy="0 0 0"/>')
        lines.append(f'      <geometry><box size="{sx} {sy} {sz}"/></geometry>')
        lines.append('    </collision>')

    # Columns
    for col in elements['portal_columns']:
        px, py, pz = col['pos']
        sx, sy, sz = col['size']
        lines.append(f'    <!-- Column: {col["name"]} -->')
        lines.append('    <visual>')
        lines.append(f'      <origin xyz="{px} {py} {pz}" rpy="0 0 0"/>')
        lines.append(f'      <geometry><box size="{sx} {sy} {sz}"/></geometry>')
        lines.append('      <material name="portal_color"/>')
        lines.append('    </visual>')
        lines.append('    <collision>')
        lines.append(f'      <origin xyz="{px} {py} {pz}" rpy="0 0 0"/>')
        lines.append(f'      <geometry><box size="{sx} {sy} {sz}"/></geometry>')
        lines.append('    </collision>')

    # Arena Ramps
    for r in elements['robotics_arena']['arena_1_speedway']['ramp_obstacle']:
        px, py, pz = r['pos']
        sx, sy, sz = r['size']
        pitch = 0.0
        if r['type'] == 'ramp_up': pitch = -0.36
        elif r['type'] == 'ramp_down': pitch = 0.36
        lines.append(f'    <!-- Ramp: {r["name"]} -->')
        lines.append('    <visual>')
        lines.append(f'      <origin xyz="{px} {py} {pz}" rpy="0 {pitch} 0"/>')
        lines.append(f'      <geometry><box size="{sx} {sy} {sz}"/></geometry>')
        lines.append('      <material name="portal_color"/>')
        lines.append('    </visual>')
        lines.append('    <collision>')
        lines.append(f'      <origin xyz="{px} {py} {pz}" rpy="0 {pitch} 0"/>')
        lines.append(f'      <geometry><box size="{sx} {sy} {sz}"/></geometry>')
        lines.append('    </collision>')

    # Arena boundary walls
    for bw in elements['robotics_arena']['arena_1_speedway']['boundary_walls'] + elements['robotics_arena']['arena_2_soccer']['boundary_walls']:
        px, py, pz = bw['pos']
        sx, sy, sz = bw['size']
        lines.append(f'    <!-- Arena Boundary: {bw["name"]} -->')
        lines.append('    <visual>')
        lines.append(f'      <origin xyz="{px} {py} {pz}" rpy="0 0 0"/>')
        lines.append(f'      <geometry><box size="{sx} {sy} {sz}"/></geometry>')
        lines.append('      <material name="portal_color"/>')
        lines.append('    </visual>')
        lines.append('    <collision>')
        lines.append(f'      <origin xyz="{px} {py} {pz}" rpy="0 0 0"/>')
        lines.append(f'      <geometry><box size="{sx} {sy} {sz}"/></geometry>')
        lines.append('    </collision>')

    # Booths
    cat_color_map = {
        'Physical': 'amber_color',
        'Digital': 'cyan_color',
        'Business': 'emerald_color',
        'Show & Tell': 'purple_color',
        'Robo Race': 'red_color',
        'Robo Soccer': 'red_color'
    }

    for b in elements['booths']:
        bid = b['booth_code']
        px, py, pz = b['pos']
        yaw = b['yaw']
        mat = cat_color_map.get(b['category'], 'amber_color')
        # Desk surface
        lines.append(f'    <!-- Booth {bid}: {b["title"]} -->')
        lines.append('    <visual>')
        lines.append(f'      <origin xyz="{px} {py} {pz + 0.72}" rpy="0 0 {yaw}"/>')
        lines.append('      <geometry><box size="2.0 0.8 0.05"/></geometry>')
        lines.append('      <material name="desk_color"/>')
        lines.append('    </visual>')
        # Plinth
        lines.append('    <visual>')
        lines.append(f'      <origin xyz="{px} {py} {pz + 0.03}" rpy="0 0 {yaw}"/>')
        lines.append('      <geometry><box size="2.3 1.7 0.06"/></geometry>')
        lines.append(f'      <material name="{mat}"/>')
        lines.append('    </visual>')
        # Collision bounding box
        lines.append('    <collision>')
        lines.append(f'      <origin xyz="{px} {py} {pz + 0.75}" rpy="0 0 {yaw}"/>')
        lines.append('      <geometry><box size="2.2 1.6 1.5"/></geometry>')
        lines.append('    </collision>')

    lines.append('  </link>')
    lines.append('')
    lines.append('  <joint name="world_to_hall" type="fixed">')
    lines.append('    <parent link="world"/>')
    lines.append('    <child link="exhibition_hall"/>')
    lines.append('    <origin xyz="0 0 0" rpy="0 0 0"/>')
    lines.append('  </joint>')
    lines.append('</robot>')

    with open(out_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines))
    print(f"[✓] Exported ROS URDF: {out_path}")

def export_sdf(elements, out_path):
    """
    Generates Gazebo / Ignition Simulation Description Format (.sdf) world.
    """
    lines = []
    lines.append('<?xml version="1.0" ?>')
    lines.append('<sdf version="1.7">')
    lines.append('  <world name="dpsi_exhibition_world">')
    lines.append('    <physics type="ode">')
    lines.append('      <max_step_size>0.005</max_step_size>')
    lines.append('      <real_time_factor>1.0</real_time_factor>')
    lines.append('    </physics>')
    lines.append('    <!-- Lighting -->')
    lines.append('    <light type="directional" name="sun">')
    lines.append('      <cast_shadows>true</cast_shadows>')
    lines.append('      <pose>0 10 25 0 0 0</pose>')
    lines.append('      <diffuse>0.85 0.85 0.85 1</diffuse>')
    lines.append('      <specular>0.2 0.2 0.2 1</specular>')
    lines.append('      <direction>0 -0.5 -1</direction>')
    lines.append('    </light>')
    lines.append('')
    lines.append('    <!-- Static Exhibition Architecture Model -->')
    lines.append('    <model name="exhibition_hall">')
    lines.append('      <static>true</static>')
    lines.append('      <link name="hall_link">')
    lines.append('        <!-- Ground Floor -->')
    lines.append('        <visual name="floor_vis">')
    lines.append('          <pose>-2.0 12.0 -0.05 0 0 0</pose>')
    lines.append('          <geometry><box><size>59.6 45.6 0.1</size></box></geometry>')
    lines.append('          <material><ambient>0.8 0.82 0.86 1</ambient><diffuse>0.8 0.82 0.86 1</diffuse></material>')
    lines.append('        </visual>')
    lines.append('        <collision name="floor_col">')
    lines.append('          <pose>-2.0 12.0 -0.05 0 0 0</pose>')
    lines.append('          <geometry><box><size>59.6 45.6 0.1</size></box></geometry>')
    lines.append('        </collision>')

    # Walls
    for w in elements['walls']:
        px, py, pz = w['pos']
        sx, sy, sz = w['size']
        wn = w['name']
        lines.append(f'        <!-- Wall: {wn} -->')
        lines.append(f'        <visual name="{wn}_vis">')
        lines.append(f'          <pose>{px} {py} {pz} 0 0 0</pose>')
        lines.append(f'          <geometry><box><size>{sx} {sy} {sz}</size></box></geometry>')
        lines.append('          <material><ambient>0.3 0.35 0.45 1</ambient><diffuse>0.3 0.35 0.45 1</diffuse></material>')
        lines.append('        </visual>')
        lines.append(f'        <collision name="{wn}_col">')
        lines.append(f'          <pose>{px} {py} {pz} 0 0 0</pose>')
        lines.append(f'          <geometry><box><size>{sx} {sy} {sz}</size></box></geometry>')
        lines.append('        </collision>')

    # Ramps
    for r in elements['robotics_arena']['arena_1_speedway']['ramp_obstacle']:
        px, py, pz = r['pos']
        sx, sy, sz = r['size']
        rn = r['name']
        pitch = 0.0
        if r['type'] == 'ramp_up': pitch = -0.36
        elif r['type'] == 'ramp_down': pitch = 0.36
        lines.append(f'        <!-- Ramp: {rn} -->')
        lines.append(f'        <visual name="{rn}_vis">')
        lines.append(f'          <pose>{px} {py} {pz} 0 {pitch} 0</pose>')
        lines.append(f'          <geometry><box><size>{sx} {sy} {sz}</size></box></geometry>')
        lines.append('          <material><ambient>0.2 0.25 0.35 1</ambient><diffuse>0.2 0.25 0.35 1</diffuse></material>')
        lines.append('        </visual>')
        lines.append(f'        <collision name="{rn}_col">')
        lines.append(f'          <pose>{px} {py} {pz} 0 {pitch} 0</pose>')
        lines.append(f'          <geometry><box><size>{sx} {sy} {sz}</size></box></geometry>')
        lines.append('        </collision>')

    # Arena boundaries
    for bw in elements['robotics_arena']['arena_1_speedway']['boundary_walls'] + elements['robotics_arena']['arena_2_soccer']['boundary_walls']:
        px, py, pz = bw['pos']
        sx, sy, sz = bw['size']
        bwn = bw['name']
        lines.append(f'        <visual name="{bwn}_vis">')
        lines.append(f'          <pose>{px} {py} {pz} 0 0 0</pose>')
        lines.append(f'          <geometry><box><size>{sx} {sy} {sz}</size></box></geometry>')
        lines.append('          <material><ambient>0.2 0.25 0.35 1</ambient><diffuse>0.2 0.25 0.35 1</diffuse></material>')
        lines.append('        </visual>')
        lines.append(f'        <collision name="{bwn}_col">')
        lines.append(f'          <pose>{px} {py} {pz} 0 0 0</pose>')
        lines.append(f'          <geometry><box><size>{sx} {sy} {sz}</size></box></geometry>')
        lines.append('        </collision>')

    # Booths
    for b in elements['booths']:
        bid = b['booth_code']
        px, py, pz = b['pos']
        yaw = b['yaw']
        lines.append(f'        <!-- Booth {bid} -->')
        lines.append(f'        <visual name="booth_{bid}_vis">')
        lines.append(f'          <pose>{px} {py} {pz + 0.72} 0 0 {yaw}</pose>')
        lines.append('          <geometry><box><size>2.0 0.8 0.05</size></box></geometry>')
        lines.append('          <material><ambient>0.7 0.55 0.35 1</ambient><diffuse>0.7 0.55 0.35 1</diffuse></material>')
        lines.append('        </visual>')
        lines.append(f'        <collision name="booth_{bid}_col">')
        lines.append(f'          <pose>{px} {py} {pz + 0.75} 0 0 {yaw}</pose>')
        lines.append('          <geometry><box><size>2.2 1.6 1.5</size></box></geometry>')
        lines.append('        </collision>')

    lines.append('      </link>')
    lines.append('    </model>')
    lines.append('  </world>')
    lines.append('</sdf>')

    with open(out_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines))
    print(f"[✓] Exported Gazebo SDF: {out_path}")

def export_obj_mtl(elements, obj_path, mtl_path):
    """
    Generates universal Wavefront OBJ and MTL 3D mesh files for Blender, Isaac Sim, Webots, etc.
    """
    mtl_filename = os.path.basename(mtl_path)
    
    # Write MTL
    mtl_content = """# DPSI Exhibition Material Library
newmtl floor_mat
Kd 0.85 0.88 0.92
Ks 0.2 0.2 0.2
Ns 30

newmtl wall_mat
Kd 0.25 0.32 0.42
Ks 0.1 0.1 0.1
Ns 10

newmtl wood_mat
Kd 0.65 0.45 0.28
Ks 0.15 0.15 0.15
Ns 20

newmtl portal_mat
Kd 0.20 0.25 0.35
Ks 0.8 0.8 0.8
Ns 80

newmtl glass_mat
Kd 0.70 0.85 0.95
d 0.5
Ks 0.9 0.9 0.9
Ns 90

newmtl desk_mat
Kd 0.78 0.60 0.40
Ks 0.2 0.2 0.2
Ns 30

newmtl physical_mat
Kd 0.96 0.62 0.07

newmtl digital_mat
Kd 0.02 0.52 0.78

newmtl business_mat
Kd 0.02 0.59 0.41

newmtl showntell_mat
Kd 0.49 0.23 0.93

newmtl robotics_mat
Kd 0.86 0.15 0.15
"""
    with open(mtl_path, 'w', encoding='utf-8') as f:
        f.write(mtl_content)
    print(f"[✓] Exported MTL: {mtl_path}")

    # Helper to generate box vertices and faces
    vertices = []
    normals = [
        (0, 0, 1),   # Top
        (0, 0, -1),  # Bottom
        (1, 0, 0),   # Right
        (-1, 0, 0),  # Left
        (0, 1, 0),   # Front
        (0, -1, 0)   # Back
    ]
    
    obj_lines = [
        f"mtllib {mtl_filename}",
        "o DPSI_Exhibition_World"
    ]

    def add_box(center, size, yaw, material_name):
        nonlocal vertices
        cx, cy, cz = center
        dx, dy, dz = size
        hx, hy, hz = dx/2.0, dy/2.0, dz/2.0

        # Local corner points
        corners = [
            [-hx, -hy, -hz],
            [ hx, -hy, -hz],
            [ hx,  hy, -hz],
            [-hx,  hy, -hz],
            [-hx, -hy,  hz],
            [ hx, -hy,  hz],
            [ hx,  hy,  hz],
            [-hx,  hy,  hz]
        ]

        cos_y = math.cos(yaw)
        sin_y = math.sin(yaw)

        start_v = len(vertices) + 1

        for c in corners:
            # Rotate around Z by yaw
            rx = c[0] * cos_y - c[1] * sin_y
            ry = c[0] * sin_y + c[1] * cos_y
            rz = c[2]
            vertices.append((cx + rx, cy + ry, cz + rz))

        obj_lines.append(f"usemtl {material_name}")
        # 6 quad faces -> 12 triangles
        # Indices: 1-based offset start_v
        # Bottom: 1, 2, 3, 4
        # Top: 5, 6, 7, 8
        # Front: 4, 3, 7, 8
        # Back: 1, 2, 6, 5
        # Right: 2, 3, 7, 6
        # Left: 1, 4, 8, 5
        faces = [
            (5, 6, 7), (5, 7, 8), # Top
            (1, 4, 3), (1, 3, 2), # Bottom
            (2, 3, 7), (2, 7, 6), # Right
            (1, 8, 4), (1, 5, 8), # Left
            (3, 4, 8), (3, 8, 7), # Front
            (1, 2, 6), (1, 6, 5), # Back
        ]
        for f in faces:
            obj_lines.append(f"f {start_v + f[0] - 1} {start_v + f[1] - 1} {start_v + f[2] - 1}")

    # Add ground floor
    add_box([-2.0, 12.0, -0.05], [59.6, 45.6, 0.1], 0.0, 'floor_mat')

    # Add walls
    for w in elements['walls']:
        mat = 'wall_mat'
        if 'wood' in w['material']: mat = 'wood_mat'
        elif 'portal' in w['material']: mat = 'portal_mat'
        elif 'glass' in w['material'] or 'balustrade' in w['material']: mat = 'glass_mat'
        add_box(w['pos'], w['size'], 0.0, mat)

    # Add columns
    for col in elements['portal_columns']:
        add_box(col['pos'], col['size'], 0.0, 'portal_mat')

    # Add arena ramps & boundaries
    for r in elements['robotics_arena']['arena_1_speedway']['ramp_obstacle']:
        add_box(r['pos'], r['size'], 0.0, 'portal_mat')
    for bw in elements['robotics_arena']['arena_1_speedway']['boundary_walls'] + elements['robotics_arena']['arena_2_soccer']['boundary_walls']:
        add_box(bw['pos'], bw['size'], 0.0, 'portal_mat')

    # Add booths
    cat_mat_map = {
        'Physical': 'physical_mat',
        'Digital': 'digital_mat',
        'Business': 'business_mat',
        'Show & Tell': 'showntell_mat',
        'Robo Race': 'robotics_mat',
        'Robo Soccer': 'robotics_mat'
    }

    for b in elements['booths']:
        px, py, pz = b['pos']
        yaw = b['yaw']
        mat = cat_mat_map.get(b['category'], 'physical_mat')
        # Plinth
        add_box([px, py, pz + 0.03], [2.3, 1.7, 0.06], yaw, mat)
        # Desk
        add_box([px, py, pz + 0.72], [2.0, 0.8, 0.05], yaw, 'desk_mat')

    # Write OBJ vertices and faces
    with open(obj_path, 'w', encoding='utf-8') as f:
        f.write(f"# DPSI Exhibition Wavefront OBJ Export\n")
        f.write(f"mtllib {mtl_filename}\n\n")
        for v in vertices:
            f.write(f"v {v[0]:.4f} {v[1]:.4f} {v[2]:.4f}\n")
        f.write("\n")
        for line in obj_lines:
            if not line.startswith("mtllib"):
                f.write(f"{line}\n")

    print(f"[✓] Exported OBJ mesh: {obj_path}")

def main():
    root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    seed_path = os.path.join(root_dir, 'src', 'data', 'seedProjects.ts')
    out_dir = os.path.join(root_dir, 'robotics_world')
    os.makedirs(out_dir, exist_ok=True)

    print("[*] Parsing exhibition project data from seedProjects.ts...")
    projects = parse_seed_projects(seed_path)
    print(f"[*] Loaded {len(projects)} unique exhibition projects.")

    print("[*] Synthesizing 3D architectural floor plan & boundary colliders...")
    elements = build_world_elements(projects)

    export_json(elements, os.path.join(out_dir, 'world_layout.json'))
    export_mujoco_mjcf(elements, os.path.join(out_dir, 'dpsi_exhibition.xml'))
    export_urdf(elements, os.path.join(out_dir, 'dpsi_exhibition.urdf'))
    export_sdf(elements, os.path.join(out_dir, 'dpsi_exhibition.sdf'))
    export_obj_mtl(elements, os.path.join(out_dir, 'dpsi_exhibition.obj'), os.path.join(out_dir, 'dpsi_exhibition.mtl'))

    print("\n[🎉] All robotics world formats successfully generated in:", out_dir)

if __name__ == '__main__':
    main()
