import fs from 'node:fs';
import path from 'node:path';
import {
  OFFICIAL_STUDENTS_ROSTER,
  OFFICIAL_TEACHERS_AND_INCHARGES,
  OFFICIAL_GRAND_JURY,
  OFFICIAL_VIP_GUESTS,
  getStudentCredentialId,
  getStudentBoothInfo,
} from '../src/data/exhibitionRegistry';
import { generateAppleCardSvg } from '../src/lib/badgeGenerator';

const ROOT_DIR = process.cwd();
const PASSES_DIR = path.join(ROOT_DIR, 'passes');
const STUDENTS_DIR = path.join(PASSES_DIR, 'students');
const INCHARGES_DIR = path.join(PASSES_DIR, 'incharges');
const JUDGES_DIR = path.join(PASSES_DIR, 'judges');
const VIPS_DIR = path.join(PASSES_DIR, 'vips');

// Create directories
[PASSES_DIR, STUDENTS_DIR, INCHARGES_DIR, JUDGES_DIR, VIPS_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Load template SVGs
const templateExhibitor = fs.readFileSync(path.join(ROOT_DIR, 'public/badges/exhibitor.svg'), 'utf8');
const templateIncharge = fs.readFileSync(path.join(ROOT_DIR, 'public/badges/incharge.svg'), 'utf8');
const templateJudge = fs.readFileSync(path.join(ROOT_DIR, 'public/badges/judge.svg'), 'utf8');
const templateVip = fs.readFileSync(path.join(ROOT_DIR, 'public/badges/vip.svg'), 'utf8');

function cleanFilename(str: string): string {
  return str.trim().replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '');
}

console.log('--- Generating Official Apple Card Passes ---');

// 1. Students (177)
interface StudentRecord {
  credentialId: string;
  name: string;
  classSection: string;
  projectNumber: number;
  projectTitle: string;
  venueLocation: string;
  filename: string;
}

const studentEntries: StudentRecord[] = [];
OFFICIAL_STUDENTS_ROSTER.forEach((s) => {
  const boothInfo = getStudentBoothInfo(s);
  const credId = getStudentCredentialId(s);
  const filename = `${credId}_${cleanFilename(s.student_name)}.svg`;
  const filePath = path.join(STUDENTS_DIR, filename);

  const svg = generateAppleCardSvg(templateExhibitor, {
    name: s.student_name,
    classSection: s.class_section,
    credentialId: credId,
    projectDomain: s.project_title,
    venueLocation: s.venue_location || boothInfo.venue_location,
  });

  fs.writeFileSync(filePath, svg, 'utf8');
  studentEntries.push({
    credentialId: credId,
    name: s.student_name,
    classSection: s.class_section,
    projectNumber: s.project_number,
    projectTitle: s.project_title,
    venueLocation: s.venue_location || boothInfo.venue_location,
    filename: `students/${filename}`,
  });
});
console.log(`Generated ${studentEntries.length} Student passes in passes/students/`);

// 2. Teachers & Faculty Incharges (8)
interface InchargeRecord {
  credentialId: string;
  name: string;
  role: string;
  filename: string;
}

const inchargeEntries: InchargeRecord[] = [];
OFFICIAL_TEACHERS_AND_INCHARGES.forEach((t) => {
  const credId = t.credential_id;
  const filename = `${credId}_${cleanFilename(t.name)}.svg`;
  const filePath = path.join(INCHARGES_DIR, filename);

  const svg = generateAppleCardSvg(templateIncharge, {
    name: t.name,
    classSection: '',
    credentialId: credId,
    projectDomain: '',
    venueLocation: '',
  });

  fs.writeFileSync(filePath, svg, 'utf8');
  inchargeEntries.push({
    credentialId: credId,
    name: t.name,
    role: 'Faculty Incharge',
    filename: `incharges/${filename}`,
  });
});
console.log(`Generated ${inchargeEntries.length} Faculty Incharge passes in passes/incharges/`);

