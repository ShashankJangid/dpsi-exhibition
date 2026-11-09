// Authoritative DPSI Tech & Innovation Exhibition 2026 Registry
// Generated from official roster and verified TSV data

export interface StudentEntry {
  student_name: string;
  class_section: string;
  role: 'EXHIBITOR' | 'INCHARGE' | 'STAFF' | 'JUDGE' | 'VIP' | 'VISITOR';
  pass_code: string;
  project_number: number;
  project_title: string;
  solution_type: string;
  mentor: string;
}

/**
 * Authoritative Student Credential ID Generator
 * Ensures that EVERY individual exhibitor student has a 100% unique, collision-free credential ID,
 * even when multiple students belong to the exact same exhibition project / booth.
 *
 * Format: EXH-{project_number: 4 digits}-{member_index: 2 digits}
 * e.g., Project 36:
 *       Ojas Singh (Member 1)    -> EXH-0036-01
 *       Agrima Jain (Member 2)   -> EXH-0036-02
 *       Shanaya Yadav (Member 3) -> EXH-0036-03
 */
const studentCredentialMap = new Map<string, string>();
const projectMemberCounts = new Map<number, number>();

export function getStudentCredentialId(student: StudentEntry): string {
  if (studentCredentialMap.size === 0) {
    projectMemberCounts.clear();
    OFFICIAL_STUDENTS_ROSTER.forEach((s) => {
      const count = (projectMemberCounts.get(s.project_number) || 0) + 1;
      projectMemberCounts.set(s.project_number, count);
      const credId = `EXH-${String(s.project_number).padStart(4, '0')}-${String(count).padStart(2, '0')}`;
      studentCredentialMap.set(`${s.student_name}__${s.project_number}`, credId);
    });
  }

  const key = `${student.student_name}__${student.project_number}`;
  const cached = studentCredentialMap.get(key);
  if (cached) return cached;
  return `EXH-${String(student.project_number).padStart(4, '0')}-01`;
}

export interface TeacherEntry {
  name: string;
  role: 'INCHARGE' | 'MENTOR';
  pass_code: string;
  department: string;
  assigned_projects: number[];
}

export interface OfficialProjectEntry {
  project_number: number;
  title: string;
  solution_type: string;
  grade: string;
  mentor: string;
  live_link: string;
  students: string[];
  student_count?: number;
}

export const PROPRIETARY_ACCESS_CODES = {
  STUDENT_DEFAULT: '987654',
  TEACHER_INCHARGE: 'TEACHER2026',
  STAFF_OPS: 'STAFF2026',
  JUDGE_PANEL: 'JUDGE2026',
  VIP_DELEGATE: 'VIP2026',
} as const;

export const OFFICIAL_TEACHERS_AND_INCHARGES: TeacherEntry[] = [
  { name: 'Shashank Jangid', role: 'INCHARGE', pass_code: 'TEACHER2026', department: 'Computer Science & AI', assigned_projects: [3, 9, 10, 12, 16, 26, 30, 35, 36] },
  { name: 'Shubham', role: 'INCHARGE', pass_code: 'TEACHER2026', department: 'Robotics & Physical Systems', assigned_projects: [7, 8, 13, 15, 25, 27, 29, 33] },
  { name: 'Divya', role: 'INCHARGE', pass_code: 'TEACHER2026', department: 'Digital Systems & Software', assigned_projects: [11, 13, 14, 17, 18, 19, 25, 31] },
  { name: 'Vaibhav & Ajay', role: 'INCHARGE', pass_code: 'TEACHER2026', department: 'Applied Tech & Electronics', assigned_projects: [2, 4, 6, 20, 23, 24, 28] },
  { name: 'Dana', role: 'MENTOR', pass_code: 'TEACHER2026', department: 'Business & Ventures', assigned_projects: [1] },
  { name: 'Avneet', role: 'MENTOR', pass_code: 'TEACHER2026', department: 'Business & Design', assigned_projects: [5] },
  { name: 'Krishna', role: 'MENTOR', pass_code: 'TEACHER2026', department: 'Eco & Physical Sciences', assigned_projects: [22] },
];

