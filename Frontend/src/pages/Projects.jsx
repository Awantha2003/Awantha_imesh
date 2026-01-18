import React, { useEffect, useMemo, useState } from 'react';
import { Folder, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ProjectCard } from '../components/ProjectCard';
import { GithubRepoCard } from '../components/GithubRepoCard';
import { ContributionHeatmap } from '../components/ContributionHeatmap';
import { FeaturedSection } from '../components/FeaturedSection';
import { ContactSection } from '../components/ContactSection';
import { apiGet } from '../lib/api';
export function Projects() {
  const githubUsername = import.meta.env.VITE_GITHUB_USERNAME || 'Awantha2003';
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [githubRepos, setGithubRepos] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [githubLoading, setGithubLoading] = useState(false);
  const [githubError, setGithubError] = useState('');
  const [view, setView] = useState('portfolio');

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

  useEffect(() => {
    if (view !== 'github' || githubRepos.length > 0) {
      return;
    }
    let ignore = false;
    const loadGithubRepos = async () => {
      setGithubLoading(true);
      setGithubError('');
      try {
        const response = await fetch(`https://api.github.com/users/${githubUsername}/repos?per_page=100&sort=updated`);
        if (!response.ok) {
          throw new Error('Failed to load GitHub repos.');
        }
        const data = await response.json();
        if (ignore) {
          return;
        }
        const cleaned = Array.isArray(data) ? data.filter((repo) => !repo.fork) : [];
        setGithubRepos(cleaned);
      } catch (err) {
        if (!ignore) {
          setGithubError('Unable to load GitHub repositories.');
        }
      } finally {
        if (!ignore) {
          setGithubLoading(false);
        }
      }
    };
    loadGithubRepos();
    return () => {
      ignore = true;
    };
  }, [view, githubUsername, githubRepos.length]);


  const filteredProjects = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) {
      return projects;
    }
    return projects.filter((project) => project.title?.toLowerCase().includes(term));
  }, [projects, search]);

  const filteredGithubRepos = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) {
      return githubRepos;
    }
    return githubRepos.filter((repo) => {
      const name = repo.name?.toLowerCase() || '';
      const desc = repo.description?.toLowerCase() || '';
      return name.includes(term) || desc.includes(term);
    });
  }, [githubRepos, search]);

  return (
    <div className="max-w-6xl mx-auto">
      <ContributionHeatmap />

      <div className="flex flex-col md:flex-row justify-between items-end mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--app-text-strong)] mb-1 flex items-center gap-2"><Folder className="text-blue-500" /> Projects</h1>
          <p className="text-[var(--app-text-muted)] text-sm">A collection of my work and experiments.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch gap-3">
          <div className="flex items-center gap-1 rounded-full border border-[var(--card-border)] bg-[var(--card-bg)] p-1">
            <button
              type="button"
              onClick={() => setView('portfolio')}
              className={`px-4 py-1.5 rounded-full text-sm transition-all ${view === 'portfolio' ? 'bg-blue-600 text-white shadow-lg' : 'text-[var(--app-text-muted)] hover:text-[var(--app-text-strong)]'}`}
            >
              Projects
            </button>
            <button
              type="button"
              onClick={() => setView('github')}
              className={`px-4 py-1.5 rounded-full text-sm transition-all ${view === 'github' ? 'bg-blue-600 text-white shadow-lg' : 'text-[var(--app-text-muted)] hover:text-[var(--app-text-strong)]'}`}
            >
              GitHub
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--app-text-subtle)]" size={16} />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={view === 'github' ? 'Search GitHub repositories...' : 'Search projects...'}
              className="bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--app-text-strong)] text-sm pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:border-blue-500 w-64"
            />
          </div>
        </div>
      </div>

      {view === 'portfolio' ? (
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
              onClick={() => navigate(`/projects/${project.id}`, { state: { project } })}
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
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {filteredGithubRepos.map((repo) => (
            <GithubRepoCard
              key={repo.id}
              name={repo.name}
              description={repo.description}
              htmlUrl={repo.html_url}
              language={repo.language}
              stars={repo.stargazers_count}
              forks={repo.forks_count}
              updatedAt={repo.updated_at}
              to={`/projects/github/${repo.name}`}
            />
          ))}
          {!githubLoading && filteredGithubRepos.length === 0 && (
            <div className="col-span-full rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] p-6 text-sm text-[var(--app-text-muted)]">
              {githubError || 'No GitHub repositories found.'}
            </div>
          )}
          {githubLoading && (
            <div className="col-span-full rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] p-6 text-sm text-[var(--app-text-muted)]">
              Loading GitHub repositories...
            </div>
          )}
        </div>
      )}

      <FeaturedSection />
      <ContactSection />
    </div>
  );
}
