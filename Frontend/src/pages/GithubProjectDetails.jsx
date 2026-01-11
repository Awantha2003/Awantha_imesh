import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  ExternalLink,
  GitFork,
  Globe,
  Lock,
  Star,
  Eye,
  Tag,
  Code2
} from 'lucide-react';
import { ContributionHeatmap } from '../components/ContributionHeatmap';
import { GithubRepoCard } from '../components/GithubRepoCard';

const GITHUB_API = 'https://api.github.com';

function formatDate(value) {
  if (!value) {
    return '';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export function GithubProjectDetails() {
  const { repo } = useParams();
  const githubUsername = import.meta.env.VITE_GITHUB_USERNAME || 'Awantha2003';
  const [repoData, setRepoData] = useState(null);
  const [languages, setLanguages] = useState([]);
  const [otherRepos, setOtherRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!repo) {
      setError('Repository not found.');
      setLoading(false);
      return;
    }

    let ignore = false;
    const loadRepo = async () => {
      setLoading(true);
      setError('');
      try {
        const repoResponse = await fetch(`${GITHUB_API}/repos/${githubUsername}/${repo}`, {
          headers: { Accept: 'application/vnd.github+json' }
        });
        if (!repoResponse.ok) {
          throw new Error('Unable to load repository.');
        }
        const repoJson = await repoResponse.json();

        const [languageResponse, reposResponse] = await Promise.all([
          fetch(`${GITHUB_API}/repos/${githubUsername}/${repo}/languages`, {
            headers: { Accept: 'application/vnd.github+json' }
          }),
          fetch(`${GITHUB_API}/users/${githubUsername}/repos?per_page=6&sort=updated`, {
            headers: { Accept: 'application/vnd.github+json' }
          })
        ]);

        const languageJson = languageResponse.ok ? await languageResponse.json() : {};
        const reposJson = reposResponse.ok ? await reposResponse.json() : [];

        if (ignore) {
          return;
        }

        setRepoData(repoJson);
        setLanguages(Object.entries(languageJson).sort((a, b) => b[1] - a[1]).map(([name]) => name));
        const cleaned = Array.isArray(reposJson) ? reposJson.filter((item) => !item.fork && item.name !== repo) : [];
        setOtherRepos(cleaned);
      } catch (err) {
        if (!ignore) {
          setError('Unable to load GitHub project details.');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadRepo();
    return () => {
      ignore = true;
    };
  }, [repo, githubUsername]);

  const ogImage = useMemo(() => {
    if (!repoData) {
      return '';
    }
    const owner = repoData.owner?.login || githubUsername;
    return `https://opengraph.githubassets.com/1/${owner}/${repoData.name}`;
  }, [repoData, githubUsername]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="rounded-3xl border border-[var(--card-border)] bg-[var(--card-bg)] p-6 text-sm text-[var(--app-text-muted)]">
          Loading GitHub project details...
        </div>
      </div>
    );
  }

  if (error || !repoData) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="rounded-3xl border border-[var(--card-border)] bg-[var(--card-bg)] p-6 text-sm text-[var(--app-text-muted)]">
          {error || 'Project not found.'}
        </div>
      </div>
    );
  }

  const isPublic = !repoData.private;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <section className="rounded-3xl border border-[var(--card-border)] bg-[var(--card-bg)] p-6 md:p-8">
          <Link
            to="/projects"
            className="inline-flex items-center gap-2 text-sm text-[var(--app-text-muted)] hover:text-[var(--app-text-strong)]"
          >
            <ArrowLeft size={16} />
            Back to Projects
          </Link>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold text-[var(--app-text-strong)]">{repoData.name}</h1>
            <span className={`text-xs px-2 py-1 rounded-full border ${isPublic ? 'border-green-500/30 text-green-400 bg-green-500/10' : 'border-[var(--card-border)] text-[var(--app-text-muted)] bg-[var(--card-muted)]'}`}>
              {isPublic ? 'Public' : 'Private'}
            </span>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-[var(--app-text-subtle)]">
            <span className="inline-flex items-center gap-1">
              <Calendar size={12} />
              Updated {formatDate(repoData.updated_at)}
            </span>
            <span className="inline-flex items-center gap-1">
              <Star size={12} />
              {repoData.stargazers_count} stars
            </span>
            <span className="inline-flex items-center gap-1">
              <GitFork size={12} />
              {repoData.forks_count} forks
            </span>
            <span className="inline-flex items-center gap-1">
              <Eye size={12} />
              {repoData.subscribers_count} watchers
            </span>
          </div>

          {ogImage && (
            <div className="mt-6 overflow-hidden rounded-2xl border border-[var(--card-border)]">
              <img src={ogImage} alt={repoData.name} className="h-64 w-full object-cover" />
            </div>
          )}

          <div className="mt-6">
            <h2 className="text-lg font-semibold text-[var(--app-text-strong)] mb-2">About This Project</h2>
            <p className="text-sm text-[var(--app-text-muted)] leading-relaxed">
              {repoData.description || 'No description provided for this repository yet.'}
            </p>
          </div>

          <div className="mt-6">
            <h3 className="text-sm font-semibold text-[var(--app-text-strong)] mb-2 flex items-center gap-2">
              <Code2 size={14} />
              Technologies Used
            </h3>
            <div className="flex flex-wrap gap-2">
              {languages.length > 0 ? (
                languages.map((lang) => (
                  <span key={lang} className="text-xs px-3 py-1 rounded-full border border-[var(--card-border)] bg-[var(--card-muted)] text-[var(--app-text)]">
                    {lang}
                  </span>
                ))
              ) : (
                <span className="text-xs text-[var(--app-text-subtle)]">No language data available.</span>
              )}
            </div>
          </div>

          {repoData.topics?.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-[var(--app-text-strong)] mb-2 flex items-center gap-2">
                <Tag size={14} />
                Topics
              </h3>
              <div className="flex flex-wrap gap-2">
                {repoData.topics.map((topic) => (
                  <span key={topic} className="text-xs px-3 py-1 rounded-full border border-[var(--card-border)] bg-[var(--card-muted)] text-[var(--app-text)]">
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-muted)] p-4">
              <div className="text-xs text-[var(--app-text-subtle)]">License</div>
              <div className="text-sm text-[var(--app-text-strong)]">
                {repoData.license?.name || 'No license'}
              </div>
            </div>
            <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-muted)] p-4">
              <div className="text-xs text-[var(--app-text-subtle)]">Default Branch</div>
              <div className="text-sm text-[var(--app-text-strong)]">{repoData.default_branch}</div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={repoData.html_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--button-border)] bg-[var(--button-bg)] px-4 py-2 text-sm text-[var(--app-text-strong)] hover:bg-[var(--card-hover)]"
            >
              <ExternalLink size={16} />
              View Code
            </a>
            {repoData.homepage && (
              <a
                href={repoData.homepage}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-[var(--button-border)] bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-500"
              >
                <Globe size={16} />
                Live Demo
              </a>
            )}
          </div>
        </section>

        <aside className="space-y-6">
          <ContributionHeatmap />

          <div className="rounded-3xl border border-[var(--card-border)] bg-[var(--card-bg)] p-6">
            <h3 className="text-[var(--app-text-strong)] font-semibold mb-4 flex items-center gap-2">
              {isPublic ? <Globe size={16} /> : <Lock size={16} />}
              Other Repositories
            </h3>
            <div className="space-y-3">
              {otherRepos.length > 0 ? (
                otherRepos.slice(0, 4).map((item) => (
                  <GithubRepoCard
                    key={item.id}
                    name={item.name}
                    description={item.description}
                    htmlUrl={item.html_url}
                    language={item.language}
                    stars={item.stargazers_count}
                    forks={item.forks_count}
                    updatedAt={item.updated_at}
                    to={`/projects/github/${item.name}`}
                  />
                ))
              ) : (
                <div className="text-xs text-[var(--app-text-subtle)]">No other repositories to show.</div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