export const OFFICIAL_PROJECTS_CATALOG: OfficialProjectEntry[] = [
  {
    "project_number": 1,
    "title": "GrowGrid",
    "solution_type": "Business Solution",
    "grade": "8",
    "mentor": "Dana",
    "live_link": "",
    "student_count": 2,
    "students": [
      "Yashvardan (VIII)",
      "Hiya (VIII)"
    ]
  },
  {
    "project_number": 2,
    "title": "PPE Kit",
    "solution_type": "Business Solution",
    "grade": "8",
    "mentor": "Vaibhav & Ajay",
    "live_link": "",
    "student_count": 4,
    "students": [
      "Hitesh (VIII-E)",
      "Aayush (VIII-E)",
      "Naysha (VIII-E)",
      "Ayaan (VIII-E)"
    ]
  },
  {
    "project_number": 3,
    "title": "Steel & Stack",
    "solution_type": "Business Solution",
    "grade": "7",
    "mentor": "Shashank",
    "live_link": "https://steelandstack.com/",
    "student_count": 1,
    "students": [
      "Devansh Grover (7)"
    ]
  },
  {
    "project_number": 4,
    "title": "Trading Cards",
    "solution_type": "Business Solution",
    "grade": "7",
    "mentor": "Vaibhav & Ajay",
    "live_link": "",
    "student_count": 1,
    "students": [
      "Kanesh (VII-H)"
    ]
  },
  {
    "project_number": 5,
    "title": "Zap Fit",
    "solution_type": "Business Solution",
    "grade": "7",
    "mentor": "Avneet",
    "live_link": "",
    "student_count": 6,
    "students": [
      "Zaid (VII-A)",
      "Triaansh (VII-A)",
      "Riyansh (VII-A)",
      "Aryaman (VII-A)",
      "Akshita (VII-A)",
      "Anushka (VII-A)"
    ]
  },
  {
    "project_number": 6,
    "title": "Waiting Areas Setup",
    "solution_type": "Business Solution",
    "grade": "6",
    "mentor": "Vaibhav & Ajay",
    "live_link": "",
    "student_count": 5,
    "students": [
      "Nehal Goyal (VI-K)",
      "Amyra Jain (VI-K)",
      "Vidushi Verma (VI-K)",
      "Anvay Jain (VI-K)",
      "Luv Jindal (VI-K)"
    ]
  },
  {
    "project_number": 9,
    "title": "Wish College",
    "solution_type": "Business Solution",
    "grade": "10",
    "mentor": "Shashank",
    "live_link": "https://wishcollege.com/",
    "student_count": 1,
    "students": [
      "Bisman (X)"
    ]
  },
  {
    "project_number": 7,
    "title": "Smart moving bin",
    "solution_type": "Business Solution, Physical Solution",
    "grade": "9, 11",
    "mentor": "Shubham",
    "live_link": "",
    "student_count": 6,
    "students": [
      "Ritisha Varshney (IX-L)",
      "Samaira Gautam Dev (IX-L)",
      "Aadya (IX-L)",
      "Abhiveer (IX-L)",
      "Pragyan (IX-L)",
      "Rian Manchanda (IX-L)"
    ]
  },
  {
    "project_number": 8,
    "title": "Health Thread",
    "solution_type": "Business Solution, Physical Solution",
    "grade": "11",
    "mentor": "Shubham",
    "live_link": "",
    "student_count": 1,
    "students": [
      "Aradhya Tripathi (XI)"
    ]
  },
  {
    "project_number": 10,
    "title": "Caferia System (Munchly)",
    "solution_type": "Digital Solution",
    "grade": "6",
    "mentor": "Shashank",
    "live_link": "",
    "student_count": 5,
    "students": [
      "Ananya Gaur (VI-I)",
      "Anaya Danish (VI-I)",
      "J. Chanakya Anand (VI-I)",
      "Sanvee Jha (VI-I)",
      "Shanaya Sharma (VI-I)"
    ]
  },
  {
    "project_number": 11,
    "title": "Verification System for Local Farmers",
    "solution_type": "Digital Solution",
    "grade": "7",
    "mentor": "Divya",
    "live_link": "",
    "student_count": 6,
    "students": [
      "Drisha Rathi (VII-F)",
      "Parth Pal (VII-F)",
      "Siddhi Saurav (VII-F)",
      "Tavishi Gupta (VII-F)",
      "Vihaan Kapoor (VII-F)",
      "Vivaan Garg (VII-F)"
    ]
  },
  {
    "project_number": 12,
    "title": "Lost & Found in SchoolOS (FindIT)",
    "solution_type": "Digital Solution",
    "grade": "6",
    "mentor": "Shashank",
    "live_link": "https://findit-lost-and-found-two.vercel.app",
    "student_count": 6,
    "students": [
      "Divyansh Mittal (VI-K)",
      "Keshav Sharma (VI-K)",
      "Aaradhya Sahu (VI-K)",
      "Agasthya Taneja (VI-K)",
      "Darsh Gupta (VI-K)",
      "Tejash Kumar Sharma (VI-K)"
    ]
  },
  {
    "project_number": 16,
    "title": "RouteWise",
    "solution_type": "Digital Solution",
    "grade": "9",
    "mentor": "Shashank",
    "live_link": "https://routewise-live.vercel.app/",
    "student_count": 5,
    "students": [
      "Riddhi Pandey (IX-L)",
      "Saanvi Khanna (IX-L)",
      "Darsh Aggarwal (IX-L)",
      "Zarmin Fatema Abbas (IX-L)",
      "Vardaan Khokhar (IX-L)"
    ]
  },
  {
    "project_number": 17,
    "title": "AI Prisoner Therapist",
    "solution_type": "Digital Solution",
    "grade": "11",
    "mentor": "Divya",
    "live_link": "",
    "student_count": 6,
    "students": [
      "Harshil Verma (XI-G)",
      "Abudya Singh (XI-A)",
      "Neel Arora (XI-C)",
      "Amish Chandra (XI-E)",
      "Vidwan Bhatnagar (XI-C)",
      "Abeer Singhal (XI-A)"
    ]
  },
  {
    "project_number": 18,
    "title": "Transportation Hub Crowd Management",
    "solution_type": "Digital Solution",
    "grade": "9",
    "mentor": "Divya",
    "live_link": "",
    "student_count": 5,
    "students": [
      "Aarush Agarwal (IX-I)",
      "Ayyan Rahman (IX-I)",
      "Parv Tomar (IX-I)",
      "Rachita Verma (IX-I)",
      "Yaashvy Nangia (IX-I)"
    ]
  },
  {
    "project_number": 19,
    "title": "Medical Kiosk",
    "solution_type": "Digital Solution",
    "grade": "8, 6",
    "mentor": "Divya",
    "live_link": "",
    "student_count": 4,
    "students": [
      "Aarika (VIII-E)",
      "Vedhika (VIII-E)",
      "Adhiraj (VI-D)",
      "Ishaan (VI-D)"
    ]
  },
  {
    "project_number": 20,
    "title": "DPS Smart Tablet",
    "solution_type": "Digital Solution",
    "grade": "6",
    "mentor": "Vaibhav & Ajay",
    "live_link": "",
    "student_count": 7,
    "students": [
      "Abhishi Jain (VI-D)",
      "Aadya Rana (VI-D)",
      "Saanvi Narula (VI-D)",
      "Aadhya Raj Singh (VI-D)",
      "Khyati (VI-D)",
      "Sarthak (VI-D)",
      "Pratyush (VI-D)"
    ]
  },
  {
    "project_number": 21,
    "title": "HetuSetu",
    "solution_type": "Digital Solution",
    "grade": "",
    "mentor": "",
    "live_link": "",
    "student_count": 0,
    "students": []
  },
  {
    "project_number": 35,
    "title": "Unitree G1 Simulation- Teleoperation & Reinforcement Learning",
    "solution_type": "Digital Solution",
    "grade": "11, 9",
    "mentor": "Shashank",
    "live_link": "",
    "student_count": 2,
    "students": [
      "Ojas Panday (IX-B)",
      "Pranshoo Mittal (XI-B)"
    ]
  },
  {
    "project_number": 13,
    "title": "Move Smarter-CityWatch AI",
    "solution_type": "Digital Solution, Physical Solution",
    "grade": "9",
    "mentor": "Divya & Shubham",
    "live_link": "",
    "student_count": 0,
    "students": []
  },
  {
    "project_number": 15,
    "title": "Move Smarter - ADAS System & Smart traffic",
    "solution_type": "Physical Solution",
    "grade": "9",
    "mentor": "Shubham",
    "live_link": "",
    "student_count": 6,
    "students": [
      "Srishti Jain (XI-F)",
      "Shivangi Negi (XI-F)",
      "Pranshoo Mittal (XI-B)",
      "Samriddhi (IX-D)",
      "Padmakkshie Bansal (IX-D)",
      "Agrima Kaushik (XI-G)"
    ]
  },
  {
    "project_number": 22,
    "title": "Trashcan Composite",
    "solution_type": "Physical Solution",
    "grade": "7",
    "mentor": "Krishna",
    "live_link": "",
    "student_count": 6,
    "students": [
      "Agrima (VII-L)",
      "Vanya (VII-L)",
      "Arnisha (VII-L)",
      "Ira (VII-L)",
      "Raashi (VII-L)",
      "Saanvi (VII-L)"
    ]
  },
  {
    "project_number": 23,
    "title": "Classroom Smart Queue",
    "solution_type": "Physical Solution",
    "grade": "8",
    "mentor": "Vaibhav & Ajay",
    "live_link": "",
    "student_count": 0,
    "students": []
  },
  {
    "project_number": 24,
    "title": "Water Management System",
    "solution_type": "Physical Solution",
    "grade": "6",
    "mentor": "Vaibhav & Ajay",
    "live_link": "",
    "student_count": 6,
    "students": [
      "Aadvik Bhargava (VI-I)",
      "Chitrakshi Sharma (VI-I)",
      "Jaivardhan Joshi (VI-I)",
      "Karnav Arora (VI-I)",
      "Maurya Santosh (VI-I)",
      "Samarth Bhatia (VI-I)"
    ]
  },
  {
    "project_number": 25,
    "title": "Medical Supply Drone",
    "solution_type": "Physical Solution",
    "grade": "9",
    "mentor": "Divya & Shubham",
    "live_link": "",
    "student_count": 6,
    "students": [
      "Ashmit Roy (IX-B)",
      "Vatsal Kumar (IX-B)",
      "Swasti Arora (IX-B)",
      "Prakhar (IX-B)",
      "Aadya (IX-B)",
      "Angel (IX-B)"
    ]
  },
  {
    "project_number": 26,
    "title": "AI Exam Monitor (Vigilens)",
    "solution_type": "Physical Solution",
    "grade": "12",
    "mentor": "Shashank",
    "live_link": "",
    "student_count": 4,
    "students": [
      "Sparsh Goel (XII-E)",
      "Deeya Malhotra (XII-E)",
      "Adarsh Acharya (XII-E)",
      "Priyan Asawa (XII-E)"
    ]
  },
  {
    "project_number": 27,
    "title": "Smart Parcel Box",
    "solution_type": "Physical Solution",
    "grade": "9",
    "mentor": "Shubham",
    "live_link": "",
    "student_count": 6,
    "students": [
      "Ritvij Dwivedi (IX-B)",
      "Pratyoosh Singh (IX-B)",
      "Lavishka Sood (IX-B)",
      "Vidhi Jain (IX-B)",
      "Shashwat Singh (IX-B)",
      "Tarini Makhija (IX-B)"
    ]
  },
  {
    "project_number": 28,
    "title": "Automated Passes",
    "solution_type": "Physical Solution",
    "grade": "",
    "mentor": "Vaibhav & Ajay",
    "live_link": "",
    "student_count": 0,
    "students": []
  },
  {
    "project_number": 29,
    "title": "Neuralink",
    "solution_type": "Physical Solution",
    "grade": "9",
    "mentor": "Shubham & Shashank",
    "live_link": "",
    "student_count": 1,
    "students": [
      "Ojas Panday (IX-B)"
    ]
  },
  {
    "project_number": 31,
    "title": "StepWise",
    "solution_type": "Physical Solution",
    "grade": "",
    "mentor": "Divya",
    "live_link": "",
    "student_count": 2,
    "students": [
      "Pulkit Chandra (IX)",
      "Aryan Jindal (IX)"
    ]
  },
  {
    "project_number": 33,
    "title": "Indoor Clothes Dryer",
    "solution_type": "Physical Solution",
    "grade": "6",
    "mentor": "Shubham",
    "live_link": "",
    "student_count": 1,
    "students": [
      "6I Group 2 (6)"
    ]
  },
  {
    "project_number": 33,
    "title": "Aeroplane",
    "solution_type": "Physical Solution",
    "grade": "",
    "mentor": "Shubham",
    "live_link": "",
    "student_count": 2,
    "students": [
      "Abir (7-D)",
      "Devraj (7-D)"
    ]
  },
  {
    "project_number": 14,
    "title": "Move Smarter-Smart Exit Transit Station for Airport Authority",
    "solution_type": "Physical Solution, Digital Solution",
    "grade": "9",
    "mentor": "Divya",
    "live_link": "",
    "student_count": 0,
    "students": []
  },
  {
    "project_number": 30,
    "title": "Eagle's Eye",
    "solution_type": "Physical Solution, Digital Solution",
    "grade": "6",
    "mentor": "Shashank",
    "live_link": "https://categories-biology-ana-timely.trycloudflare.com/",
    "student_count": 3,
    "students": [
      "Aavya Mishra (VI-B)",
      "Myra Chaudhary (VI-B)",
      "Arshita Shrivastava (VI-B)"
    ]
  },
  {
    "project_number": 32,
    "title": "DPS Learn",
    "solution_type": "",
    "grade": "",
    "mentor": "",
    "live_link": "",
    "student_count": 2,
    "students": [
      "Shreehan (8-H)",
      "Siddharth (8-H)"
    ]
  },
  {
    "project_number": 36,
    "title": "Cloud (GO2)",
    "solution_type": "",
    "grade": "",
    "mentor": "Shashank",
    "live_link": "",
    "student_count": 3,
    "students": [
      "Ojas Singh (IX-A)",
      "Agrima Jain (IX-D)",
      "Shanaya Yadav (IX-E)"
    ]
  }
];