// 3. Grand Jury Evaluators (6)
interface JudgeRecord {
  credentialId: string;
  name: string;
  specialization: string;
  institution: string;
  filename: string;
}

const judgeEntries: JudgeRecord[] = [];
OFFICIAL_GRAND_JURY.forEach((j) => {
  const credId = j.credential_id;
  const filename = `${credId}_${cleanFilename(j.name)}.svg`;
  const filePath = path.join(JUDGES_DIR, filename);

  const svg = generateAppleCardSvg(templateJudge, {
    name: j.name,
    classSection: '',
    credentialId: credId,
    projectDomain: '',
    venueLocation: '',
  });

  fs.writeFileSync(filePath, svg, 'utf8');
  judgeEntries.push({
    credentialId: credId,
    name: j.name,
    specialization: j.specialization,
    institution: j.institution,
    filename: `judges/${filename}`,
  });
});
console.log(`Generated ${judgeEntries.length} Grand Jury passes in passes/judges/`);

// 4. Distinguished VIP Guests (6)
interface VipRecord {
  credentialId: string;
  name: string;
  designation: string;
  organization: string;
  filename: string;
}

const vipEntries: VipRecord[] = [];
OFFICIAL_VIP_GUESTS.forEach((v) => {
  const credId = v.credential_id;
  const filename = `${credId}_${cleanFilename(v.name)}.svg`;
  const filePath = path.join(VIPS_DIR, filename);

  const svg = generateAppleCardSvg(templateVip, {
    name: v.name,
    classSection: '',
    credentialId: credId,
    projectDomain: '',
    venueLocation: '',
  });

  fs.writeFileSync(filePath, svg, 'utf8');
  vipEntries.push({
    credentialId: credId,
    name: v.name,
    designation: v.designation,
    organization: v.organization,
    filename: `vips/${filename}`,
  });
});
console.log(`Generated ${vipEntries.length} VIP passes in passes/vips/`);

const totalPasses = studentEntries.length + inchargeEntries.length + judgeEntries.length + vipEntries.length;
console.log(`\nTOTAL PASSES GENERATED: ${totalPasses}`);

// 5. Generate passes/README.md
const readmeContent = `# DPS Indirapuram Annual Tech & Innovation Exhibition 2026
## Official CR-100 Pass Directory

This directory contains the production-ready vector passes (SVG) for all **${totalPasses} registered participants** across the 4 summit categories.

---

### Pass Breakdown
| Category | Directory | Count | Specifications |
| :--- | :--- | :--- | :--- |
| **Student Innovators** | [\`students/\`](./students) | **${studentEntries.length}** | Class & Section, Project Domain, Venue Location, TopoTag Failsafe Matrix, Micro-QR |
| **Faculty Incharges** | [\`incharges/\`](./incharges) | **${inchargeEntries.length}** | Minimalist Apple Card format (Name, Credential ID, TopoTag, Micro-QR) |
| **Grand Jury Evaluators** | [\`judges/\`](./judges) | **${judgeEntries.length}** | Minimalist Apple Card format (Name, Credential ID, TopoTag, Micro-QR) |
| **Distinguished VIP Guests** | [\`vips/\`](./vips) | **${vipEntries.length}** | Minimalist Apple Card format (Name, Credential ID, TopoTag, Micro-QR) |
| **Total Official Passes** | | **${totalPasses}** | **100% Unique Optical TopoTags & Micro-QR Codes** |

---

### Faculty Incharges (${inchargeEntries.length})
${inchargeEntries.map((t) => `- **${t.name}** (\`${t.credentialId}\`) &rarr; [\`${path.basename(t.filename)}\`](./${t.filename})`).join('\n')}

---

### Grand Jury Evaluators (${judgeEntries.length})
${judgeEntries.map((j) => `- **${j.name}** (\`${j.credentialId}\`) &mdash; *${j.specialization} (${j.institution})* &rarr; [\`${path.basename(j.filename)}\`](./${j.filename})`).join('\n')}

