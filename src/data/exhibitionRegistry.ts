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
  booths?: string[];
  booth_codes?: string;
  venue_location?: string;
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
      studentCredentialMap.set(s.student_name.trim().toUpperCase(), credId);
    });
  }

  const key = `${student.student_name}__${student.project_number}`;
  const cached = studentCredentialMap.get(key) || studentCredentialMap.get(student.student_name.trim().toUpperCase());
  if (cached) return cached;
  return `EXH-${String(student.project_number).padStart(4, '0')}-01`;
}

export const PROJECT_NUMBER_TO_BOOTH: Record<number, { booth_code: string; zone: string; venue_location: string }> = {
  1: { booth_code: 'B02', zone: 'Zone 2 (Innovation Hub)', venue_location: 'Zone 2 • Booth B02' },
  2: { booth_code: 'P02', zone: 'Zone 2 (Innovation Hub)', venue_location: 'Zone 2 • Booth P02' },
  3: { booth_code: 'B05', zone: 'Zone 2 (Innovation Hub)', venue_location: 'Zone 2 • Booth B05' },
  4: { booth_code: 'P11', zone: 'Zone 2 (Innovation Hub)', venue_location: 'Zone 2 • Booth P11' },
  5: { booth_code: 'B04', zone: 'Zone 2 (Innovation Hub)', venue_location: 'Zone 2 • Booth B04' },
  6: { booth_code: 'B01', zone: 'Zone 2 (Innovation Hub)', venue_location: 'Zone 2 • Booth B01' },
  7: { booth_code: 'B07', zone: 'Zone 2 (Innovation Hub)', venue_location: 'Zone 2 • Booth B07' },
  8: { booth_code: 'B03', zone: 'Zone 2 (Innovation Hub)', venue_location: 'Zone 2 • Booth B03' },
  9: { booth_code: 'B06', zone: 'Zone 2 (Innovation Hub)', venue_location: 'Zone 2 • Booth B06' },
  10: { booth_code: 'D08', zone: 'Zone 2 (Innovation Hub)', venue_location: 'Zone 2 • Booth D08' },
  11: { booth_code: 'D01', zone: 'Zone 2 (Innovation Hub)', venue_location: 'Zone 2 • Booth D01' },
  12: { booth_code: 'D09', zone: 'Zone 2 (Innovation Hub)', venue_location: 'Zone 2 • Booth D09' },
  13: { booth_code: 'ST02', zone: 'Zone 1 (Show & Tell)', venue_location: 'Zone 1 • Booth ST02' },
  14: { booth_code: 'D06', zone: 'Zone 2 (Innovation Hub)', venue_location: 'Zone 2 • Booth D06' },
  15: { booth_code: 'B08', zone: 'Zone 2 (Innovation Hub)', venue_location: 'Zone 2 • Booth B08' },
  16: { booth_code: 'D07', zone: 'Zone 2 (Innovation Hub)', venue_location: 'Zone 2 • Booth D07' },
  17: { booth_code: 'D04', zone: 'Zone 2 (Innovation Hub)', venue_location: 'Zone 2 • Booth D04' },
  18: { booth_code: 'D02', zone: 'Zone 2 (Innovation Hub)', venue_location: 'Zone 2 • Booth D02' },
  19: { booth_code: 'D03', zone: 'Zone 2 (Innovation Hub)', venue_location: 'Zone 2 • Booth D03' },
  20: { booth_code: 'P10', zone: 'Zone 2 (Innovation Hub)', venue_location: 'Zone 2 • Booth P10' },
  21: { booth_code: 'D03', zone: 'Zone 2 (Innovation Hub)', venue_location: 'Zone 2 • Booth D03' },
  22: { booth_code: 'P03', zone: 'Zone 2 (Innovation Hub)', venue_location: 'Zone 2 • Booth P03' },
  23: { booth_code: 'P07', zone: 'Zone 2 (Innovation Hub)', venue_location: 'Zone 2 • Booth P07' },
  24: { booth_code: 'P08', zone: 'Zone 2 (Innovation Hub)', venue_location: 'Zone 2 • Booth P08' },
  25: { booth_code: 'P05', zone: 'Zone 2 (Innovation Hub)', venue_location: 'Zone 2 • Booth P05' },
  26: { booth_code: 'D10', zone: 'Zone 2 (Innovation Hub)', venue_location: 'Zone 2 • Booth D10' },
  27: { booth_code: 'P09', zone: 'Zone 2 (Innovation Hub)', venue_location: 'Zone 2 • Booth P09' },
  28: { booth_code: 'P04', zone: 'Zone 2 (Innovation Hub)', venue_location: 'Zone 2 • Booth P04' },
  29: { booth_code: 'P06', zone: 'Zone 2 (Innovation Hub)', venue_location: 'Zone 2 • Booth P06' },
  30: { booth_code: 'D05', zone: 'Zone 2 (Innovation Hub)', venue_location: 'Zone 2 • Booth D05' },
  31: { booth_code: 'P01', zone: 'Zone 2 (Innovation Hub)', venue_location: 'Zone 2 • Booth P01' },
  32: { booth_code: 'D12', zone: 'Zone 2 (Innovation Hub)', venue_location: 'Zone 2 • Booth D12' },
  33: { booth_code: 'P12', zone: 'Zone 2 (Innovation Hub)', venue_location: 'Zone 2 • Booth P12' },
  34: { booth_code: 'ST01', zone: 'Zone 1 (Show & Tell)', venue_location: 'Zone 1 • Booth ST01' },
  35: { booth_code: 'D11', zone: 'Zone 2 (Innovation Hub)', venue_location: 'Zone 2 • Booth D11' },
  36: { booth_code: 'ST03', zone: 'Zone 1 (Show & Tell)', venue_location: 'Zone 1 • Booth ST03' },
  37: { booth_code: 'ST04', zone: 'Zone 1 (Show & Tell)', venue_location: 'Zone 1 • Booth ST04' },
  38: { booth_code: 'ST05', zone: 'Zone 1 (Show & Tell)', venue_location: 'Zone 1 • Booth ST05' },
  39: { booth_code: 'ST06', zone: 'Zone 1 (Show & Tell)', venue_location: 'Zone 1 • Booth ST06' },
  40: { booth_code: 'ST07', zone: 'Zone 1 (Show & Tell)', venue_location: 'Zone 1 • Booth ST07' },
  41: { booth_code: 'ST08', zone: 'Zone 1 (Show & Tell)', venue_location: 'Zone 1 • Booth ST08' },
  42: { booth_code: 'ST09', zone: 'Zone 1 (Show & Tell)', venue_location: 'Zone 1 • Booth ST09' },
  43: { booth_code: 'R01', zone: 'Zone 3 (Robotics Arena)', venue_location: 'Zone 3 • Arena R01' },
  44: { booth_code: 'S01', zone: 'Zone 3 (Robotics Arena)', venue_location: 'Zone 3 • Arena S01' },
};

export function getStudentBoothInfo(
  projectOrStudent: number | StudentEntry
): { booth_code: string; zone: string; venue_location: string } {
  if (typeof projectOrStudent === 'object' && projectOrStudent !== null) {
    if (projectOrStudent.venue_location && projectOrStudent.booth_codes) {
      return {
        booth_code: projectOrStudent.booth_codes,
        zone: projectOrStudent.booths && projectOrStudent.booths.length > 1 ? 'Multi-Zone Innovation' : 'Zone 2 (Innovation Hub)',
        venue_location: projectOrStudent.venue_location,
      };
    }
    const pNum = projectOrStudent.project_number;
    return PROJECT_NUMBER_TO_BOOTH[pNum] || {
      booth_code: `P${String(pNum).padStart(2, '0')}`,
      zone: 'Zone 2 (Innovation Hub)',
      venue_location: `Zone 2 • Booth ${pNum}`,
    };
  }

  return PROJECT_NUMBER_TO_BOOTH[projectOrStudent] || {
    booth_code: `P${String(projectOrStudent).padStart(2, '0')}`,
    zone: 'Zone 2 (Innovation Hub)',
    venue_location: `Zone 2 • Booth ${projectOrStudent}`,
  };
}

export interface TeacherEntry {
  name: string;
  role: 'INCHARGE' | 'MENTOR';
  pass_code: string;
  credential_id: string;
  department?: string;
  assigned_projects?: number[];
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
  { name: 'Shashank Jangid', role: 'INCHARGE', pass_code: 'TEACHER2026', credential_id: 'INC-0001' },
  { name: 'Shubham Solanki', role: 'INCHARGE', pass_code: 'TEACHER2026', credential_id: 'INC-0002' },
  { name: 'Divya Chadha', role: 'INCHARGE', pass_code: 'TEACHER2026', credential_id: 'INC-0003' },
  { name: 'Vaibhav Mishra', role: 'INCHARGE', pass_code: 'TEACHER2026', credential_id: 'INC-0004' },
  { name: 'Ajay', role: 'INCHARGE', pass_code: 'TEACHER2026', credential_id: 'INC-0005' },
  { name: 'Dana Alsani', role: 'INCHARGE', pass_code: 'TEACHER2026', credential_id: 'INC-0006' },
  { name: 'Amit', role: 'INCHARGE', pass_code: 'TEACHER2026', credential_id: 'INC-0007' },
  { name: 'Krishna', role: 'INCHARGE', pass_code: 'TEACHER2026', credential_id: 'INC-0008' },
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
    "title": "Cafeteria System (Munchly)",
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
    "project_number": 34,
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
    "student_count": 2,
    "students": [
      "Ojas Singh (IX-A)",
      "Agrima Jain (IX-D)"
    ]
  }
];

