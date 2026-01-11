import React from 'react';
import { Calendar, Lock, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import { API_BASE_URL } from '../lib/api';
import { getCountryFlagUrl } from '../lib/countries';

export function ProjectCard({
  title,
  description,
  isPublic,
  date,
  imageUrl,
  category,
  country,
  onClick,
  delay = 0
}) {
  const cardImage = imageUrl
    ? (imageUrl.startsWith('/uploads') ? `${API_BASE_URL}${imageUrl}` : imageUrl)
    : null;
  const flagUrl = country ? getCountryFlagUrl(country) : '';
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay }}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                onClick();
              }
            }
          : undefined
      }
      className="bg-[var(--card-bg)] p-5 rounded-xl border border-[var(--card-border)] hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 transition-all cursor-pointer group flex flex-col"
    >
      {cardImage && (
        <div className="mb-4 overflow-hidden rounded-lg border border-[var(--card-border)]">
          <img
            src={cardImage}
            alt={title}
            className="h-40 w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      )}
      <div className="flex justify-between items-start mb-3">
        <div className="p-2 bg-[var(--chip-bg)] rounded-lg text-blue-400 group-hover:text-blue-300 transition-colors">
          {isPublic ? <Globe size={20} /> : <Lock size={20} />}
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          {category && (
            <span className="text-xs px-2 py-1 rounded-full border border-[var(--card-border)] text-[var(--app-text-muted)] bg-[var(--card-muted)]">
              {category}
            </span>
          )}
          <span className={`text-xs px-2 py-1 rounded-full border ${isPublic ? 'border-green-500/30 text-green-400 bg-green-500/10' : 'border-[var(--card-border)] text-[var(--app-text-muted)] bg-[var(--card-muted)]'}`}>
            {isPublic ? 'Public' : 'Private'}
          </span>
        </div>
      </div>

      <div className="flex items-start justify-between gap-2">
        <h3 className="text-[var(--app-text-strong)] font-semibold text-lg mb-1 group-hover:text-[var(--accent)] transition-colors">
          {title}
        </h3>
        {flagUrl && (
          <img
            src={flagUrl}
            alt={country}
            title={country}
            className="h-5 w-8 rounded-sm border border-[var(--card-border)] object-cover"
          />
        )}
      </div>
      {description && <p className="text-[var(--app-text-muted)] text-sm mb-4 line-clamp-2">{description}</p>}

      <div className="flex items-center text-[var(--app-text-subtle)] text-xs mt-auto">
        <Calendar size={12} className="mr-1.5" />
        <span>Created on {date}</span>
      </div>
    </motion.div>
  );
}
