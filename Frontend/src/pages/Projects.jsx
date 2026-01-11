import React, { useEffect, useMemo, useState } from 'react';
import { Folder, Search } from 'lucide-react';
import { ProjectCard } from '../components/ProjectCard';
import { ContributionHeatmap } from '../components/ContributionHeatmap';
import { FeaturedSection } from '../components/FeaturedSection';
import { ContactSection } from '../components/ContactSection';
import { apiGet, API_BASE_URL } from '../lib/api';
import { motion } from 'framer-motion';
export function Projects() {
  const COUNTRY_FLAGS = {
    'Sri Lanka': '🇱🇰',
    India: '🇮🇳',
    'United States': '🇺🇸',
    'United Kingdom': '🇬🇧',
    Australia: '🇦🇺',
    Canada: '🇨🇦',
    Germany: '🇩🇪',
    Singapore: '🇸🇬',
    'United Arab Emirates': '🇦🇪',
    Other: '🏳️'
  };
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    const loadProjects = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await apiGet('/api/projects/public');
        setProjects(Array.isArray(data) ? data : []);
      } catch (err) {
        setError('Unable to load projects right now.');
      } finally {
        setLoading(false);
      }
    };
    loadProjects();
  }, []);

  const filteredProjects = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) {
      return projects;
    }
    return projects.filter((project) => project.title?.toLowerCase().includes(term));
  }, [projects, search]);
  return (
    <div className="max-w-6xl mx-auto">
      <ContributionHeatmap />

      <div className="flex flex-col md:flex-row justify-between items-end mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--app-text-strong)] mb-1 flex items-center gap-2"><Folder className="text-blue-500" /> Projects</h1>
          <p className="text-[var(--app-text-muted)] text-sm">A collection of my work and experiments.</p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--app-text-subtle)]" size={16} />
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search projects..."
            className="bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--app-text-strong)] text-sm pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:border-blue-500 w-64"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {filteredProjects.map((project, i) => (
          <ProjectCard
            key={project.id || i}
            title={project.title}
            description={project.description}
            isPublic={project.isPublic}
            date={project.displayDate}
            imageUrl={project.imageUrl}
            category={project.category}
            country={project.country}
            onClick={() => setSelectedProject(project)}
            delay={i * 0.05}
          />
        ))}
        {!loading && filteredProjects.length === 0 && (
          <div className="col-span-full rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] p-6 text-sm text-[var(--app-text-muted)]">
            {error || 'No projects found.'}
          </div>
        )}
        {loading && (
          <div className="col-span-full rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] p-6 text-sm text-[var(--app-text-muted)]">
            Loading projects...
          </div>
        )}
      </div>

      <div className="flex justify-center mb-12">
        <button className="text-blue-400 text-sm hover:text-blue-300 font-medium">Load More (23 more projects)</button>
      </div>

      <FeaturedSection />
      <ContactSection />

      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="relative w-full max-w-3xl rounded-3xl border border-[var(--card-border)] bg-[var(--card-bg)] p-6 md:p-8">
            <button
              type="button"
              onClick={() => setSelectedProject(null)}
              className="absolute right-4 top-4 rounded-full border border-[var(--button-border)] bg-[var(--button-bg)] px-3 py-1 text-xs text-[var(--app-text-strong)]"
            >
              Close
            </button>

            {selectedProject.imageUrl && (
              <div className="mb-6 overflow-hidden rounded-2xl border border-[var(--card-border)]">
                <img
                  src={selectedProject.imageUrl.startsWith('/uploads') ? `${API_BASE_URL}${selectedProject.imageUrl}` : selectedProject.imageUrl}
                  alt={selectedProject.title}
                  className="h-56 w-full object-cover"
                />
              </div>
            )}

            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-[var(--app-text-strong)]">{selectedProject.title}</h2>
                {selectedProject.country && (
                  <span className="text-2xl" title={selectedProject.country}>
                    {COUNTRY_FLAGS[selectedProject.country] || ''}
                  </span>
                )}
              </div>
              <span className={`text-xs px-2 py-1 rounded-full border ${selectedProject.isPublic ? 'border-green-500/30 text-green-400 bg-green-500/10' : 'border-[var(--card-border)] text-[var(--app-text-muted)] bg-[var(--card-muted)]'}`}>
                {selectedProject.isPublic ? 'Public' : 'Private'}
              </span>
            </div>

            <p className="mt-2 text-sm text-[var(--app-text-muted)]">{selectedProject.displayDate}</p>

            {selectedProject.description && (
              <p className="mt-4 text-sm text-[var(--app-text)] leading-relaxed">{selectedProject.description}</p>
            )}

            <div className="mt-4 space-y-2 text-xs text-[var(--app-text-subtle)]">
              {selectedProject.category && <div>Category: {selectedProject.category}</div>}
              {selectedProject.category === 'Client Project' && selectedProject.country && (
                <div>Country: {selectedProject.country}</div>
              )}
              {selectedProject.techStack && <div>Tech Stack: {selectedProject.techStack}</div>}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              {selectedProject.liveUrl && (
                <a
                  href={selectedProject.liveUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-[var(--button-border)] bg-[var(--button-bg)] px-4 py-2 text-sm text-[var(--app-text-strong)] hover:bg-[var(--card-hover)]"
                >
                  Live Demo
                </a>
              )}
              {selectedProject.githubUrl && (
                <a
                  href={selectedProject.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-[var(--button-border)] bg-[var(--button-bg)] px-4 py-2 text-sm text-[var(--app-text-strong)] hover:bg-[var(--card-hover)]"
                >
                  GitHub
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