export const OFFICIAL_STUDENTS_ROSTER: StudentEntry[] = [
  {
    "student_name": "Hiya",
    "class_section": "VIII",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 1,
    "project_title": "GrowGrid Hydroponics",
    "solution_type": "Business Solution",
    "mentor": "Dana",
    "booths": [
      "B02"
    ],
    "booth_codes": "B02",
    "venue_location": "Zone 2 • Booth B02"
  },
  {
    "student_name": "Yashvardhan Mishra",
    "class_section": "VIII",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 1,
    "project_title": "GrowGrid Hydroponics",
    "solution_type": "Business Solution",
    "mentor": "Dana",
    "booths": [
      "B02"
    ],
    "booth_codes": "B02",
    "venue_location": "Zone 2 • Booth B02"
  },
  {
    "student_name": "Aayush",
    "class_section": "VIII-E",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 2,
    "project_title": "PPE Safety & Move Smarter",
    "solution_type": "Business Solution",
    "mentor": "Vaibhav & Ajay",
    "booths": [
      "B03",
      "P02"
    ],
    "booth_codes": "B03, P02",
    "venue_location": "Zone 2 • Booths B03 & P02"
  },
  {
    "student_name": "Ayaan",
    "class_section": "VIII-E",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 2,
    "project_title": "PPE Safety & Move Smarter",
    "solution_type": "Business Solution",
    "mentor": "Vaibhav & Ajay",
    "booths": [
      "B03",
      "P02"
    ],
    "booth_codes": "B03, P02",
    "venue_location": "Zone 2 • Booths B03 & P02"
  },
  {
    "student_name": "Hitesh",
    "class_section": "VIII-E",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 2,
    "project_title": "PPE Safety & Move Smarter",
    "solution_type": "Business Solution",
    "mentor": "Vaibhav & Ajay",
    "booths": [
      "B03",
      "P02"
    ],
    "booth_codes": "B03, P02",
    "venue_location": "Zone 2 • Booths B03 & P02"
  },
  {
    "student_name": "Naysha",
    "class_section": "VIII-E",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 2,
    "project_title": "PPE Safety & Move Smarter",
    "solution_type": "Business Solution",
    "mentor": "Vaibhav & Ajay",
    "booths": [
      "B03",
      "P02"
    ],
    "booth_codes": "B03, P02",
    "venue_location": "Zone 2 • Booths B03 & P02"
  },
  {
    "student_name": "Devansh Grover",
    "class_section": "VII-H",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 3,
    "project_title": "Steel & Stack",
    "solution_type": "Business Solution",
    "mentor": "Shashank",
    "booths": [
      "B05"
    ],
    "booth_codes": "B05",
    "venue_location": "Zone 2 • Booth B05"
  },
  {
    "student_name": "Aarna Soni",
    "class_section": "VI-L",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 4,
    "project_title": "Eco Trashcan & NeuroScience BCI",
    "solution_type": "Technical Prototype",
    "mentor": "Faculty Advisor",
    "booths": [
      "P04",
      "P11"
    ],
    "booth_codes": "P04, P11",
    "venue_location": "Zone 2 • Booths P04 & P11"
  },
  {
    "student_name": "Diana Chopra",
    "class_section": "VI-L",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 4,
    "project_title": "Eco Trashcan & NeuroScience BCI",
    "solution_type": "Technical Prototype",
    "mentor": "Faculty Advisor",
    "booths": [
      "P04",
      "P11"
    ],
    "booth_codes": "P04, P11",
    "venue_location": "Zone 2 • Booths P04 & P11"
  },
  {
    "student_name": "Kanesh",
    "class_section": "VII-H",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 4,
    "project_title": "NeuroScience BCI",
    "solution_type": "Business Solution",
    "mentor": "Vaibhav & Ajay",
    "booths": [
      "P11"
    ],
    "booth_codes": "P11",
    "venue_location": "Zone 2 • Booth P11"
  },
  {
    "student_name": "Sanvi Singh",
    "class_section": "7-A",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 4,
    "project_title": "Eco Trashcan & NeuroScience BCI",
    "solution_type": "Technical Prototype",
    "mentor": "Faculty Advisor",
    "booths": [
      "P04",
      "P11"
    ],
    "booth_codes": "P04, P11",
    "venue_location": "Zone 2 • Booths P04 & P11"
  },
  {
    "student_name": "Vihaan Saxena",
    "class_section": "VI-L",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 4,
    "project_title": "Eco Trashcan & NeuroScience BCI",
    "solution_type": "Technical Prototype",
    "mentor": "Faculty Advisor",
    "booths": [
      "P04",
      "P11"
    ],
    "booth_codes": "P04, P11",
    "venue_location": "Zone 2 • Booths P04 & P11"
  },
  {
    "student_name": "Aadya Agrawal",
    "class_section": "IX-B",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 5,
    "project_title": "Tera Mosaic & Medical Drone",
    "solution_type": "Technical Prototype",
    "mentor": "Faculty Advisor",
    "booths": [
      "B04",
      "P05"
    ],
    "booth_codes": "B04, P05",
    "venue_location": "Zone 2 • Booths B04 & P05"
  },
  {
    "student_name": "Akshita Gaur",
    "class_section": "VII-A",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 5,
    "project_title": "Zap Fit & Tera Mosaic",
    "solution_type": "Business Solution",
    "mentor": "Avneet",
    "booths": [
      "B01",
      "B04"
    ],
    "booth_codes": "B01, B04",
    "venue_location": "Zone 2 • Booths B01 & B04"
  },
  {
    "student_name": "Anushka Gulati",
    "class_section": "VII-A",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 5,
    "project_title": "Zap Fit & Tera Mosaic",
    "solution_type": "Business Solution",
    "mentor": "Avneet",
    "booths": [
      "B01",
      "B04"
    ],
    "booth_codes": "B01, B04",
    "venue_location": "Zone 2 • Booths B01 & B04"
  },
  {
    "student_name": "Aryaman Soni",
    "class_section": "VII-A",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 5,
    "project_title": "Zap Fit & Tera Mosaic",
    "solution_type": "Business Solution",
    "mentor": "Avneet",
    "booths": [
      "B01",
      "B04"
    ],
    "booth_codes": "B01, B04",
    "venue_location": "Zone 2 • Booths B01 & B04"
  },
  {
    "student_name": "Mohammad Zaid Khan",
    "class_section": "VII-A",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 5,
    "project_title": "Zap Fit & Tera Mosaic",
    "solution_type": "Business Solution",
    "mentor": "Avneet",
    "booths": [
      "B01",
      "B04"
    ],
    "booth_codes": "B01, B04",
    "venue_location": "Zone 2 • Booths B01 & B04"
  },
  {
    "student_name": "Riyansh",
    "class_section": "VII-A",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 5,
    "project_title": "Zap Fit & Tera Mosaic",
    "solution_type": "Business Solution",
    "mentor": "Avneet",
    "booths": [
      "B01",
      "B04"
    ],
    "booth_codes": "B01, B04",
    "venue_location": "Zone 2 • Booths B01 & B04"
  },
  {
    "student_name": "Triaansh",
    "class_section": "VII-A",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 5,
    "project_title": "Zap Fit & Tera Mosaic",
    "solution_type": "Business Solution",
    "mentor": "Avneet",
    "booths": [
      "B01",
      "B04"
    ],
    "booth_codes": "B01, B04",
    "venue_location": "Zone 2 • Booths B01 & B04"
  },
  {
    "student_name": "Aadya Dhuria",
    "class_section": "IX-L",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 6,
    "project_title": "Zap Fit & Moving Bin",
    "solution_type": "Technical Prototype",
    "mentor": "Faculty Advisor",
    "booths": [
      "B01",
      "P06"
    ],
    "booth_codes": "B01, P06",
    "venue_location": "Zone 2 • Booths B01 & P06"
  },
  {
    "student_name": "Amyra Jain",
    "class_section": "VI-K",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 6,
    "project_title": "Zap Fit & Tera Mosaic",
    "solution_type": "Business Solution",
    "mentor": "Vaibhav & Ajay",
    "booths": [
      "B01",
      "B04"
    ],
    "booth_codes": "B01, B04",
    "venue_location": "Zone 2 • Booths B01 & B04"
  },
  {
    "student_name": "Anvay Jain",
    "class_section": "VI-K",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 6,
    "project_title": "Zap Fit & Tera Mosaic",
    "solution_type": "Business Solution",
    "mentor": "Vaibhav & Ajay",
    "booths": [
      "B01",
      "B04"
    ],
    "booth_codes": "B01, B04",
    "venue_location": "Zone 2 • Booths B01 & B04"
  },
  {
    "student_name": "Luv Jindal",
    "class_section": "VI-K",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 6,
    "project_title": "Zap Fit & Tera Mosaic",
    "solution_type": "Business Solution",
    "mentor": "Vaibhav & Ajay",
    "booths": [
      "B01",
      "B04"
    ],
    "booth_codes": "B01, B04",
    "venue_location": "Zone 2 • Booths B01 & B04"
  },
  {
    "student_name": "Nehal Goyal",
    "class_section": "VI-K",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 6,
    "project_title": "Zap Fit & Tera Mosaic",
    "solution_type": "Business Solution",
    "mentor": "Vaibhav & Ajay",
    "booths": [
      "B01",
      "B04"
    ],
    "booth_codes": "B01, B04",
    "venue_location": "Zone 2 • Booths B01 & B04"
  },
  {
    "student_name": "Vidushi Verma",
    "class_section": "VI-K",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 6,
    "project_title": "Zap Fit & Tera Mosaic",
    "solution_type": "Business Solution",
    "mentor": "Vaibhav & Ajay",
    "booths": [
      "B01",
      "B04"
    ],
    "booth_codes": "B01, B04",
    "venue_location": "Zone 2 • Booths B01 & B04"
  },
  {
    "student_name": "Aadya",
    "class_section": "IX-L",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 7,
    "project_title": "WonderTech STEM Kits",
    "solution_type": "Physical Solution",
    "mentor": "Shubham & Divya",
    "booths": [
      "B07"
    ],
    "booth_codes": "B07",
    "venue_location": "Zone 2 • Booth B07"
  },
  {
    "student_name": "Abhiveer Arora",
    "class_section": "IX-L",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 7,
    "project_title": "WonderTech & Moving Bin",
    "solution_type": "Business Solution, Physical Solution",
    "mentor": "Shubham",
    "booths": [
      "B07",
      "P06"
    ],
    "booth_codes": "B07, P06",
    "venue_location": "Zone 2 • Booths B07 & P06"
  },
  {
    "student_name": "Ammelia R Mitra",
    "class_section": "XI-C",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 7,
    "project_title": "WonderTech & Health Thread",
    "solution_type": "Technical Prototype",
    "mentor": "Faculty Advisor",
    "booths": [
      "B07",
      "P07"
    ],
    "booth_codes": "B07, P07",
    "venue_location": "Zone 2 • Booths B07 & P07"
  },
  {
    "student_name": "Arjun Singh",
    "class_section": "XI-E",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 7,
    "project_title": "WonderTech & Health Thread",
    "solution_type": "Technical Prototype",
    "mentor": "Faculty Advisor",
    "booths": [
      "B07",
      "P07"
    ],
    "booth_codes": "B07, P07",
    "venue_location": "Zone 2 • Booths B07 & P07"
  },
  {
    "student_name": "Pragun Aggarwal",
    "class_section": "XI-E",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 7,
    "project_title": "WonderTech & Health Thread",
    "solution_type": "Technical Prototype",
    "mentor": "Faculty Advisor",
    "booths": [
      "B07",
      "P07"
    ],
    "booth_codes": "B07, P07",
    "venue_location": "Zone 2 • Booths B07 & P07"
  },
  {
    "student_name": "Pragyan Shanker",
    "class_section": "IX-L",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 7,
    "project_title": "WonderTech & Moving Bin",
    "solution_type": "Business Solution, Physical Solution",
    "mentor": "Shubham",
    "booths": [
      "B07",
      "P06"
    ],
    "booth_codes": "B07, P06",
    "venue_location": "Zone 2 • Booths B07 & P06"
  },
  {
    "student_name": "Rian Manchanda",
    "class_section": "IX-L",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 7,
    "project_title": "WonderTech & Moving Bin",
    "solution_type": "Business Solution, Physical Solution",
    "mentor": "Shubham",
    "booths": [
      "B07",
      "P06"
    ],
    "booth_codes": "B07, P06",
    "venue_location": "Zone 2 • Booths B07 & P06"
  },
  {
    "student_name": "Ritisha Varshney",
    "class_section": "IX-L",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 7,
    "project_title": "WonderTech & Moving Bin",
    "solution_type": "Business Solution, Physical Solution",
    "mentor": "Shubham",
    "booths": [
      "B07",
      "P06"
    ],
    "booth_codes": "B07, P06",
    "venue_location": "Zone 2 • Booths B07 & P06"
  },
  {
    "student_name": "Samaira Gautam Dev",
    "class_section": "IX-L",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 7,
    "project_title": "WonderTech & Moving Bin",
    "solution_type": "Business Solution, Physical Solution",
    "mentor": "Shubham",
    "booths": [
      "B07",
      "P06"
    ],
    "booth_codes": "B07, P06",
    "venue_location": "Zone 2 • Booths B07 & P06"
  },
  {
    "student_name": "Akrish",
    "class_section": "VI-E",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 8,
    "project_title": "PPE Safety & Classroom Flow",
    "solution_type": "Technical Prototype",
    "mentor": "Faculty Advisor",
    "booths": [
      "B03",
      "P08"
    ],
    "booth_codes": "B03, P08",
    "venue_location": "Zone 2 • Booths B03 & P08"
  },
  {
    "student_name": "Aradhya Tripathi",
    "class_section": "XI-D",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 8,
    "project_title": "PPE Safety & Health Thread",
    "solution_type": "Business Solution, Physical Solution",
    "mentor": "Shubham",
    "booths": [
      "B03",
      "P07"
    ],
    "booth_codes": "B03, P07",
    "venue_location": "Zone 2 • Booths B03 & P07"
  },
  {
    "student_name": "Arav",
    "class_section": "VI-E",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 8,
    "project_title": "PPE Safety & Classroom Flow",
    "solution_type": "Technical Prototype",
    "mentor": "Faculty Advisor",
    "booths": [
      "B03",
      "P08"
    ],
    "booth_codes": "B03, P08",
    "venue_location": "Zone 2 • Booths B03 & P08"
  },
  {
    "student_name": "Dhruv Jain",
    "class_section": "VI-K",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 8,
    "project_title": "Classroom Flow & SpiderBot",
    "solution_type": "Technical Prototype",
    "mentor": "Faculty Advisor",
    "booths": [
      "B03",
      "P08",
      "ST07"
    ],
    "booth_codes": "B03, P08, ST07",
    "venue_location": "Booths B03 • P08 • ST07"
  },
  {
    "student_name": "Bisman",
    "class_section": "10-A",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 9,
    "project_title": "Trading Cards & Health Thread",
    "solution_type": "Business Solution",
    "mentor": "Shashank",
    "booths": [
      "B06",
      "P07"
    ],
    "booth_codes": "B06, P07",
    "venue_location": "Zone 2 • Booths B06 & P07"
  },
  {
    "student_name": "Ananya Gaur",
    "class_section": "VI-I",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 10,
    "project_title": "SchoolsOS Cafeteria",
    "solution_type": "Digital Solution",
    "mentor": "Shashank",
    "booths": [
      "D08"
    ],
    "booth_codes": "D08",
    "venue_location": "Zone 2 • Booth D08"
  },
  {
    "student_name": "Anaya Danish",
    "class_section": "VI-I",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 10,
    "project_title": "SchoolsOS Cafeteria",
    "solution_type": "Digital Solution",
    "mentor": "Shashank",
    "booths": [
      "D08"
    ],
    "booth_codes": "D08",
    "venue_location": "Zone 2 • Booth D08"
  },
  {
    "student_name": "Avyaan",
    "class_section": "7-B",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 10,
    "project_title": "Cafeteria OS & Digital Passes",
    "solution_type": "Technical Prototype",
    "mentor": "Faculty Advisor",
    "booths": [
      "D08",
      "P10"
    ],
    "booth_codes": "D08, P10",
    "venue_location": "Zone 2 • Booths D08 & P10"
  },
  {
    "student_name": "Eeshan",
    "class_section": "VIII-G",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 10,
    "project_title": "Cafeteria OS & Digital Passes",
    "solution_type": "Technical Prototype",
    "mentor": "Faculty Advisor",
    "booths": [
      "D08",
      "P10"
    ],
    "booth_codes": "D08, P10",
    "venue_location": "Zone 2 • Booths D08 & P10"
  },
  {
    "student_name": "J. Chanakya Anand",
    "class_section": "VI-I",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 10,
    "project_title": "SchoolsOS Cafeteria",
    "solution_type": "Digital Solution",
    "mentor": "Shashank",
    "booths": [
      "D08"
    ],
    "booth_codes": "D08",
    "venue_location": "Zone 2 • Booth D08"
  },
  {
    "student_name": "Kumar Satvik",
    "class_section": "7-A",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 10,
    "project_title": "Cafeteria OS & Digital Passes",
    "solution_type": "Technical Prototype",
    "mentor": "Faculty Advisor",
    "booths": [
      "D08",
      "P10"
    ],
    "booth_codes": "D08, P10",
    "venue_location": "Zone 2 • Booths D08 & P10"
  },
  {
    "student_name": "Sanvee Jha",
    "class_section": "VI-I",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 10,
    "project_title": "SchoolsOS Cafeteria",
    "solution_type": "Digital Solution",
    "mentor": "Shashank",
    "booths": [
      "D08"
    ],
    "booth_codes": "D08",
    "venue_location": "Zone 2 • Booth D08"
  },
  {
    "student_name": "Shanaya Sharma",
    "class_section": "VI-I",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 10,
    "project_title": "SchoolsOS Cafeteria",
    "solution_type": "Digital Solution",
    "mentor": "Shashank",
    "booths": [
      "D08"
    ],
    "booth_codes": "D08",
    "venue_location": "Zone 2 • Booth D08"
  },
  {
    "student_name": "Ted",
    "class_section": "XI-H",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 10,
    "project_title": "Cafeteria OS & Digital Passes",
    "solution_type": "Technical Prototype",
    "mentor": "Faculty Advisor",
    "booths": [
      "D08",
      "P10"
    ],
    "booth_codes": "D08, P10",
    "venue_location": "Zone 2 • Booths D08 & P10"
  },
  {
    "student_name": "Drisha Rathi",
    "class_section": "VII-F",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 11,
    "project_title": "SchoolsOS Attendance",
    "solution_type": "Digital Solution",
    "mentor": "Divya",
    "booths": [
      "D01"
    ],
    "booth_codes": "D01",
    "venue_location": "Zone 2 • Booth D01"
  },
  {
    "student_name": "Parth Pal",
    "class_section": "VII-F",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 11,
    "project_title": "SchoolsOS Attendance",
    "solution_type": "Digital Solution",
    "mentor": "Divya",
    "booths": [
      "D01"
    ],
    "booth_codes": "D01",
    "venue_location": "Zone 2 • Booth D01"
  },
  {
    "student_name": "Siddhi Saurav",
    "class_section": "VII-F",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 11,
    "project_title": "SchoolsOS Attendance",
    "solution_type": "Digital Solution",
    "mentor": "Divya",
    "booths": [
      "D01"
    ],
    "booth_codes": "D01",
    "venue_location": "Zone 2 • Booth D01"
  },
  {
    "student_name": "Tavishi Gupta",
    "class_section": "VII-F",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 11,
    "project_title": "SchoolsOS Attendance",
    "solution_type": "Digital Solution",
    "mentor": "Divya",
    "booths": [
      "D01"
    ],
    "booth_codes": "D01",
    "venue_location": "Zone 2 • Booth D01"
  },
  {
    "student_name": "Vihaan Kapoor",
    "class_section": "VII-F",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 11,
    "project_title": "SchoolsOS Attendance",
    "solution_type": "Digital Solution",
    "mentor": "Divya",
    "booths": [
      "D01"
    ],
    "booth_codes": "D01",
    "venue_location": "Zone 2 • Booth D01"
  },
  {
    "student_name": "Vivaan Garg",
    "class_section": "VII-F",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 11,
    "project_title": "SchoolsOS Attendance",
    "solution_type": "Digital Solution",
    "mentor": "Divya",
    "booths": [
      "D01"
    ],
    "booth_codes": "D01",
    "venue_location": "Zone 2 • Booth D01"
  },
  {
    "student_name": "Yug Bhargava",
    "class_section": "IX-J",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 11,
    "project_title": "SchoolsOS & NeuroScience BCI",
    "solution_type": "Technical Prototype",
    "mentor": "Faculty Advisor",
    "booths": [
      "D01",
      "P11"
    ],
    "booth_codes": "D01, P11",
    "venue_location": "Zone 2 • Booths D01 & P11"
  },
  {
    "student_name": "Aaradhya Sahu",
    "class_section": "VI-K",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 12,
    "project_title": "SchoolsOS Lost & Found",
    "solution_type": "Digital Solution",
    "mentor": "Shashank",
    "booths": [
      "D09"
    ],
    "booth_codes": "D09",
    "venue_location": "Zone 2 • Booth D09"
  },
  {
    "student_name": "Aarav",
    "class_section": "VI-I",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 12,
    "project_title": "Lost & Found OS & Dehumidifier",
    "solution_type": "Technical Prototype",
    "mentor": "Faculty Advisor",
    "booths": [
      "D09",
      "P12"
    ],
    "booth_codes": "D09, P12",
    "venue_location": "Zone 2 • Booths D09 & P12"
  },
  {
    "student_name": "Adrit",
    "class_section": "VI-I",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 12,
    "project_title": "Lost & Found OS & Dehumidifier",
    "solution_type": "Technical Prototype",
    "mentor": "Faculty Advisor",
    "booths": [
      "D09",
      "P12"
    ],
    "booth_codes": "D09, P12",
    "venue_location": "Zone 2 • Booths D09 & P12"
  },
  {
    "student_name": "Agasthya Taneja",
    "class_section": "VI-K",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 12,
    "project_title": "SchoolsOS Lost & Found",
    "solution_type": "Digital Solution",
    "mentor": "Shashank",
    "booths": [
      "D09"
    ],
    "booth_codes": "D09",
    "venue_location": "Zone 2 • Booth D09"
  },
  {
    "student_name": "Arhan",
    "class_section": "VI-I",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 12,
    "project_title": "Lost & Found OS & Dehumidifier",
    "solution_type": "Technical Prototype",
    "mentor": "Faculty Advisor",
    "booths": [
      "D09",
      "P12"
    ],
    "booth_codes": "D09, P12",
    "venue_location": "Zone 2 • Booths D09 & P12"
  },
  {
    "student_name": "Darsh Gupta",
    "class_section": "VI-K",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 12,
    "project_title": "SchoolsOS Lost & Found",
    "solution_type": "Digital Solution",
    "mentor": "Shashank",
    "booths": [
      "D09"
    ],
    "booth_codes": "D09",
    "venue_location": "Zone 2 • Booth D09"
  },
  {
    "student_name": "Divyansh Mittal",
    "class_section": "VI-K",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 12,
    "project_title": "SchoolsOS Lost & Found",
    "solution_type": "Digital Solution",
    "mentor": "Shashank",
    "booths": [
      "D09"
    ],
    "booth_codes": "D09",
    "venue_location": "Zone 2 • Booth D09"
  },
  {
    "student_name": "Keshav Sharma",
    "class_section": "VI-K",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 12,
    "project_title": "SchoolsOS Lost & Found",
    "solution_type": "Digital Solution",
    "mentor": "Shashank",
    "booths": [
      "D09"
    ],
    "booth_codes": "D09",
    "venue_location": "Zone 2 • Booth D09"
  },
  {
    "student_name": "Tejash Kumar Sharma",
    "class_section": "VI-K",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 12,
    "project_title": "SchoolsOS Lost & Found",
    "solution_type": "Digital Solution",
    "mentor": "Shashank",
    "booths": [
      "D09"
    ],
    "booth_codes": "D09",
    "venue_location": "Zone 2 • Booth D09"
  },
  {
    "student_name": "Ojas Pandey",
    "class_section": "IX-B",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 13,
    "project_title": "NeuroScience BCI & Robotics",
    "solution_type": "Physical Solution",
    "mentor": "Shashank & Shubham",
    "booths": [
      "P11",
      "ST02",
      "ST04"
    ],
    "booth_codes": "P11, ST02, ST04",
    "venue_location": "Booths P11 • ST02 • ST04"
  },
  {
    "student_name": "Akshara Barath",
    "class_section": "XI-B",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 14,
    "project_title": "Hetu Setu & Transit Station",
    "solution_type": "Technical Prototype",
    "mentor": "Faculty Advisor",
    "booths": [
      "D02",
      "D06"
    ],
    "booth_codes": "D02, D06",
    "venue_location": "Zone 2 • Booths D02 & D06"
  },
  {
    "student_name": "Hiya Garg",
    "class_section": "XI-A",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 14,
    "project_title": "Hetu Setu & Transit Station",
    "solution_type": "Technical Prototype",
    "mentor": "Faculty Advisor",
    "booths": [
      "D02",
      "D06"
    ],
    "booth_codes": "D02, D06",
    "venue_location": "Zone 2 • Booths D02 & D06"
  },
  {
    "student_name": "Mishka Singla",
    "class_section": "XI-B",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 14,
    "project_title": "Hetu Setu & Transit Station",
    "solution_type": "Technical Prototype",
    "mentor": "Faculty Advisor",
    "booths": [
      "D02",
      "D06"
    ],
    "booth_codes": "D02, D06",
    "venue_location": "Zone 2 • Booths D02 & D06"
  },
  {
    "student_name": "Sarisha Sachdeva",
    "class_section": "XI-A",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 14,
    "project_title": "Hetu Setu & Transit Station",
    "solution_type": "Technical Prototype",
    "mentor": "Faculty Advisor",
    "booths": [
      "D02",
      "D06"
    ],
    "booth_codes": "D02, D06",
    "venue_location": "Zone 2 • Booths D02 & D06"
  },
  {
    "student_name": "Agrima Kaushik",
    "class_section": "XI-G",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 15,
    "project_title": "BioHarvest Automated Farm",
    "solution_type": "Physical Solution",
    "mentor": "Shubham",
    "booths": [
      "B08"
    ],
    "booth_codes": "B08",
    "venue_location": "Zone 2 • Booth B08"
  },
  {
    "student_name": "Padmakkshie Bansal",
    "class_section": "IX-D",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 15,
    "project_title": "BioHarvest Automated Farm",
    "solution_type": "Physical Solution",
    "mentor": "Shubham",
    "booths": [
      "B08"
    ],
    "booth_codes": "B08",
    "venue_location": "Zone 2 • Booth B08"
  },
  {
    "student_name": "Samriddhi",
    "class_section": "IX-D",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 15,
    "project_title": "BioHarvest Automated Farm",
    "solution_type": "Physical Solution",
    "mentor": "Shubham",
    "booths": [
      "B08"
    ],
    "booth_codes": "B08",
    "venue_location": "Zone 2 • Booth B08"
  },
  {
    "student_name": "Shivangi Negi",
    "class_section": "XI-F",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 15,
    "project_title": "BioHarvest & Move Smarter",
    "solution_type": "Physical Solution",
    "mentor": "Shubham",
    "booths": [
      "B08",
      "P02"
    ],
    "booth_codes": "B08, P02",
    "venue_location": "Zone 2 • Booths B08 & P02"
  },
  {
    "student_name": "Srishti Jain",
    "class_section": "XI-F",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 15,
    "project_title": "BioHarvest & Move Smarter",
    "solution_type": "Physical Solution",
    "mentor": "Shubham",
    "booths": [
      "B08",
      "P02"
    ],
    "booth_codes": "B08, P02",
    "venue_location": "Zone 2 • Booths B08 & P02"
  },
  {
    "student_name": "Darsh Aggarwal",
    "class_section": "IX-L",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 16,
    "project_title": "Medical Kiosk Diagnostics",
    "solution_type": "Digital Solution",
    "mentor": "Shashank",
    "booths": [
      "D07"
    ],
    "booth_codes": "D07",
    "venue_location": "Zone 2 • Booth D07"
  },
  {
    "student_name": "Riddhi Pandey",
    "class_section": "IX-L",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 16,
    "project_title": "Medical Kiosk Diagnostics",
    "solution_type": "Digital Solution",
    "mentor": "Shashank",
    "booths": [
      "D07"
    ],
    "booth_codes": "D07",
    "venue_location": "Zone 2 • Booth D07"
  },
  {
    "student_name": "Saanvi Khanna",
    "class_section": "IX-L",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 16,
    "project_title": "Medical Kiosk & RouteWise",
    "solution_type": "Digital Solution",
    "mentor": "Shashank",
    "booths": [
      "D07",
      "D10"
    ],
    "booth_codes": "D07, D10",
    "venue_location": "Zone 2 • Booths D07 & D10"
  },
  {
    "student_name": "Tanishka Tomer",
    "class_section": "IX-I",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 16,
    "project_title": "Transit Crowd & Medical Kiosk",
    "solution_type": "Technical Prototype",
    "mentor": "Faculty Advisor",
    "booths": [
      "D04",
      "D07"
    ],
    "booth_codes": "D04, D07",
    "venue_location": "Zone 2 • Booths D04 & D07"
  },
  {
    "student_name": "Vardaan Khokhar",
    "class_section": "IX-L",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 16,
    "project_title": "Medical Kiosk & RouteWise",
    "solution_type": "Digital Solution",
    "mentor": "Shashank",
    "booths": [
      "D07",
      "D10"
    ],
    "booth_codes": "D07, D10",
    "venue_location": "Zone 2 • Booths D07 & D10"
  },
  {
    "student_name": "Zarmin Fatema Abbas",
    "class_section": "IX-L",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 16,
    "project_title": "Medical Kiosk & RouteWise",
    "solution_type": "Digital Solution",
    "mentor": "Shashank",
    "booths": [
      "D07",
      "D10"
    ],
    "booth_codes": "D07, D10",
    "venue_location": "Zone 2 • Booths D07 & D10"
  },
  {
    "student_name": "Aadya Mehra",
    "class_section": "IX-L",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 17,
    "project_title": "Transit Crowd & CityWatch AI",
    "solution_type": "Technical Prototype",
    "mentor": "Faculty Advisor",
    "booths": [
      "D04",
      "D05"
    ],
    "booth_codes": "D04, D05",
    "venue_location": "Zone 2 • Booths D04 & D05"
  },
  {
    "student_name": "Abeer Singhal",
    "class_section": "XI-A",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 17,
    "project_title": "Rehab 360 & Transit Crowd",
    "solution_type": "Digital Solution",
    "mentor": "Divya",
    "booths": [
      "D03",
      "D04"
    ],
    "booth_codes": "D03, D04",
    "venue_location": "Zone 2 • Booths D03 & D04"
  },
  {
    "student_name": "Abhyudaya Singh",
    "class_section": "XI-A",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 17,
    "project_title": "Rehab 360 & Transit Crowd",
    "solution_type": "Digital Solution",
    "mentor": "Divya",
    "booths": [
      "D03",
      "D04"
    ],
    "booth_codes": "D03, D04",
    "venue_location": "Zone 2 • Booths D03 & D04"
  },
  {
    "student_name": "Amish Chandra",
    "class_section": "XI-E",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 17,
    "project_title": "Rehab 360 & Transit Crowd",
    "solution_type": "Digital Solution",
    "mentor": "Divya",
    "booths": [
      "D03",
      "D04"
    ],
    "booth_codes": "D03, D04",
    "venue_location": "Zone 2 • Booths D03 & D04"
  },
  {
    "student_name": "Aradhya Navalakha",
    "class_section": "IX-L",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 17,
    "project_title": "Transit Crowd & CityWatch AI",
    "solution_type": "Technical Prototype",
    "mentor": "Faculty Advisor",
    "booths": [
      "D04",
      "D05"
    ],
    "booth_codes": "D04, D05",
    "venue_location": "Zone 2 • Booths D04 & D05"
  },
  {
    "student_name": "Dheyanshi Malik",
    "class_section": "IX-L",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 17,
    "project_title": "Transit Crowd & CityWatch AI",
    "solution_type": "Technical Prototype",
    "mentor": "Faculty Advisor",
    "booths": [
      "D04",
      "D05"
    ],
    "booth_codes": "D04, D05",
    "venue_location": "Zone 2 • Booths D04 & D05"
  },
  {
    "student_name": "Ehan Haider",
    "class_section": "IX-L",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 17,
    "project_title": "Transit Crowd & CityWatch AI",
    "solution_type": "Technical Prototype",
    "mentor": "Faculty Advisor",
    "booths": [
      "D04",
      "D05"
    ],
    "booth_codes": "D04, D05",
    "venue_location": "Zone 2 • Booths D04 & D05"
  },
  {
    "student_name": "Harshil Verma",
    "class_section": "XI-G",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 17,
    "project_title": "Rehab 360 & Transit Crowd",
    "solution_type": "Digital Solution",
    "mentor": "Divya",
    "booths": [
      "D03",
      "D04"
    ],
    "booth_codes": "D03, D04",
    "venue_location": "Zone 2 • Booths D03 & D04"
  },
  {
    "student_name": "Mihir Bouri",
    "class_section": "IX-L",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 17,
    "project_title": "Transit Crowd & CityWatch AI",
    "solution_type": "Technical Prototype",
    "mentor": "Faculty Advisor",
    "booths": [
      "D04",
      "D05"
    ],
    "booth_codes": "D04, D05",
    "venue_location": "Zone 2 • Booths D04 & D05"
  },
  {
    "student_name": "Neel Arora",
    "class_section": "XI-C",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 17,
    "project_title": "Rehab 360 & Transit Crowd",
    "solution_type": "Digital Solution",
    "mentor": "Divya",
    "booths": [
      "D03",
      "D04"
    ],
    "booth_codes": "D03, D04",
    "venue_location": "Zone 2 • Booths D03 & D04"
  },
  {
    "student_name": "Ridhima Agarwal",
    "class_section": "IX-L",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 17,
    "project_title": "Transit Crowd & CityWatch AI",
    "solution_type": "Technical Prototype",
    "mentor": "Faculty Advisor",
    "booths": [
      "D04",
      "D05"
    ],
    "booth_codes": "D04, D05",
    "venue_location": "Zone 2 • Booths D04 & D05"
  },
  {
    "student_name": "Vaanika Goyal",
    "class_section": "IX-L",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 17,
    "project_title": "Transit Crowd & CityWatch AI",
    "solution_type": "Technical Prototype",
    "mentor": "Faculty Advisor",
    "booths": [
      "D04",
      "D05"
    ],
    "booth_codes": "D04, D05",
    "venue_location": "Zone 2 • Booths D04 & D05"
  },
  {
    "student_name": "Vidwan Bhatnagar",
    "class_section": "XI-C",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 17,
    "project_title": "Rehab 360 & Transit Crowd",
    "solution_type": "Digital Solution",
    "mentor": "Divya",
    "booths": [
      "D03",
      "D04"
    ],
    "booth_codes": "D03, D04",
    "venue_location": "Zone 2 • Booths D03 & D04"
  },
  {
    "student_name": "Zainul Abdeen",
    "class_section": "IX-L",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 17,
    "project_title": "Transit Crowd & CityWatch AI",
    "solution_type": "Technical Prototype",
    "mentor": "Faculty Advisor",
    "booths": [
      "D04",
      "D05"
    ],
    "booth_codes": "D04, D05",
    "venue_location": "Zone 2 • Booths D04 & D05"
  },
  {
    "student_name": "Aarush Agarwal",
    "class_section": "IX-I",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 18,
    "project_title": "Hetu Setu & Transit Crowd",
    "solution_type": "Digital Solution",
    "mentor": "Divya",
    "booths": [
      "D02",
      "D04"
    ],
    "booth_codes": "D02, D04",
    "venue_location": "Zone 2 • Booths D02 & D04"
  },
  {
    "student_name": "Aradhya Singh",
    "class_section": "IX-C",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 18,
    "project_title": "GrowGrid & Hetu Setu",
    "solution_type": "Technical Prototype",
    "mentor": "Faculty Advisor",
    "booths": [
      "B02",
      "D02",
      "D06"
    ],
    "booth_codes": "B02, D02, D06",
    "venue_location": "Booths B02 • D02 • D06"
  },
  {
    "student_name": "Ayyan Rahman",
    "class_section": "IX-I",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 18,
    "project_title": "Hetu Setu & Transit Crowd",
    "solution_type": "Digital Solution",
    "mentor": "Divya",
    "booths": [
      "D02",
      "D04"
    ],
    "booth_codes": "D02, D04",
    "venue_location": "Zone 2 • Booths D02 & D04"
  },
  {
    "student_name": "Evaan Rustagi",
    "class_section": "IX-C",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 18,
    "project_title": "Hetu Setu & Transit Station",
    "solution_type": "Technical Prototype",
    "mentor": "Faculty Advisor",
    "booths": [
      "D02",
      "D06"
    ],
    "booth_codes": "D02, D06",
    "venue_location": "Zone 2 • Booths D02 & D06"
  },
  {
    "student_name": "Manviya Parker",
    "class_section": "IX-D",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 18,
    "project_title": "Hetu Setu & Transit Station",
    "solution_type": "Technical Prototype",
    "mentor": "Faculty Advisor",
    "booths": [
      "D02",
      "D06"
    ],
    "booth_codes": "D02, D06",
    "venue_location": "Zone 2 • Booths D02 & D06"
  },
  {
    "student_name": "Parv Tomar",
    "class_section": "IX-I",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 18,
    "project_title": "Hetu Setu & Transit Crowd",
    "solution_type": "Digital Solution",
    "mentor": "Divya",
    "booths": [
      "D02",
      "D04"
    ],
    "booth_codes": "D02, D04",
    "venue_location": "Zone 2 • Booths D02 & D04"
  },
  {
    "student_name": "Rachita Verma",
    "class_section": "IX-I",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 18,
    "project_title": "Hetu Setu & Transit Crowd",
    "solution_type": "Digital Solution",
    "mentor": "Divya",
    "booths": [
      "D02",
      "D04"
    ],
    "booth_codes": "D02, D04",
    "venue_location": "Zone 2 • Booths D02 & D04"
  },
  {
    "student_name": "Sanchi Jain",
    "class_section": "IX-C",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 18,
    "project_title": "Hetu Setu & Transit Station",
    "solution_type": "Technical Prototype",
    "mentor": "Faculty Advisor",
    "booths": [
      "D02",
      "D06"
    ],
    "booth_codes": "D02, D06",
    "venue_location": "Zone 2 • Booths D02 & D06"
  },
  {
    "student_name": "Veronica Chawla",
    "class_section": "IX-D",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 18,
    "project_title": "Hetu Setu & Transit Station",
    "solution_type": "Technical Prototype",
    "mentor": "Faculty Advisor",
    "booths": [
      "D02",
      "D06"
    ],
    "booth_codes": "D02, D06",
    "venue_location": "Zone 2 • Booths D02 & D06"
  },
  {
    "student_name": "Yaashvy Nangia",
    "class_section": "IX-I",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 18,
    "project_title": "Hetu Setu & Transit Crowd",
    "solution_type": "Digital Solution",
    "mentor": "Divya",
    "booths": [
      "D02",
      "D04"
    ],
    "booth_codes": "D02, D04",
    "venue_location": "Zone 2 • Booths D02 & D04"
  },
  {
    "student_name": "Aarika Kapoor",
    "class_section": "VIII-E",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 19,
    "project_title": "Rehab 360 & Medical Kiosk",
    "solution_type": "Digital Solution",
    "mentor": "Divya",
    "booths": [
      "D03",
      "D07"
    ],
    "booth_codes": "D03, D07",
    "venue_location": "Zone 2 • Booths D03 & D07"
  },
  {
    "student_name": "Aarna Verma",
    "class_section": "VIII-E",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 19,
    "project_title": "Rehab 360 & Medical Kiosk",
    "solution_type": "Technical Prototype",
    "mentor": "Faculty Advisor",
    "booths": [
      "D03",
      "D07"
    ],
    "booth_codes": "D03, D07",
    "venue_location": "Zone 2 • Booths D03 & D07"
  },
  {
    "student_name": "Adhiraj",
    "class_section": "VI-D",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 19,
    "project_title": "Rehab 360 AI Therapist",
    "solution_type": "Digital Solution",
    "mentor": "Divya",
    "booths": [
      "D03"
    ],
    "booth_codes": "D03",
    "venue_location": "Zone 2 • Booth D03"
  },
  {
    "student_name": "Anav Mittal",
    "class_section": "VIII-E",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 19,
    "project_title": "Rehab 360 & Medical Kiosk",
    "solution_type": "Technical Prototype",
    "mentor": "Faculty Advisor",
    "booths": [
      "D03",
      "D07"
    ],
    "booth_codes": "D03, D07",
    "venue_location": "Zone 2 • Booths D03 & D07"
  },
  {
    "student_name": "Erisha Gupta",
    "class_section": "VIII-E",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 19,
    "project_title": "Rehab 360 & Medical Kiosk",
    "solution_type": "Technical Prototype",
    "mentor": "Faculty Advisor",
    "booths": [
      "D03",
      "D07"
    ],
    "booth_codes": "D03, D07",
    "venue_location": "Zone 2 • Booths D03 & D07"
  },
  {
    "student_name": "Ishaan",
    "class_section": "VI-D",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 19,
    "project_title": "Rehab 360 AI Therapist",
    "solution_type": "Digital Solution",
    "mentor": "Divya",
    "booths": [
      "D03"
    ],
    "booth_codes": "D03",
    "venue_location": "Zone 2 • Booth D03"
  },
  {
    "student_name": "Vedhika Dhawan",
    "class_section": "VIII-E",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 19,
    "project_title": "Rehab 360 & Medical Kiosk",
    "solution_type": "Digital Solution",
    "mentor": "Divya",
    "booths": [
      "D03",
      "D07"
    ],
    "booth_codes": "D03, D07",
    "venue_location": "Zone 2 • Booths D03 & D07"
  },
  {
    "student_name": "Aadhya Raj Singh",
    "class_section": "VI-D",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 20,
    "project_title": "WonderTech & Digital Passes",
    "solution_type": "Digital Solution",
    "mentor": "Vaibhav & Ajay",
    "booths": [
      "B07",
      "P10"
    ],
    "booth_codes": "B07, P10",
    "venue_location": "Zone 2 • Booths B07 & P10"
  },
  {
    "student_name": "Aadya Rana",
    "class_section": "VI-D",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 20,
    "project_title": "WonderTech & Digital Passes",
    "solution_type": "Digital Solution",
    "mentor": "Vaibhav & Ajay",
    "booths": [
      "B07",
      "P10"
    ],
    "booth_codes": "B07, P10",
    "venue_location": "Zone 2 • Booths B07 & P10"
  },
  {
    "student_name": "Abhishi Jain",
    "class_section": "VI-D",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 20,
    "project_title": "WonderTech & Digital Passes",
    "solution_type": "Digital Solution",
    "mentor": "Vaibhav & Ajay",
    "booths": [
      "B07",
      "P10"
    ],
    "booth_codes": "B07, P10",
    "venue_location": "Zone 2 • Booths B07 & P10"
  },
  {
    "student_name": "Khyati",
    "class_section": "VI-D",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 20,
    "project_title": "WonderTech & Digital Passes",
    "solution_type": "Digital Solution",
    "mentor": "Vaibhav & Ajay",
    "booths": [
      "B07",
      "P10"
    ],
    "booth_codes": "B07, P10",
    "venue_location": "Zone 2 • Booths B07 & P10"
  },
  {
    "student_name": "Pratyush",
    "class_section": "VI-D",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 20,
    "project_title": "Campus Digital Passes",
    "solution_type": "Digital Solution",
    "mentor": "Vaibhav & Ajay",
    "booths": [
      "P10"
    ],
    "booth_codes": "P10",
    "venue_location": "Zone 2 • Booth P10"
  },
  {
    "student_name": "Saanvi Narula",
    "class_section": "VI-D",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 20,
    "project_title": "WonderTech & Digital Passes",
    "solution_type": "Digital Solution",
    "mentor": "Vaibhav & Ajay",
    "booths": [
      "B07",
      "P10"
    ],
    "booth_codes": "B07, P10",
    "venue_location": "Zone 2 • Booths B07 & P10"
  },
  {
    "student_name": "Sarthak",
    "class_section": "VI-D",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 20,
    "project_title": "WonderTech & Digital Passes",
    "solution_type": "Digital Solution",
    "mentor": "Vaibhav & Ajay",
    "booths": [
      "B07",
      "P10"
    ],
    "booth_codes": "B07, P10",
    "venue_location": "Zone 2 • Booths B07 & P10"
  },
  {
    "student_name": "Ananya Singh",
    "class_section": "VI-I",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 21,
    "project_title": "Rehab 360 & Lost & Found OS",
    "solution_type": "Technical Prototype",
    "mentor": "Faculty Advisor",
    "booths": [
      "D03",
      "D09"
    ],
    "booth_codes": "D03, D09",
    "venue_location": "Zone 2 • Booths D03 & D09"
  },
  {
    "student_name": "Arham Singhal",
    "class_section": "VI-I",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 21,
    "project_title": "Rehab 360 & Lost & Found OS",
    "solution_type": "Technical Prototype",
    "mentor": "Faculty Advisor",
    "booths": [
      "D03",
      "D09"
    ],
    "booth_codes": "D03, D09",
    "venue_location": "Zone 2 • Booths D03 & D09"
  },
  {
    "student_name": "Pihu Verma",
    "class_section": "VI-I",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 21,
    "project_title": "Rehab 360 & Lost & Found OS",
    "solution_type": "Technical Prototype",
    "mentor": "Faculty Advisor",
    "booths": [
      "D03",
      "D09"
    ],
    "booth_codes": "D03, D09",
    "venue_location": "Zone 2 • Booths D03 & D09"
  },
  {
    "student_name": "Sanvi",
    "class_section": "VI-I",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 21,
    "project_title": "Rehab 360 & Lost & Found OS",
    "solution_type": "Technical Prototype",
    "mentor": "Faculty Advisor",
    "booths": [
      "D03",
      "D09"
    ],
    "booth_codes": "D03, D09",
    "venue_location": "Zone 2 • Booths D03 & D09"
  },
  {
    "student_name": "Vanya Singh",
    "class_section": "VI-I",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 21,
    "project_title": "Rehab 360 & Lost & Found OS",
    "solution_type": "Technical Prototype",
    "mentor": "Faculty Advisor",
    "booths": [
      "D03",
      "D09"
    ],
    "booth_codes": "D03, D09",
    "venue_location": "Zone 2 • Booths D03 & D09"
  },
  {
    "student_name": "Agrima",
    "class_section": "VII-L",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 22,
    "project_title": "Smart Water & Eco Trashcan",
    "solution_type": "Physical Solution",
    "mentor": "Krishna",
    "booths": [
      "P03",
      "P04"
    ],
    "booth_codes": "P03, P04",
    "venue_location": "Zone 2 • Booths P03 & P04"
  },
  {
    "student_name": "Arnisha",
    "class_section": "VII-L",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 22,
    "project_title": "Smart Water & Eco Trashcan",
    "solution_type": "Physical Solution",
    "mentor": "Krishna",
    "booths": [
      "P03",
      "P04"
    ],
    "booth_codes": "P03, P04",
    "venue_location": "Zone 2 • Booths P03 & P04"
  },
  {
    "student_name": "Ira",
    "class_section": "VII-L",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 22,
    "project_title": "Smart Water Management",
    "solution_type": "Physical Solution",
    "mentor": "Krishna",
    "booths": [
      "P03"
    ],
    "booth_codes": "P03",
    "venue_location": "Zone 2 • Booth P03"
  },
  {
    "student_name": "Raashi",
    "class_section": "VII-L",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 22,
    "project_title": "Smart Water Management",
    "solution_type": "Physical Solution",
    "mentor": "Krishna",
    "booths": [
      "P03"
    ],
    "booth_codes": "P03",
    "venue_location": "Zone 2 • Booth P03"
  },
  {
    "student_name": "Saanvi",
    "class_section": "VII-L",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 22,
    "project_title": "Smart Water Management",
    "solution_type": "Physical Solution",
    "mentor": "Krishna",
    "booths": [
      "P03"
    ],
    "booth_codes": "P03",
    "venue_location": "Zone 2 • Booth P03"
  },
  {
    "student_name": "Vanya",
    "class_section": "VII-L",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 22,
    "project_title": "Smart Water Management",
    "solution_type": "Physical Solution",
    "mentor": "Krishna",
    "booths": [
      "P03"
    ],
    "booth_codes": "P03",
    "venue_location": "Zone 2 • Booth P03"
  },
  {
    "student_name": "Amber Datta",
    "class_section": "XII-E",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 23,
    "project_title": "AI Exam Proctor & Health Thread",
    "solution_type": "Technical Prototype",
    "mentor": "Faculty Advisor",
    "booths": [
      "D11",
      "P07"
    ],
    "booth_codes": "D11, P07",
    "venue_location": "Zone 2 • Booths D11 & P07"
  },
  {
    "student_name": "Harish Mishra",
    "class_section": "XII-H",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 23,
    "project_title": "AI Exam Proctor & Health Thread",
    "solution_type": "Technical Prototype",
    "mentor": "Faculty Advisor",
    "booths": [
      "D11",
      "P07"
    ],
    "booth_codes": "D11, P07",
    "venue_location": "Zone 2 • Booths D11 & P07"
  },
  {
    "student_name": "Ranvijay Singh",
    "class_section": "XII-E",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 23,
    "project_title": "AI Exam Proctor & Health Thread",
    "solution_type": "Technical Prototype",
    "mentor": "Faculty Advisor",
    "booths": [
      "D11",
      "P07"
    ],
    "booth_codes": "D11, P07",
    "venue_location": "Zone 2 • Booths D11 & P07"
  },
  {
    "student_name": "Aadvik Bhargava",
    "class_section": "VI-I",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 24,
    "project_title": "Smart Water & Classroom Flow",
    "solution_type": "Physical Solution",
    "mentor": "Vaibhav & Ajay",
    "booths": [
      "P03",
      "P08"
    ],
    "booth_codes": "P03, P08",
    "venue_location": "Zone 2 • Booths P03 & P08"
  },
  {
    "student_name": "Chitrakshi Sharma",
    "class_section": "VI-I",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 24,
    "project_title": "Smart Water & Classroom Flow",
    "solution_type": "Physical Solution",
    "mentor": "Vaibhav & Ajay",
    "booths": [
      "P03",
      "P08"
    ],
    "booth_codes": "P03, P08",
    "venue_location": "Zone 2 • Booths P03 & P08"
  },
  {
    "student_name": "Jaivardhan Joshi",
    "class_section": "VI-I",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 24,
    "project_title": "Smart Water & Classroom Flow",
    "solution_type": "Physical Solution",
    "mentor": "Vaibhav & Ajay",
    "booths": [
      "P03",
      "P08"
    ],
    "booth_codes": "P03, P08",
    "venue_location": "Zone 2 • Booths P03 & P08"
  },
  {
    "student_name": "Karnav Arora",
    "class_section": "VI-I",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 24,
    "project_title": "Smart Water & Classroom Flow",
    "solution_type": "Physical Solution",
    "mentor": "Vaibhav & Ajay",
    "booths": [
      "P03",
      "P08"
    ],
    "booth_codes": "P03, P08",
    "venue_location": "Zone 2 • Booths P03 & P08"
  },
  {
    "student_name": "Maurya Santosh",
    "class_section": "VI-I",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 24,
    "project_title": "Smart Water & Classroom Flow",
    "solution_type": "Physical Solution",
    "mentor": "Vaibhav & Ajay",
    "booths": [
      "P03",
      "P08"
    ],
    "booth_codes": "P03, P08",
    "venue_location": "Zone 2 • Booths P03 & P08"
  },
  {
    "student_name": "Samarth Bhatia",
    "class_section": "VI-I",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 24,
    "project_title": "Smart Water & Classroom Flow",
    "solution_type": "Physical Solution",
    "mentor": "Vaibhav & Ajay",
    "booths": [
      "P03",
      "P08"
    ],
    "booth_codes": "P03, P08",
    "venue_location": "Zone 2 • Booths P03 & P08"
  },
  {
    "student_name": "Angel Kansal",
    "class_section": "IX-B",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 25,
    "project_title": "Medical Supply Drone",
    "solution_type": "Physical Solution",
    "mentor": "Divya & Shubham",
    "booths": [
      "P05"
    ],
    "booth_codes": "P05",
    "venue_location": "Zone 2 • Booth P05"
  },
  {
    "student_name": "Ashmit Roy",
    "class_section": "IX-B",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 25,
    "project_title": "Medical Drone & TitanKeeper",
    "solution_type": "Physical Solution",
    "mentor": "Divya & Shubham",
    "booths": [
      "P05",
      "S02"
    ],
    "booth_codes": "P05, S02",
    "venue_location": "Booths P05 (Zone 2) & S02 (Zone 3)"
  },
  {
    "student_name": "Prakhar Prashant Sangal",
    "class_section": "IX-B",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 25,
    "project_title": "Medical Supply Drone",
    "solution_type": "Physical Solution",
    "mentor": "Divya & Shubham",
    "booths": [
      "P05"
    ],
    "booth_codes": "P05",
    "venue_location": "Zone 2 • Booth P05"
  },
  {
    "student_name": "Swasti Arora",
    "class_section": "IX-B",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 25,
    "project_title": "Medical Supply Drone",
    "solution_type": "Physical Solution",
    "mentor": "Divya & Shubham",
    "booths": [
      "P05"
    ],
    "booth_codes": "P05",
    "venue_location": "Zone 2 • Booth P05"
  },
  {
    "student_name": "Vatsal Kumar",
    "class_section": "IX-B",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 25,
    "project_title": "Medical Drone & TitanKeeper",
    "solution_type": "Physical Solution",
    "mentor": "Divya & Shubham",
    "booths": [
      "P05",
      "S02"
    ],
    "booth_codes": "P05, S02",
    "venue_location": "Booths P05 (Zone 2) & S02 (Zone 3)"
  },
  {
    "student_name": "Adarsh Acharya",
    "class_section": "XII-E",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 26,
    "project_title": "RouteWise Optimization",
    "solution_type": "Physical Solution",
    "mentor": "Shashank",
    "booths": [
      "D10"
    ],
    "booth_codes": "D10",
    "venue_location": "Zone 2 • Booth D10"
  },
  {
    "student_name": "Ananya Sharma",
    "class_section": "VIII-E",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 26,
    "project_title": "GrowGrid & RouteWise",
    "solution_type": "Technical Prototype",
    "mentor": "Faculty Advisor",
    "booths": [
      "B02",
      "D10"
    ],
    "booth_codes": "B02, D10",
    "venue_location": "Zone 2 • Booths B02 & D10"
  },
  {
    "student_name": "Aniha Mittal",
    "class_section": "VIII-E",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 26,
    "project_title": "GrowGrid & RouteWise",
    "solution_type": "Technical Prototype",
    "mentor": "Faculty Advisor",
    "booths": [
      "B02",
      "D10"
    ],
    "booth_codes": "B02, D10",
    "venue_location": "Zone 2 • Booths B02 & D10"
  },
  {
    "student_name": "Deeya Malhotra",
    "class_section": "XII-E",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 26,
    "project_title": "RouteWise Optimization",
    "solution_type": "Physical Solution",
    "mentor": "Shashank",
    "booths": [
      "D10"
    ],
    "booth_codes": "D10",
    "venue_location": "Zone 2 • Booth D10"
  },
  {
    "student_name": "Pranshi Chadha",
    "class_section": "VIII-E",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 26,
    "project_title": "GrowGrid & RouteWise",
    "solution_type": "Technical Prototype",
    "mentor": "Faculty Advisor",
    "booths": [
      "B02",
      "D10"
    ],
    "booth_codes": "B02, D10",
    "venue_location": "Zone 2 • Booths B02 & D10"
  },
  {
    "student_name": "Priyan Asawa",
    "class_section": "XII-E",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 26,
    "project_title": "RouteWise Optimization",
    "solution_type": "Physical Solution",
    "mentor": "Shashank",
    "booths": [
      "D10"
    ],
    "booth_codes": "D10",
    "venue_location": "Zone 2 • Booth D10"
  },
  {
    "student_name": "Sparsh Goel",
    "class_section": "XII-E",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 26,
    "project_title": "RouteWise & AI Exam Proctor",
    "solution_type": "Physical Solution",
    "mentor": "Shashank",
    "booths": [
      "D10",
      "D11"
    ],
    "booth_codes": "D10, D11",
    "venue_location": "Zone 2 • Booths D10 & D11"
  },
  {
    "student_name": "Agamya Tripathi",
    "class_section": "VIII-E",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 27,
    "project_title": "PPE Safety & IoT Locker",
    "solution_type": "Technical Prototype",
    "mentor": "Faculty Advisor",
    "booths": [
      "B03",
      "P09"
    ],
    "booth_codes": "B03, P09",
    "venue_location": "Zone 2 • Booths B03 & P09"
  },
  {
    "student_name": "Lavishka Sood",
    "class_section": "IX-B",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 27,
    "project_title": "Smart IoT Locker Box",
    "solution_type": "Physical Solution",
    "mentor": "Shubham",
    "booths": [
      "P09"
    ],
    "booth_codes": "P09",
    "venue_location": "Zone 2 • Booth P09"
  },
  {
    "student_name": "Pratyoosh Singh",
    "class_section": "IX-B",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 27,
    "project_title": "Smart IoT Locker Box",
    "solution_type": "Physical Solution",
    "mentor": "Shubham",
    "booths": [
      "P09"
    ],
    "booth_codes": "P09",
    "venue_location": "Zone 2 • Booth P09"
  },
  {
    "student_name": "Ritvij Dwivedi",
    "class_section": "IX-B",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 27,
    "project_title": "IoT Locker & Robo Drift",
    "solution_type": "Physical Solution",
    "mentor": "Shubham",
    "booths": [
      "P09",
      "R02"
    ],
    "booth_codes": "P09, R02",
    "venue_location": "Booths P09 (Zone 2) & R02 (Zone 3)"
  },
  {
    "student_name": "Shashwat Singh",
    "class_section": "IX-B",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 27,
    "project_title": "IoT Locker & Robo Drift",
    "solution_type": "Physical Solution",
    "mentor": "Shubham",
    "booths": [
      "P09",
      "R02"
    ],
    "booth_codes": "P09, R02",
    "venue_location": "Booths P09 (Zone 2) & R02 (Zone 3)"
  },
  {
    "student_name": "Tarini Makhija",
    "class_section": "IX-B",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 27,
    "project_title": "Smart IoT Locker Box",
    "solution_type": "Physical Solution",
    "mentor": "Shubham",
    "booths": [
      "P09"
    ],
    "booth_codes": "P09",
    "venue_location": "Zone 2 • Booth P09"
  },
  {
    "student_name": "Vidhi Jain",
    "class_section": "IX-B",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 27,
    "project_title": "Smart IoT Locker Box",
    "solution_type": "Physical Solution",
    "mentor": "Shubham",
    "booths": [
      "P09"
    ],
    "booth_codes": "P09",
    "venue_location": "Zone 2 • Booth P09"
  },
  {
    "student_name": "Aavya Mishra",
    "class_section": "VI-B",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 30,
    "project_title": "CityWatch AI & Eagle Eye",
    "solution_type": "Physical Solution, Digital Solution",
    "mentor": "Shashank",
    "booths": [
      "D05",
      "D12"
    ],
    "booth_codes": "D05, D12",
    "venue_location": "Zone 2 • Booths D05 & D12"
  },
  {
    "student_name": "Arshita Shrivastava",
    "class_section": "VI-B",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 30,
    "project_title": "CityWatch AI & Eagle Eye",
    "solution_type": "Physical Solution, Digital Solution",
    "mentor": "Shashank",
    "booths": [
      "D05",
      "D12"
    ],
    "booth_codes": "D05, D12",
    "venue_location": "Zone 2 • Booths D05 & D12"
  },
  {
    "student_name": "Myra Chaudhary",
    "class_section": "VI-B",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 30,
    "project_title": "CityWatch AI & Eagle Eye",
    "solution_type": "Physical Solution, Digital Solution",
    "mentor": "Shashank",
    "booths": [
      "D05",
      "D12"
    ],
    "booth_codes": "D05, D12",
    "venue_location": "Zone 2 • Booths D05 & D12"
  },
  {
    "student_name": "Nivaan Rastogi",
    "class_section": "VIII-I",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 30,
    "project_title": "Trading Cards & CityWatch AI",
    "solution_type": "Technical Prototype",
    "mentor": "Faculty Advisor",
    "booths": [
      "B06",
      "D05"
    ],
    "booth_codes": "B06, D05",
    "venue_location": "Zone 2 • Booths B06 & D05"
  },
  {
    "student_name": "Vihaan Chaganti",
    "class_section": "VIII-I",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 30,
    "project_title": "Trading Cards & CityWatch AI",
    "solution_type": "Technical Prototype",
    "mentor": "Faculty Advisor",
    "booths": [
      "B06",
      "D05"
    ],
    "booth_codes": "B06, D05",
    "venue_location": "Zone 2 • Booths B06 & D05"
  },
  {
    "student_name": "Aryan Jindal",
    "class_section": "XI-A",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 31,
    "project_title": "Stepwise AI & Robo Soccer",
    "solution_type": "Physical Solution",
    "mentor": "Divya",
    "booths": [
      "P01",
      "S01"
    ],
    "booth_codes": "P01, S01",
    "venue_location": "Booths P01 (Zone 2) & S01 (Zone 3)"
  },
  {
    "student_name": "Pratyush Kashyap",
    "class_section": "VI-H",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 31,
    "project_title": "WonderTech & Stepwise AI",
    "solution_type": "Technical Prototype",
    "mentor": "Faculty Advisor",
    "booths": [
      "B07",
      "P01"
    ],
    "booth_codes": "B07, P01",
    "venue_location": "Zone 2 • Booths B07 & P01"
  },
  {
    "student_name": "Pulkit Chandra",
    "class_section": "XI-C",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 31,
    "project_title": "Stepwise AI & Robo Soccer",
    "solution_type": "Physical Solution",
    "mentor": "Divya",
    "booths": [
      "P01",
      "S01"
    ],
    "booth_codes": "P01, S01",
    "venue_location": "Booths P01 (Zone 2) & S01 (Zone 3)"
  },
  {
    "student_name": "Aanya Sharma",
    "class_section": "VIII-B",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 32,
    "project_title": "BioHarvest & Eagle Eye",
    "solution_type": "Technical Prototype",
    "mentor": "Faculty Advisor",
    "booths": [
      "B08",
      "D12"
    ],
    "booth_codes": "B08, D12",
    "venue_location": "Zone 2 • Booths B08 & D12"
  },
  {
    "student_name": "Devansh Singhal",
    "class_section": "VIII-B",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 32,
    "project_title": "BioHarvest & Eagle Eye",
    "solution_type": "Technical Prototype",
    "mentor": "Faculty Advisor",
    "booths": [
      "B08",
      "D12"
    ],
    "booth_codes": "B08, D12",
    "venue_location": "Zone 2 • Booths B08 & D12"
  },
  {
    "student_name": "Rohan Gupta",
    "class_section": "VIII-D",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 32,
    "project_title": "BioHarvest & Eagle Eye",
    "solution_type": "Technical Prototype",
    "mentor": "Faculty Advisor",
    "booths": [
      "B08",
      "D12"
    ],
    "booth_codes": "B08, D12",
    "venue_location": "Zone 2 • Booths B08 & D12"
  },
  {
    "student_name": "Shrihan Sinha",
    "class_section": "VIII-H",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 32,
    "project_title": "Eagle Eye & Dehumidifier",
    "solution_type": "Technical Prototype",
    "mentor": "Faculty Advisor",
    "booths": [
      "D12",
      "P12"
    ],
    "booth_codes": "D12, P12",
    "venue_location": "Zone 2 • Booths D12 & P12"
  },
  {
    "student_name": "Siddharth",
    "class_section": "VIII-H",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 32,
    "project_title": "Eagle Eye Security",
    "solution_type": "Technical Prototype",
    "mentor": "Faculty Advisor",
    "booths": [
      "D12"
    ],
    "booth_codes": "D12",
    "venue_location": "Zone 2 • Booth D12"
  },
  {
    "student_name": "6I Group 2",
    "class_section": "6",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 33,
    "project_title": "Clothes Dehumidifier",
    "solution_type": "Physical Solution",
    "mentor": "Shubham",
    "booths": [
      "P12"
    ],
    "booth_codes": "P12",
    "venue_location": "Zone 2 • Booth P12"
  },
  {
    "student_name": "Abir Bandyopadhyay",
    "class_section": "VII-D",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 34,
    "project_title": "GrowGrid & Flight Dynamics",
    "solution_type": "Physical Solution",
    "mentor": "Shubham",
    "booths": [
      "B02",
      "ST01"
    ],
    "booth_codes": "B02, ST01",
    "venue_location": "Booths B02 (Zone 2) & ST01 (Zone 1)"
  },
  {
    "student_name": "Devraj Rautela",
    "class_section": "VII-D",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 34,
    "project_title": "Aeroplane Flight Dynamics",
    "solution_type": "Physical Solution",
    "mentor": "Shubham",
    "booths": [
      "ST01"
    ],
    "booth_codes": "ST01",
    "venue_location": "Zone 1 • Booth ST01"
  },
  {
    "student_name": "Pranshoo Mittal",
    "class_section": "XI-B",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 35,
    "project_title": "Move Smarter & Unitree G1",
    "solution_type": "Physical Solution",
    "mentor": "Shashank & Shubham",
    "booths": [
      "D11",
      "P02",
      "R01",
      "ST04"
    ],
    "booth_codes": "D11, P02, R01, ST04",
    "venue_location": "Booths D11 • P02 • R01 • ST04"
  },
  {
    "student_name": "Ojas Singh",
    "class_section": "IX-A",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 36,
    "project_title": "Cloud (GO2) & Robo Race",
    "solution_type": "Technical Prototype",
    "mentor": "Shashank",
    "booths": [
      "R01",
      "ST03"
    ],
    "booth_codes": "R01, ST03",
    "venue_location": "Booths R01 (Zone 3) & ST03 (Zone 1)"
  },
  {
    "student_name": "Agrima Jain",
    "class_section": "IX-D",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 36,
    "project_title": "Cloud (GO2) Quadruped",
    "solution_type": "Technical Prototype",
    "mentor": "Shashank",
    "booths": [
      "ST03"
    ],
    "booth_codes": "ST03",
    "venue_location": "Zone 1 • Booth ST03"
  },
  {
    "student_name": "Anshita",
    "class_section": "VI-B",
    "role": "EXHIBITOR",
    "pass_code": "987654",
    "project_number": 37,
    "project_title": "Unitree G1 & Race Car",
    "solution_type": "Technical Prototype",
    "mentor": "Faculty Advisor",
    "booths": [
      "ST04",
      "ST05"
    ],
    "booth_codes": "ST04, ST05",
    "venue_location": "Zone 1 • Booths ST04 & ST05"
  }
];