---

### Distinguished VIP Guests (${vipEntries.length})
${vipEntries.map((v) => `- **${v.name}** (\`${v.credentialId}\`) &mdash; *${v.designation} (${v.organization})* &rarr; [\`${path.basename(v.filename)}\`](./${v.filename})`).join('\n')}

---

### Features & Optical Security
- **Topological Invariant TopoTags:** Each badge embeds an authentic 18-cell hexagonal butterfly matrix with 5 to 7 genus-1 rings unique to the participant's Credential ID, functioning as an optical failsafe if the QR code is damaged or unreadable.
- **ISO/IEC 18004 Micro-QR Codes:** Optically readable by standard smartphone cameras and the in-app scanner.
- **Apple Card CR-100 Standard:** 85.60 mm &times; 53.98 mm aspect ratio with 3.18 mm rounded corner radius.
- **Zero Text Overflow:** All long names, specializations, and credential IDs fit within safe bounding boxes.
- **Interactive Offline Viewer:** Open [\`index.html\`](./index.html) in any web browser to search, preview, and print all badges with one click.
`;

fs.writeFileSync(path.join(PASSES_DIR, 'README.md'), readmeContent, 'utf8');
console.log('Generated passes/README.md');

// 6. Generate passes/index.html (Interactive offline badge viewer & batch print gallery)
const indexHtmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DPS Indirapuram Exhibition 2026 — Official Pass Suite</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @media print {
      body { background: white !important; color: black !important; }
      .no-print { display: none !important; }
      .print-grid {
        display: grid !important;
        grid-template-columns: repeat(2, 1fr) !important;
        gap: 12mm !important;
        page-break-after: always;
      }
      .badge-card {
        box-shadow: none !important;
        border: 1px dashed #cbd5e1 !important;
        break-inside: avoid;
      }
    }
    .badge-preview {
      aspect-ratio: 856 / 540;
      width: 100%;
    }
  </style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen font-sans flex flex-col selection:bg-amber-500 selection:text-slate-950">
  <!-- Header -->
  <header class="no-print border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2">
          <span class="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
          <h1 class="text-lg font-bold tracking-tight text-white">DELHI PUBLIC SCHOOL INDIRAPURAM</h1>
        </div>
        <p class="text-xs text-slate-400">Annual Tech & Innovation Exhibition 2026 &bull; Pass Directory (${totalPasses} Badges)</p>
      </div>

      <!-- Search & Category Filters -->
      <div class="flex items-center gap-2 w-full sm:w-auto">
        <input
          id="searchInput"
          type="text"
          placeholder="Search by name, ID (e.g. EXH-0001, INC-, VIP-)..."
          class="bg-slate-950 border border-slate-700 text-xs rounded-lg px-3 py-2 w-full sm:w-72 focus:outline-none focus:border-amber-400 text-white placeholder-slate-500"
          oninput="filterBadges()"
        />
        <button
          onclick="window.print()"
          class="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold whitespace-nowrap shadow-sm transition"
        >
          Print Current View
        </button>
      </div>
    </div>

    <!-- Category Tabs -->
    <div class="max-w-7xl mx-auto px-4 flex gap-2 border-t border-slate-800/80 pt-2 pb-2 overflow-x-auto text-xs font-medium">
      <button onclick="setTab('all')" id="tab-all" class="tab-btn px-3 py-1.5 rounded-md bg-amber-500 text-slate-950 font-bold">All (${totalPasses})</button>
      <button onclick="setTab('students')" id="tab-students" class="tab-btn px-3 py-1.5 rounded-md bg-slate-800 text-slate-300 hover:text-white">Students (${studentEntries.length})</button>
      <button onclick="setTab('incharges')" id="tab-incharges" class="tab-btn px-3 py-1.5 rounded-md bg-slate-800 text-slate-300 hover:text-white">Incharges (${inchargeEntries.length})</button>
      <button onclick="setTab('judges')" id="tab-judges" class="tab-btn px-3 py-1.5 rounded-md bg-slate-800 text-slate-300 hover:text-white">Grand Jury (${judgeEntries.length})</button>
      <button onclick="setTab('vips')" id="tab-vips" class="tab-btn px-3 py-1.5 rounded-md bg-slate-800 text-slate-300 hover:text-white">VIP Guests (${vipEntries.length})</button>
    </div>
  </header>

  <!-- Badge Grid Container -->
  <main class="max-w-7xl mx-auto px-4 py-8 flex-1 w-full">
    <div id="badgeCount" class="no-print text-xs text-slate-400 mb-4 font-mono">Showing ${totalPasses} of ${totalPasses} passes</div>
    <div id="badgeGrid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 print-grid"></div>
  </main>

  <script>
    const BADGES = [
      ...${JSON.stringify(inchargeEntries.map(e => ({ ...e, category: 'incharges', roleText: 'Faculty Incharge' })))},
      ...${JSON.stringify(vipEntries.map(e => ({ ...e, category: 'vips', roleText: e.designation + ' • ' + e.organization })))},
      ...${JSON.stringify(judgeEntries.map(e => ({ ...e, category: 'judges', roleText: e.specialization + ' • ' + e.institution })))},
      ...${JSON.stringify(studentEntries.map(e => ({ ...e, category: 'students', roleText: e.classSection + ' • ' + e.projectTitle })))},
    ];

    let currentTab = 'all';

    function setTab(tab) {
      currentTab = tab;
      document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.className = 'tab-btn px-3 py-1.5 rounded-md bg-slate-800 text-slate-300 hover:text-white';
      });
      const activeBtn = document.getElementById('tab-' + tab);
      if (activeBtn) {
        activeBtn.className = 'tab-btn px-3 py-1.5 rounded-md bg-amber-500 text-slate-950 font-bold';
      }
      filterBadges();
    }

    function filterBadges() {
      const q = (document.getElementById('searchInput').value || '').toLowerCase().trim();
      const filtered = BADGES.filter(b => {
        const matchesTab = currentTab === 'all' || b.category === currentTab;
        const matchesQuery = !q ||
          b.name.toLowerCase().includes(q) ||
          b.credentialId.toLowerCase().includes(q) ||
          (b.roleText && b.roleText.toLowerCase().includes(q));
        return matchesTab && matchesQuery;
      });

      document.getElementById('badgeCount').textContent = 'Showing ' + filtered.length + ' of ' + BADGES.length + ' passes';

      const grid = document.getElementById('badgeGrid');
      grid.innerHTML = filtered.map(b => \`
        <div class="badge-card bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col gap-3 shadow-lg hover:border-slate-700 transition">
          <div class="flex items-center justify-between no-print text-xs font-mono">
            <span class="font-bold text-amber-400">\${b.credentialId}</span>
            <span class="text-slate-400 capitalize">\${b.category}</span>
          </div>
          <div class="rounded-xl overflow-hidden bg-slate-950 border border-white/5 shadow-inner">
            <img src="\${b.filename}" alt="\${b.name}" class="badge-preview w-full h-auto block" loading="lazy" />
          </div>
          <div class="flex items-center justify-between pt-1 no-print">
            <div class="truncate text-xs">
              <span class="font-bold text-white block truncate">\${b.name}</span>
              <span class="text-slate-400 text-[11px] block truncate">\${b.roleText || ''}</span>
            </div>
            <a
              href="\${b.filename}"
              download
              class="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg font-medium transition whitespace-nowrap ml-2"
            >
              Download SVG
            </a>
          </div>
        </div>
      \`).join('');
    }

    // Initial render
    filterBadges();
  </script>
</body>
</html>
`;

fs.writeFileSync(path.join(PASSES_DIR, 'index.html'), indexHtmlContent, 'utf8');
console.log('Generated passes/index.html');
console.log('PASS SUITE GENERATION COMPLETE!');
