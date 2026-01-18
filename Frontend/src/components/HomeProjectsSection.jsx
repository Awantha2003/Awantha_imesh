import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, FolderGit2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { apiGet, API_BASE_URL } from '../lib/api';

export function HomeProjectsSection() {
  const scrollRef = useRef(null);
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;
    const loadProjects = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await apiGet('/api/projects/public');
        if (!ignore) {
          setProjects(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (!ignore) {
          setError('Unable to load projects right now.');
          setProjects([]);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };
    loadProjects();
    return () => {
      ignore = true;
    };
  }, []);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 320;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const resolveImageUrl = (value) => {
    if (!value) {
      return '';
    }
    if (value.startsWith('/uploads')) {
      return `${API_BASE_URL}${value}`;
    }
    return value;
  };

  const handleOpenProject = (project) => {
    if (!project?.id) {
      return;
    }
    navigate(`/projects/${project.id}`, { state: { project } });
  };

  const canScroll = projects.length > 0;

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-[var(--app-text-strong)] font-semibold text-xl flex items-center gap-3">
          <FolderGit2 size={20} className="text-blue-400" /> See my Project
        </h3>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => scroll('left')}
            disabled={!canScroll}
            className="p-1.5 rounded-full bg-[var(--card-bg)] text-[var(--app-text-muted)] hover:text-[var(--app-text-strong)] hover:bg-[var(--card-hover)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={() => scroll('right')}
            disabled={!canScroll}
            className="p-1.5 rounded-full bg-[var(--card-bg)] text-[var(--app-text-muted)] hover:text-[var(--app-text-strong)] hover:bg-[var(--card-hover)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {projects.map((project, idx) => {
          const imageUrl = resolveImageUrl(project.imageUrl);
          const displayLabel = project.displayDate || project.category || 'Project';
          return (
            <motion.div
              key={project.id || idx}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.08 }}
              onClick={() => handleOpenProject(project)}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  handleOpenProject(project);
                }
              }}
              className="min-w-[300px] md:min-w-[350px] snap-start bg-[var(--card-bg)] rounded-xl overflow-hidden border border-[var(--card-border)] group cursor-pointer hover:border-[var(--app-text-subtle)] transition-all"
            >
              <div className="h-48 overflow-hidden relative">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={project.title || 'Project'}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="absolute inset-0 bg-[var(--card-muted)]" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-60" />
              </div>
              <div className="p-4">
                <h4 className="text-[var(--app-text-strong)] font-medium mb-2 line-clamp-2 group-hover:text-[var(--accent)] transition-colors">
                  {project.title || 'Project'}
                </h4>
                <div className="flex items-center justify-between text-xs text-[var(--app-text-subtle)]">
                  <span>{displayLabel}</span>
                  <ArrowRight size={14} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-[var(--accent)]" />
                </div>
              </div>
            </motion.div>
          );
        })}

        {loading && (
          <div className="min-w-[300px] md:min-w-[350px] snap-start rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-4 text-sm text-[var(--app-text-subtle)]">
            Loading projects...
          </div>
        )}
        {!loading && projects.length === 0 && (
          <div className="min-w-[300px] md:min-w-[350px] snap-start rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-4 text-sm text-[var(--app-text-subtle)]">
            {error || 'No projects yet.'}
          </div>
        )}
      </div>
    </div>
  );
}
