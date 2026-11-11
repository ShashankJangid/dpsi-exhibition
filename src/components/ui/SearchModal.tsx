'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useExhibitionStore } from '@/store/useExhibitionStore';
import { Project } from '@/types';
import { playBlip, playClick } from '@/lib/sound';
import { Search, X, MapPin, Users, Sparkles, ArrowRight, Tag } from 'lucide-react';

export default function SearchModal() {
  const isSearchOpen = useExhibitionStore((state) => state.isSearchOpen);
  const setSearchOpen = useExhibitionStore((state) => state.setSearchOpen);
  const projects = useExhibitionStore((state) => state.projects);
  const selectProject = useExhibitionStore((state) => state.selectProject);
  const setViewMode = useExhibitionStore((state) => state.setViewMode);

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClose = useCallback(() => {
    setQuery('');
    setSearchOpen(false);
  }, [setSearchOpen]);

  // Keyboard shortcut listener (Cmd+K / Ctrl+K / slash)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(!isSearchOpen);
      } else if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault();
        setSearchOpen(true);
      } else if (e.key === 'Escape' && isSearchOpen) {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, setSearchOpen, handleClose]);

  // Auto focus input on modal open
  useEffect(() => {
    if (isSearchOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
        setSelectedIndex(0);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isSearchOpen]);

  // Filter projects by title, booth code, student name, category, or description
  const filteredProjects = useMemo(() => {
    if (!query.trim()) {
      return projects.slice(0, 10);
    }
    const q = query.toLowerCase().trim();
    return projects.filter((p) => {
      const matchTitle = p.title.toLowerCase().includes(q);
      const matchCode = p.booth_code.toLowerCase().includes(q);
      const matchCategory = p.category.toLowerCase().includes(q);
      const matchDesc = p.description.toLowerCase().includes(q);
      const matchStudents = p.members.some((m) => m.toLowerCase().includes(q));
      return matchTitle || matchCode || matchCategory || matchDesc || matchStudents;
    });
  }, [projects, query]);

  // Arrow key navigation through search results
  const handleKeyNavigation = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredProjects.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev === 0 ? Math.max(0, filteredProjects.length - 1) : prev - 1
      );
    } else if (e.key === 'Enter' && filteredProjects[selectedIndex]) {
      e.preventDefault();
      handleSelect(filteredProjects[selectedIndex]);
    }
  };

  const handleSelect = (project: Project) => {
    playClick();
    setViewMode('3d');
    selectProject(project);
    handleClose();
  };

  if (!isSearchOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-950/50 dark:bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      {/* Backdrop tap to close */}
      <div
        className="fixed inset-0"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Search Palette Container */}
      <div className="relative w-full max-w-2xl bg-[#f8fafc]/98 dark:bg-[#090e1a]/95 border border-slate-300/90 dark:border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[82vh] backdrop-blur-2xl">
        {/* Input Bar */}
        <div className="relative flex items-center px-4 py-3.5 border-b border-slate-200/90 dark:border-slate-800/80 gap-3">
          <Search className="w-5 h-5 text-amber-500 dark:text-amber-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyNavigation}
            placeholder="Search booths, student names, project codes (e.g. P04, Aarav)..."
            className="w-full bg-transparent text-sm sm:text-base text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none"
          />
          {query ? (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/60"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-[10px] font-mono font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 rounded border border-slate-300 dark:border-slate-700">
              ESC
            </kbd>
          )}
        </div>

        {/* Quick Filter Tag Chips */}
        <div className="flex items-center gap-1.5 px-4 py-2 bg-slate-100/60 dark:bg-slate-900/60 border-b border-slate-200/80 dark:border-slate-800/60 overflow-x-auto no-scrollbar shrink-0">
          <Tag className="w-3 h-3 text-amber-500 shrink-0 mr-0.5" />
          {['Physical', 'Digital', 'Business', 'Robotics', 'Show & Tell', 'AI', 'IoT', 'Clean Energy'].map((tag) => (
            <button
              key={tag}
              onClick={() => {
                playBlip(700);
                setQuery(tag);
              }}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold whitespace-nowrap transition-all ${
                query.toLowerCase() === tag.toLowerCase()
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'bg-white/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200/90 dark:border-slate-700/80'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="overflow-y-auto divide-y divide-slate-200/80 dark:divide-slate-800/50 p-2 space-y-1">
          {filteredProjects.length === 0 ? (
            <div className="py-12 text-center text-slate-500 dark:text-slate-400">
              <Sparkles className="w-8 h-8 text-slate-400 dark:text-slate-600 mx-auto mb-2 opacity-60" />
              <p className="text-sm font-medium">No exhibition projects matched &quot;{query}&quot;</p>
              <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">Try searching by student name, code (P01-P12, D01-D12), or topic</p>
            </div>
          ) : (
            filteredProjects.map((project, idx) => {
              const isSelected = idx === selectedIndex;
              const isPhysical = project.category === 'Physical';
              const isDigital = project.category === 'Digital';
              const isBusiness = project.category === 'Business';
              const isShowAndTell = project.category === 'Show & Tell';

              return (
                <div
                  key={project.id}
                  onClick={() => handleSelect(project)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-amber-500/15 border border-amber-500/40 text-slate-900 dark:text-white'
                      : 'hover:bg-slate-100/80 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    {/* Booth Code Badge */}
                    <span
                      className={`shrink-0 px-2.5 py-1 rounded-lg text-xs font-mono font-bold border ${
                        isPhysical
                          ? 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-400 border-emerald-500/30'
                          : isDigital
                          ? 'bg-cyan-500/15 text-cyan-800 dark:text-cyan-400 border-cyan-500/30'
                          : isBusiness
                          ? 'bg-amber-500/15 text-amber-800 dark:text-amber-400 border-amber-500/30'
                          : isShowAndTell
                          ? 'bg-purple-500/15 text-purple-800 dark:text-purple-400 border-purple-500/30'
                          : 'bg-rose-500/15 text-rose-800 dark:text-rose-400 border-rose-500/30'
                      }`}
                    >
                      {project.booth_code}
                    </span>

                    {/* Details */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                          {project.title}
                        </h4>
                        <span className="hidden sm:inline-block text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                          • {project.category}
                        </span>
                      </div>
                      
                      {/* Student members */}
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate flex items-center gap-1.5 mt-0.5">
                        <Users className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{project.members.join(', ')}</span>
                      </p>
                    </div>
                  </div>

                  {/* Fly-to indicator */}
                  <div className="flex items-center gap-2 shrink-0 pl-3">
                    <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-amber-500 dark:text-amber-400" />
                      <span>{project.vote_count} votes</span>
                    </span>
                    <ArrowRight className={`w-4 h-4 transition-transform ${isSelected ? 'text-amber-500 dark:text-amber-400 translate-x-0.5' : 'text-slate-400 dark:text-slate-600'}`} />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-950/80 border-t border-slate-200/90 dark:border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Jump to Booth in 3D</span>
          </div>
          <span>{projects.length} Innovation Projects</span>
        </div>
      </div>
    </div>
  );
}