export const OFFICIAL_STUDENTS_ROSTER: StudentEntry[] = [
  {
    "student_name": "Yashvardan",
    "class_section": "VIII",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 1,
    "project_title": "GrowGrid",
    "solution_type": "Business Solution",
    "mentor": "Dana"
  },
  {
    "student_name": "Hiya",
    "class_section": "VIII",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 1,
    "project_title": "GrowGrid",
    "solution_type": "Business Solution",
    "mentor": "Dana"
  },
  {
    "student_name": "Hitesh",
    "class_section": "VIII-E",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 2,
    "project_title": "PPE Kit",
    "solution_type": "Business Solution",
    "mentor": "Vaibhav & Ajay"
  },
  {
    "student_name": "Aayush",
    "class_section": "VIII-E",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 2,
    "project_title": "PPE Kit",
    "solution_type": "Business Solution",
    "mentor": "Vaibhav & Ajay"
  },
  {
    "student_name": "Naysha",
    "class_section": "VIII-E",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 2,
    "project_title": "PPE Kit",
    "solution_type": "Business Solution",
    "mentor": "Vaibhav & Ajay"
  },
  {
    "student_name": "Ayaan",
    "class_section": "VIII-E",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 2,
    "project_title": "PPE Kit",
    "solution_type": "Business Solution",
    "mentor": "Vaibhav & Ajay"
  },
  {
    "student_name": "Devansh Grover",
    "class_section": "7",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 3,
    "project_title": "Steel & Stack",
    "solution_type": "Business Solution",
    "mentor": "Shashank"
  },
  {
    "student_name": "Kanesh",
    "class_section": "VII-H",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 4,
    "project_title": "Trading Cards",
    "solution_type": "Business Solution",
    "mentor": "Vaibhav & Ajay"
  },
  {
    "student_name": "Zaid",
    "class_section": "VII-A",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 5,
    "project_title": "Zap Fit",
    "solution_type": "Business Solution",
    "mentor": "Avneet"
  },
  {
    "student_name": "Triaansh",
    "class_section": "VII-A",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 5,
    "project_title": "Zap Fit",
    "solution_type": "Business Solution",
    "mentor": "Avneet"
  },
  {
    "student_name": "Riyansh",
    "class_section": "VII-A",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 5,
    "project_title": "Zap Fit",
    "solution_type": "Business Solution",
    "mentor": "Avneet"
  },
  {
    "student_name": "Aryaman",
    "class_section": "VII-A",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 5,
    "project_title": "Zap Fit",
    "solution_type": "Business Solution",
    "mentor": "Avneet"
  },
  {
    "student_name": "Akshita",
    "class_section": "VII-A",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 5,
    "project_title": "Zap Fit",
    "solution_type": "Business Solution",
    "mentor": "Avneet"
  },
  {
    "student_name": "Anushka",
    "class_section": "VII-A",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 5,
    "project_title": "Zap Fit",
    "solution_type": "Business Solution",
    "mentor": "Avneet"
  },
  {
    "student_name": "Nehal Goyal",
    "class_section": "VI-K",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 6,
    "project_title": "Waiting Areas Setup",
    "solution_type": "Business Solution",
    "mentor": "Vaibhav & Ajay"
  },
  {
    "student_name": "Amyra Jain",
    "class_section": "VI-K",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 6,
    "project_title": "Waiting Areas Setup",
    "solution_type": "Business Solution",
    "mentor": "Vaibhav & Ajay"
  },
  {
    "student_name": "Vidushi Verma",
    "class_section": "VI-K",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 6,
    "project_title": "Waiting Areas Setup",
    "solution_type": "Business Solution",
    "mentor": "Vaibhav & Ajay"
  },
  {
    "student_name": "Anvay Jain",
    "class_section": "VI-K",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 6,
    "project_title": "Waiting Areas Setup",
    "solution_type": "Business Solution",
    "mentor": "Vaibhav & Ajay"
  },
  {
    "student_name": "Luv Jindal",
    "class_section": "VI-K",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 6,
    "project_title": "Waiting Areas Setup",
    "solution_type": "Business Solution",
    "mentor": "Vaibhav & Ajay"
  },
  {
    "student_name": "Bisman",
    "class_section": "X",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 9,
    "project_title": "Wish College",
    "solution_type": "Business Solution",
    "mentor": "Shashank"
  },
  {
    "student_name": "Ritisha Varshney",
    "class_section": "IX-L",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 7,
    "project_title": "Smart moving bin",
    "solution_type": "Business Solution, Physical Solution",
    "mentor": "Shubham"
  },
  {
    "student_name": "Samaira Gautam Dev",
    "class_section": "IX-L",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 7,
    "project_title": "Smart moving bin",
    "solution_type": "Business Solution, Physical Solution",
    "mentor": "Shubham"
  },
  {
    "student_name": "Aadya",
    "class_section": "IX-L",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 7,
    "project_title": "Smart moving bin",
    "solution_type": "Business Solution, Physical Solution",
    "mentor": "Shubham"
  },
  {
    "student_name": "Abhiveer",
    "class_section": "IX-L",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 7,
    "project_title": "Smart moving bin",
    "solution_type": "Business Solution, Physical Solution",
    "mentor": "Shubham"
  },
  {
    "student_name": "Pragyan",
    "class_section": "IX-L",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 7,
    "project_title": "Smart moving bin",
    "solution_type": "Business Solution, Physical Solution",
    "mentor": "Shubham"
  },
  {
    "student_name": "Rian Manchanda",
    "class_section": "IX-L",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 7,
    "project_title": "Smart moving bin",
    "solution_type": "Business Solution, Physical Solution",
    "mentor": "Shubham"
  },
  {
    "student_name": "Aradhya Tripathi",
    "class_section": "XI",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 8,
    "project_title": "Health Thread",
    "solution_type": "Business Solution, Physical Solution",
    "mentor": "Shubham"
  },
  {
    "student_name": "Ananya Gaur",
    "class_section": "VI-I",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 10,
    "project_title": "Caferia System (Munchly)",
    "solution_type": "Digital Solution",
    "mentor": "Shashank"
  },
  {
    "student_name": "Anaya Danish",
    "class_section": "VI-I",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 10,
    "project_title": "Caferia System (Munchly)",
    "solution_type": "Digital Solution",
    "mentor": "Shashank"
  },
  {
    "student_name": "J. Chanakya Anand",
    "class_section": "VI-I",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 10,
    "project_title": "Caferia System (Munchly)",
    "solution_type": "Digital Solution",
    "mentor": "Shashank"
  },
  {
    "student_name": "Sanvee Jha",
    "class_section": "VI-I",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 10,
    "project_title": "Caferia System (Munchly)",
    "solution_type": "Digital Solution",
    "mentor": "Shashank"
  },
  {
    "student_name": "Shanaya Sharma",
    "class_section": "VI-I",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 10,
    "project_title": "Caferia System (Munchly)",
    "solution_type": "Digital Solution",
    "mentor": "Shashank"
  },
  {
    "student_name": "Drisha Rathi",
    "class_section": "VII-F",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 11,
    "project_title": "Verification System for Local Farmers",
    "solution_type": "Digital Solution",
    "mentor": "Divya"
  },
  {
    "student_name": "Parth Pal",
    "class_section": "VII-F",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 11,
    "project_title": "Verification System for Local Farmers",
    "solution_type": "Digital Solution",
    "mentor": "Divya"
  },
  {
    "student_name": "Siddhi Saurav",
    "class_section": "VII-F",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 11,
    "project_title": "Verification System for Local Farmers",
    "solution_type": "Digital Solution",
    "mentor": "Divya"
  },
  {
    "student_name": "Tavishi Gupta",
    "class_section": "VII-F",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 11,
    "project_title": "Verification System for Local Farmers",
    "solution_type": "Digital Solution",
    "mentor": "Divya"
  },
  {
    "student_name": "Vihaan Kapoor",
    "class_section": "VII-F",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 11,
    "project_title": "Verification System for Local Farmers",
    "solution_type": "Digital Solution",
    "mentor": "Divya"
  },
  {
    "student_name": "Vivaan Garg",
    "class_section": "VII-F",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 11,
    "project_title": "Verification System for Local Farmers",
    "solution_type": "Digital Solution",
    "mentor": "Divya"
  },
  {
    "student_name": "Divyansh Mittal",
    "class_section": "VI-K",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 12,
    "project_title": "Lost & Found in SchoolOS (FindIT)",
    "solution_type": "Digital Solution",
    "mentor": "Shashank"
  },
  {
    "student_name": "Keshav Sharma",
    "class_section": "VI-K",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 12,
    "project_title": "Lost & Found in SchoolOS (FindIT)",
    "solution_type": "Digital Solution",
    "mentor": "Shashank"
  },
  {
    "student_name": "Aaradhya Sahu",
    "class_section": "VI-K",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 12,
    "project_title": "Lost & Found in SchoolOS (FindIT)",
    "solution_type": "Digital Solution",
    "mentor": "Shashank"
  },
  {
    "student_name": "Agasthya Taneja",
    "class_section": "VI-K",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 12,
    "project_title": "Lost & Found in SchoolOS (FindIT)",
    "solution_type": "Digital Solution",
    "mentor": "Shashank"
  },
  {
    "student_name": "Darsh Gupta",
    "class_section": "VI-K",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 12,
    "project_title": "Lost & Found in SchoolOS (FindIT)",
    "solution_type": "Digital Solution",
    "mentor": "Shashank"
  },
  {
    "student_name": "Tejash Kumar Sharma",
    "class_section": "VI-K",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 12,
    "project_title": "Lost & Found in SchoolOS (FindIT)",
    "solution_type": "Digital Solution",
    "mentor": "Shashank"
  },
  {
    "student_name": "Riddhi Pandey",
    "class_section": "IX-L",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 16,
    "project_title": "RouteWise",
    "solution_type": "Digital Solution",
    "mentor": "Shashank"
  },
  {
    "student_name": "Saanvi Khanna",
    "class_section": "IX-L",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 16,
    "project_title": "RouteWise",
    "solution_type": "Digital Solution",
    "mentor": "Shashank"
  },
  {
    "student_name": "Darsh Aggarwal",
    "class_section": "IX-L",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 16,
    "project_title": "RouteWise",
    "solution_type": "Digital Solution",
    "mentor": "Shashank"
  },
  {
    "student_name": "Zarmin Fatema Abbas",
    "class_section": "IX-L",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 16,
    "project_title": "RouteWise",
    "solution_type": "Digital Solution",
    "mentor": "Shashank"
  },
  {
    "student_name": "Vardaan Khokhar",
    "class_section": "IX-L",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 16,
    "project_title": "RouteWise",
    "solution_type": "Digital Solution",
    "mentor": "Shashank"
  },
  {
    "student_name": "Harshil Verma",
    "class_section": "XI-G",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 17,
    "project_title": "AI Prisoner Therapist",
    "solution_type": "Digital Solution",
    "mentor": "Divya"
  },
  {
    "student_name": "Abudya Singh",
    "class_section": "XI-A",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 17,
    "project_title": "AI Prisoner Therapist",
    "solution_type": "Digital Solution",
    "mentor": "Divya"
  },
  {
    "student_name": "Neel Arora",
    "class_section": "XI-C",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 17,
    "project_title": "AI Prisoner Therapist",
    "solution_type": "Digital Solution",
    "mentor": "Divya"
  },
  {
    "student_name": "Amish Chandra",
    "class_section": "XI-E",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 17,
    "project_title": "AI Prisoner Therapist",
    "solution_type": "Digital Solution",
    "mentor": "Divya"
  },
  {
    "student_name": "Vidwan Bhatnagar",
    "class_section": "XI-C",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 17,
    "project_title": "AI Prisoner Therapist",
    "solution_type": "Digital Solution",
    "mentor": "Divya"
  },
  {
    "student_name": "Abeer Singhal",
    "class_section": "XI-A",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 17,
    "project_title": "AI Prisoner Therapist",
    "solution_type": "Digital Solution",
    "mentor": "Divya"
  },
  {
    "student_name": "Aarush Agarwal",
    "class_section": "IX-I",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 18,
    "project_title": "Transportation Hub Crowd Management",
    "solution_type": "Digital Solution",
    "mentor": "Divya"
  },
  {
    "student_name": "Ayyan Rahman",
    "class_section": "IX-I",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 18,
    "project_title": "Transportation Hub Crowd Management",
    "solution_type": "Digital Solution",
    "mentor": "Divya"
  },
  {
    "student_name": "Parv Tomar",
    "class_section": "IX-I",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 18,
    "project_title": "Transportation Hub Crowd Management",
    "solution_type": "Digital Solution",
    "mentor": "Divya"
  },
  {
    "student_name": "Rachita Verma",
    "class_section": "IX-I",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 18,
    "project_title": "Transportation Hub Crowd Management",
    "solution_type": "Digital Solution",
    "mentor": "Divya"
  },
  {
    "student_name": "Yaashvy Nangia",
    "class_section": "IX-I",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 18,
    "project_title": "Transportation Hub Crowd Management",
    "solution_type": "Digital Solution",
    "mentor": "Divya"
  },
  {
    "student_name": "Aarika",
    "class_section": "VIII-E",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 19,
    "project_title": "Medical Kiosk",
    "solution_type": "Digital Solution",
    "mentor": "Divya"
  },
  {
    "student_name": "Vedhika",
    "class_section": "VIII-E",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 19,
    "project_title": "Medical Kiosk",
    "solution_type": "Digital Solution",
    "mentor": "Divya"
  },
  {
    "student_name": "Adhiraj",
    "class_section": "VI-D",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 19,
    "project_title": "Medical Kiosk",
    "solution_type": "Digital Solution",
    "mentor": "Divya"
  },
  {
    "student_name": "Ishaan",
    "class_section": "VI-D",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 19,
    "project_title": "Medical Kiosk",
    "solution_type": "Digital Solution",
    "mentor": "Divya"
  },
  {
    "student_name": "Abhishi Jain",
    "class_section": "VI-D",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 20,
    "project_title": "DPS Smart Tablet",
    "solution_type": "Digital Solution",
    "mentor": "Vaibhav & Ajay"
  },
  {
    "student_name": "Aadya Rana",
    "class_section": "VI-D",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 20,
    "project_title": "DPS Smart Tablet",
    "solution_type": "Digital Solution",
    "mentor": "Vaibhav & Ajay"
  },
  {
    "student_name": "Saanvi Narula",
    "class_section": "VI-D",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 20,
    "project_title": "DPS Smart Tablet",
    "solution_type": "Digital Solution",
    "mentor": "Vaibhav & Ajay"
  },
  {
    "student_name": "Aadhya Raj Singh",
    "class_section": "VI-D",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 20,
    "project_title": "DPS Smart Tablet",
    "solution_type": "Digital Solution",
    "mentor": "Vaibhav & Ajay"
  },
  {
    "student_name": "Khyati",
    "class_section": "VI-D",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 20,
    "project_title": "DPS Smart Tablet",
    "solution_type": "Digital Solution",
    "mentor": "Vaibhav & Ajay"
  },
  {
    "student_name": "Sarthak",
    "class_section": "VI-D",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 20,
    "project_title": "DPS Smart Tablet",
    "solution_type": "Digital Solution",
    "mentor": "Vaibhav & Ajay"
  },
  {
    "student_name": "Pratyush",
    "class_section": "VI-D",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 20,
    "project_title": "DPS Smart Tablet",
    "solution_type": "Digital Solution",
    "mentor": "Vaibhav & Ajay"
  },
  {
    "student_name": "Ojas Panday",
    "class_section": "IX-B",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 35,
    "project_title": "Unitree G1 Simulation- Teleoperation & Reinforcement Learning",
    "solution_type": "Digital Solution",
    "mentor": "Shashank"
  },
  {
    "student_name": "Pranshoo Mittal",
    "class_section": "XI-B",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 35,
    "project_title": "Unitree G1 Simulation- Teleoperation & Reinforcement Learning",
    "solution_type": "Digital Solution",
    "mentor": "Shashank"
  },
  {
    "student_name": "Srishti Jain",
    "class_section": "XI-F",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 15,
    "project_title": "Move Smarter - ADAS System & Smart traffic",
    "solution_type": "Physical Solution",
    "mentor": "Shubham"
  },
  {
    "student_name": "Shivangi Negi",
    "class_section": "XI-F",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 15,
    "project_title": "Move Smarter - ADAS System & Smart traffic",
    "solution_type": "Physical Solution",
    "mentor": "Shubham"
  },
  {
    "student_name": "Pranshoo Mittal",
    "class_section": "XI-B",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 15,
    "project_title": "Move Smarter - ADAS System & Smart traffic",
    "solution_type": "Physical Solution",
    "mentor": "Shubham"
  },
  {
    "student_name": "Samriddhi",
    "class_section": "IX-D",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 15,
    "project_title": "Move Smarter - ADAS System & Smart traffic",
    "solution_type": "Physical Solution",
    "mentor": "Shubham"
  },
  {
    "student_name": "Padmakkshie Bansal",
    "class_section": "IX-D",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 15,
    "project_title": "Move Smarter - ADAS System & Smart traffic",
    "solution_type": "Physical Solution",
    "mentor": "Shubham"
  },
  {
    "student_name": "Agrima Kaushik",
    "class_section": "XI-G",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 15,
    "project_title": "Move Smarter - ADAS System & Smart traffic",
    "solution_type": "Physical Solution",
    "mentor": "Shubham"
  },
  {
    "student_name": "Agrima",
    "class_section": "VII-L",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 22,
    "project_title": "Trashcan Composite",
    "solution_type": "Physical Solution",
    "mentor": "Krishna"
  },
  {
    "student_name": "Vanya",
    "class_section": "VII-L",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 22,
    "project_title": "Trashcan Composite",
    "solution_type": "Physical Solution",
    "mentor": "Krishna"
  },
  {
    "student_name": "Arnisha",
    "class_section": "VII-L",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 22,
    "project_title": "Trashcan Composite",
    "solution_type": "Physical Solution",
    "mentor": "Krishna"
  },
  {
    "student_name": "Ira",
    "class_section": "VII-L",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 22,
    "project_title": "Trashcan Composite",
    "solution_type": "Physical Solution",
    "mentor": "Krishna"
  },
  {
    "student_name": "Raashi",
    "class_section": "VII-L",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 22,
    "project_title": "Trashcan Composite",
    "solution_type": "Physical Solution",
    "mentor": "Krishna"
  },
  {
    "student_name": "Saanvi",
    "class_section": "VII-L",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 22,
    "project_title": "Trashcan Composite",
    "solution_type": "Physical Solution",
    "mentor": "Krishna"
  },
  {
    "student_name": "Aadvik Bhargava",
    "class_section": "VI-I",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 24,
    "project_title": "Water Management System",
    "solution_type": "Physical Solution",
    "mentor": "Vaibhav & Ajay"
  },
  {
    "student_name": "Chitrakshi Sharma",
    "class_section": "VI-I",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 24,
    "project_title": "Water Management System",
    "solution_type": "Physical Solution",
    "mentor": "Vaibhav & Ajay"
  },
  {
    "student_name": "Jaivardhan Joshi",
    "class_section": "VI-I",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 24,
    "project_title": "Water Management System",
    "solution_type": "Physical Solution",
    "mentor": "Vaibhav & Ajay"
  },
  {
    "student_name": "Karnav Arora",
    "class_section": "VI-I",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 24,
    "project_title": "Water Management System",
    "solution_type": "Physical Solution",
    "mentor": "Vaibhav & Ajay"
  },
  {
    "student_name": "Maurya Santosh",
    "class_section": "VI-I",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 24,
    "project_title": "Water Management System",
    "solution_type": "Physical Solution",
    "mentor": "Vaibhav & Ajay"
  },
  {
    "student_name": "Samarth Bhatia",
    "class_section": "VI-I",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 24,
    "project_title": "Water Management System",
    "solution_type": "Physical Solution",
    "mentor": "Vaibhav & Ajay"
  },
  {
    "student_name": "Ashmit Roy",
    "class_section": "IX-B",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 25,
    "project_title": "Medical Supply Drone",
    "solution_type": "Physical Solution",
    "mentor": "Divya & Shubham"
  },
  {
    "student_name": "Vatsal Kumar",
    "class_section": "IX-B",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 25,
    "project_title": "Medical Supply Drone",
    "solution_type": "Physical Solution",
    "mentor": "Divya & Shubham"
  },
  {
    "student_name": "Swasti Arora",
    "class_section": "IX-B",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 25,
    "project_title": "Medical Supply Drone",
    "solution_type": "Physical Solution",
    "mentor": "Divya & Shubham"
  },
  {
    "student_name": "Prakhar",
    "class_section": "IX-B",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 25,
    "project_title": "Medical Supply Drone",
    "solution_type": "Physical Solution",
    "mentor": "Divya & Shubham"
  },
  {
    "student_name": "Aadya",
    "class_section": "IX-B",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 25,
    "project_title": "Medical Supply Drone",
    "solution_type": "Physical Solution",
    "mentor": "Divya & Shubham"
  },
  {
    "student_name": "Angel",
    "class_section": "IX-B",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 25,
    "project_title": "Medical Supply Drone",
    "solution_type": "Physical Solution",
    "mentor": "Divya & Shubham"
  },
  {
    "student_name": "Sparsh Goel",
    "class_section": "XII-E",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 26,
    "project_title": "AI Exam Monitor (Vigilens)",
    "solution_type": "Physical Solution",
    "mentor": "Shashank"
  },
  {
    "student_name": "Deeya Malhotra",
    "class_section": "XII-E",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 26,
    "project_title": "AI Exam Monitor (Vigilens)",
    "solution_type": "Physical Solution",
    "mentor": "Shashank"
  },
  {
    "student_name": "Adarsh Acharya",
    "class_section": "XII-E",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 26,
    "project_title": "AI Exam Monitor (Vigilens)",
    "solution_type": "Physical Solution",
    "mentor": "Shashank"
  },
  {
    "student_name": "Priyan Asawa",
    "class_section": "XII-E",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 26,
    "project_title": "AI Exam Monitor (Vigilens)",
    "solution_type": "Physical Solution",
    "mentor": "Shashank"
  },
  {
    "student_name": "Ritvij Dwivedi",
    "class_section": "IX-B",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 27,
    "project_title": "Smart Parcel Box",
    "solution_type": "Physical Solution",
    "mentor": "Shubham"
  },
  {
    "student_name": "Pratyoosh Singh",
    "class_section": "IX-B",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 27,
    "project_title": "Smart Parcel Box",
    "solution_type": "Physical Solution",
    "mentor": "Shubham"
  },
  {
    "student_name": "Lavishka Sood",
    "class_section": "IX-B",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 27,
    "project_title": "Smart Parcel Box",
    "solution_type": "Physical Solution",
    "mentor": "Shubham"
  },
  {
    "student_name": "Vidhi Jain",
    "class_section": "IX-B",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 27,
    "project_title": "Smart Parcel Box",
    "solution_type": "Physical Solution",
    "mentor": "Shubham"
  },
  {
    "student_name": "Shashwat Singh",
    "class_section": "IX-B",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 27,
    "project_title": "Smart Parcel Box",
    "solution_type": "Physical Solution",
    "mentor": "Shubham"
  },
  {
    "student_name": "Tarini Makhija",
    "class_section": "IX-B",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 27,
    "project_title": "Smart Parcel Box",
    "solution_type": "Physical Solution",
    "mentor": "Shubham"
  },
  {
    "student_name": "Ojas Panday",
    "class_section": "IX-B",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 29,
    "project_title": "Neuralink",
    "solution_type": "Physical Solution",
    "mentor": "Shubham & Shashank"
  },
  {
    "student_name": "Pulkit Chandra",
    "class_section": "IX",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 31,
    "project_title": "StepWise",
    "solution_type": "Physical Solution",
    "mentor": "Divya"
  },
  {
    "student_name": "Aryan Jindal",
    "class_section": "IX",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 31,
    "project_title": "StepWise",
    "solution_type": "Physical Solution",
    "mentor": "Divya"
  },
  {
    "student_name": "6I Group 2",
    "class_section": "6",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 33,
    "project_title": "Indoor Clothes Dryer",
    "solution_type": "Physical Solution",
    "mentor": "Shubham"
  },
  {
    "student_name": "Abir",
    "class_section": "7-D",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 33,
    "project_title": "Aeroplane",
    "solution_type": "Physical Solution",
    "mentor": "Shubham"
  },
  {
    "student_name": "Devraj",
    "class_section": "7-D",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 33,
    "project_title": "Aeroplane",
    "solution_type": "Physical Solution",
    "mentor": "Shubham"
  },
  {
    "student_name": "Aavya Mishra",
    "class_section": "VI-B",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 30,
    "project_title": "Eagle's Eye",
    "solution_type": "Physical Solution, Digital Solution",
    "mentor": "Shashank"
  },
  {
    "student_name": "Myra Chaudhary",
    "class_section": "VI-B",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 30,
    "project_title": "Eagle's Eye",
    "solution_type": "Physical Solution, Digital Solution",
    "mentor": "Shashank"
  },
  {
    "student_name": "Arshita Shrivastava",
    "class_section": "VI-B",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 30,
    "project_title": "Eagle's Eye",
    "solution_type": "Physical Solution, Digital Solution",
    "mentor": "Shashank"
  },
  {
    "student_name": "Shreehan",
    "class_section": "8-H",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 32,
    "project_title": "DPS Learn",
    "solution_type": "",
    "mentor": ""
  },
  {
    "student_name": "Siddharth",
    "class_section": "8-H",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 32,
    "project_title": "DPS Learn",
    "solution_type": "",
    "mentor": ""
  },
  {
    "student_name": "Ojas Singh",
    "class_section": "IX-A",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 36,
    "project_title": "Cloud (GO2)",
    "solution_type": "",
    "mentor": "Shashank"
  },
  {
    "student_name": "Agrima Jain",
    "class_section": "IX-D",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 36,
    "project_title": "Cloud (GO2)",
    "solution_type": "",
    "mentor": "Shashank"
  },
  {
    "student_name": "Shanaya Yadav",
    "class_section": "IX-E",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 36,
    "project_title": "Cloud (GO2)",
    "solution_type": "",
    "mentor": "Shashank"
  }
];
