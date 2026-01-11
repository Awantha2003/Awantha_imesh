import React from 'react';
import { Star, GitFork, ExternalLink, Clock, Code2 } from 'lucide-react';

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

export function GithubRepoCard({ name, description, htmlUrl, language, stars, forks, updatedAt }) {
  return (
    <a
      href={htmlUrl}
      target="_blank"
      rel="noreferrer"
      className="group block"
      title={name}
    >
      <div className="bg-[var(--card-bg)] p-5 rounded-xl border border-[var(--card-border)] hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 transition-all">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-[var(--app-text-strong)] font-semibold text-lg group-hover:text-[var(--accent)] transition-colors">
            {name}
          </h3>
          <ExternalLink size={16} className="text-[var(--app-text-subtle)] group-hover:text-[var(--accent)]" />
        </div>

        {description && (
          <p className="text-[var(--app-text-muted)] text-sm mb-4 line-clamp-2">{description}</p>
        )}

        <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--app-text-subtle)]">
          {language && (
            <span className="inline-flex items-center gap-1 rounded-full border border-[var(--card-border)] bg-[var(--card-muted)] px-2 py-1">
              <Code2 size={12} />
              {language}
            </span>
          )}
          <span className="inline-flex items-center gap-1">
            <Star size={12} />
            {stars}
          </span>
          <span className="inline-flex items-center gap-1">
            <GitFork size={12} />
            {forks}
          </span>
          {updatedAt && (
            <span className="inline-flex items-center gap-1">
              <Clock size={12} />
              Updated {formatDate(updatedAt)}
            </span>
          )}
        </div>
      </div>
    </a>
  );
}
