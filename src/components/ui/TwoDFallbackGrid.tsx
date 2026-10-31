'use client';

import { useState, useMemo } from 'react';
import { useExhibitionStore } from '@/store/useExhibitionStore';
import { CategoryType } from '@/types';
import {
  Search,
  ThumbsUp,
  ArrowRight,
  CheckCircle2,
  Users,
} from 'lucide-react';

const CATEGORIES: { label: string; value: CategoryType | 'All' }[] = [
  { label: 'All Projects', value: 'All' },
  { label: 'Physical (P01-P12)', value: 'Physical' },
  { label: 'Digital (D01-D12)', value: 'Digital' },
  { label: 'Business (B01-B07)', value: 'Business' },
  { label: 'Show & Tell (ST01-ST08)', value: 'Show & Tell' },
  { label: 'Robo Race', value: 'Robo Race' },
  { label: 'Robo Soccer', value: 'Robo Soccer' },
];

export default function TwoDFallbackGrid() {
  const projects = useExhibitionStore((state) => state.projects);
  const selectProject = useExhibitionStore((state) => state.selectProject);
  const votedProjectIds = useExhibitionStore((state) => state.votedProjectIds);
  const theme = useExhibitionStore((state) => state.theme);
  const isLight = theme === 'light';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | 'All'>('All');

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesCategory =
        selectedCategory === 'All' || project.category === selectedCategory;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        project.title.toLowerCase().includes(q) ||
        project.booth_code.toLowerCase().includes(q) ||
        project.description.toLowerCase().includes(q) ||
        project.members.some((m) => m.toLowerCase().includes(q)) ||
        (project.tech_stack && project.tech_stack.some((t) => t.toLowerCase().includes(q))) ||
        project.booth_number.toString().includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [projects, selectedCategory, searchQuery]);

  return (
    <div className={`w-full min-h-screen transition-colors duration-300 pt-20 pb-36 pb-safe px-3 sm:px-6 lg:px-8 ${
      isLight ? 'bg-[#f8fafc] text-slate-900' : 'bg-[#070b14] text-slate-100'
    }`}>
      <div className="max-w-7xl mx-auto space-y-5">
        
        {/* Banner Section */}
        <div className={`p-5 sm:p-7 rounded-3xl border shadow-2xl relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
          isLight
            ? 'bg-gradient-to-br from-white via-slate-50 to-amber-50/50 border-slate-200'
            : 'bg-gradient-to-br from-[#111827] via-[#090d16] to-amber-950/20 border-slate-800'
        }`}>
          <div className="relative z-10 max-w-3xl space-y-1.5">
            <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-300 border border-amber-500/30">
              OFFICIAL FLOOR PLAN DIRECTORY
            </span>
            <h2 className={`text-xl sm:text-2xl md:text-3xl font-black tracking-tight ${
              isLight ? 'text-slate-900' : 'text-white'
            }`}>
              DPS Indirapuram Tech & Innovation Exhibition
            </h2>
            <p className={`text-xs sm:text-sm leading-relaxed font-sans ${
              isLight ? 'text-slate-600' : 'text-slate-400'
            }`}>
              Browse student innovations across the official blueprint aisles: <strong>P (Physical)</strong>, <strong>D (Digital)</strong>, and <strong>B (Business)</strong>. Cast your verified vote for your favorite project.
            </p>
          </div>
          <div className="relative z-10 shrink-0 flex items-center justify-center px-3 py-2 rounded-2xl bg-white border border-slate-200 shadow-xl max-w-[260px] self-start sm:self-auto">
            <img src="/dps_shield.png" alt="DPS Indirapuram Emblem" className="h-10 w-auto object-contain block sm:hidden" />
            <img src="/dps_indirapuram_logo.png" alt="DPS Indirapuram" className="h-10 sm:h-11 w-auto object-contain hidden sm:block" />
          </div>
        </div>

        {/* Search Bar & Category Filters */}
        <div className={`flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between sticky top-16 z-30 backdrop-blur-md py-2 ${
          isLight ? 'bg-[#f8fafc]/95' : 'bg-[#070b14]/95'
        }`}>
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by booth code (e.g. P01, D05, B02), title, student..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-2.5 rounded-2xl border text-xs sm:text-sm outline-none transition-all shadow-inner font-sans ${
                isLight
                  ? 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-amber-500'
                  : 'bg-slate-900 border-slate-800 text-white placeholder-slate-500 focus:border-amber-500'
              }`}
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat.value;
              return (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    active
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                      : isLight
                        ? 'bg-white text-slate-600 hover:text-slate-950 border border-slate-200'
                        : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredProjects.map((project) => {
            const hasVoted = votedProjectIds.includes(project.id);

            return (
              <div
                key={project.id}
                onClick={() => selectProject(project)}
                className={`group relative rounded-2xl border transition-all duration-300 overflow-hidden flex flex-col shadow-xl cursor-pointer ${
                  isLight
                    ? 'bg-white border-slate-200 hover:border-amber-500/60 hover:shadow-2xl'
                    : 'bg-[#0b101c] border-slate-800 hover:border-amber-500/50 hover:bg-[#0f1422]'
                }`}
              >
                {/* Image Banner */}
                <div className="relative w-full h-40 sm:h-44 overflow-hidden bg-slate-950">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={project.image_url}
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${
                    isLight ? 'from-white/90' : 'from-[#0b101c]'
                  } via-transparent to-transparent opacity-90`} />
                  
                  {/* Badges */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded-md bg-slate-950/90 border border-slate-700 text-amber-300 backdrop-blur-md">
                      {project.booth_code}
                    </span>
                    <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-900/90 text-slate-300 border border-slate-700 backdrop-blur-md">
                      {project.category}
                    </span>
                  </div>

                  {/* Voted badge */}
                  {hasVoted && (
                    <div className="absolute top-2.5 right-2.5 flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 backdrop-blur-md">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>Voted</span>
                    </div>
                  )}
                </div>

                {/* Card Body */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className={`text-sm sm:text-base font-extrabold group-hover:text-amber-500 transition-colors line-clamp-1 ${
                      isLight ? 'text-slate-900' : 'text-white'
                    }`}>
                      {project.title}
                    </h3>
                    <p className={`text-xs line-clamp-2 mt-1 font-sans ${
                      isLight ? 'text-slate-600' : 'text-slate-400'
                    }`}>
                      {project.description}
                    </p>
                  </div>

                  {/* Team */}
                  <div className={`flex items-center gap-1.5 text-xs ${
                    isLight ? 'text-slate-600' : 'text-slate-400'
                  }`}>
                    <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{project.members.join(', ')}</span>
                  </div>

                  {/* Footer */}
                  <div className={`pt-2.5 border-t flex items-center justify-between ${
                    isLight ? 'border-slate-100' : 'border-slate-800/80'
                  }`}>
                    <div className="flex items-center gap-1.5">
                      <ThumbsUp className={`w-3.5 h-3.5 ${hasVoted ? 'text-amber-500 fill-amber-500' : 'text-slate-400'}`} />
                      <span className={`text-xs font-bold font-mono ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        {project.vote_count}
                      </span>
                      <span className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>votes</span>
                    </div>

                    <button className="flex items-center gap-1 text-xs font-bold text-amber-500 group-hover:translate-x-1 transition-transform font-mono">
                      <span>Inspect</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 mb-4 text-center text-[10px] font-mono text-slate-400 dark:text-slate-500">
          Co-Engineered by Ojas Singh dpsi&apos;&apos;30
        </div>
      </div>
    </div>
  );
}
