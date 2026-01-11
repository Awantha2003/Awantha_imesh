import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';

export function ContributionHeatmap() {
  const githubUsername = import.meta.env.VITE_GITHUB_USERNAME || 'Awantha2003';
  const [year, setYear] = useState(null);
  const [years, setYears] = useState([]);
  const [allContributions, setAllContributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;
    const loadContributions = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await fetch(`https://github-contributions-api.jogruber.de/v4/${githubUsername}`);
        if (!response.ok) {
          throw new Error('Failed to load contributions.');
        }
        const data = await response.json();
        if (ignore) {
          return;
        }
        const availableYears = Object.keys(data.total || {})
          .map((value) => Number(value))
          .filter((value) => !Number.isNaN(value))
          .sort((a, b) => b - a);

        setYears(availableYears);
        setAllContributions(Array.isArray(data.contributions) ? data.contributions : []);
        setYear((prev) => prev ?? (availableYears.length > 0 ? availableYears[0] : new Date().getFullYear()));
      } catch (err) {
        if (!ignore) {
          setError('Unable to load GitHub contributions.');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadContributions();
    return () => {
      ignore = true;
    };
  }, [githubUsername]);

  const contributions = useMemo(() => {
    if (!year) {
      return [];
    }
    const yearPrefix = `${year}-`;
    const filtered = allContributions
      .filter((item) => item.date && item.date.startsWith(yearPrefix))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    if (filtered.length === 0) {
      return [];
    }

    const startDay = new Date(`${year}-01-01T00:00:00`).getDay();
    const padded = Array.from({ length: startDay }, () => null).concat(filtered);
    const remainder = padded.length % 7;
    if (remainder !== 0) {
      padded.push(...Array.from({ length: 7 - remainder }, () => null));
    }
    return padded;
  }, [allContributions, year]);

  const getColor = (level) => {
    switch (level) {
      case 1:
        return 'bg-green-900';
      case 2:
        return 'bg-green-700';
      case 3:
        return 'bg-green-500';
      case 4:
        return 'bg-green-400';
      default:
        return 'bg-[var(--chip-bg)]';
    }
  };

  const yearButtons = years.length > 0 ? years : [new Date().getFullYear()];

  return (
    <div className="bg-[var(--card-bg)] p-6 rounded-2xl border border-[var(--card-border)] mb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h3 className="text-[var(--app-text-strong)] font-semibold text-lg flex items-center">
          <span className="mr-2">⚡</span> Contributions
        </h3>

        <div className="flex bg-[var(--card-muted)] rounded-lg p-1">
          {yearButtons.map((y) => (
            <button
              key={y}
              onClick={() => setYear(y)}
              className={`px-4 py-1.5 rounded-md text-sm transition-all ${year === y ? 'bg-blue-600 text-white shadow-lg' : 'text-[var(--app-text-muted)] hover:text-[var(--app-text-strong)]'}`}
            >
              {y}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto pb-2">
        <div className="min-w-[700px]">
          <div className="flex text-xs text-[var(--app-text-subtle)] mb-2 justify-between px-2">
            <span>Jan</span>
            <span>Feb</span>
            <span>Mar</span>
            <span>Apr</span>
            <span>May</span>
            <span>Jun</span>
            <span>Jul</span>
            <span>Aug</span>
            <span>Sep</span>
            <span>Oct</span>
            <span>Nov</span>
            <span>Dec</span>
          </div>

          {loading && (
            <div className="text-xs text-[var(--app-text-muted)] mb-4">Loading contributions...</div>
          )}
          {!loading && error && (
            <div className="text-xs text-[var(--app-text-muted)] mb-4">{error}</div>
          )}
          {!loading && !error && contributions.length === 0 && (
            <div className="text-xs text-[var(--app-text-muted)] mb-4">No contribution data available.</div>
          )}

          <div className="grid grid-rows-7 grid-flow-col gap-1 h-[140px]">
            {contributions.map((entry, i) => {
              const level = entry ? entry.level : 0;
              const count = entry ? entry.count : 0;
              const date = entry ? entry.date : '';
              return (
                <motion.div
                  key={`${date || 'pad'}-${i}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.001 }}
                  className={`w-3 h-3 rounded-sm ${getColor(level)}`}
                  title={date ? `${count} contributions on ${date}` : ''}
                />
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end mt-4 text-xs text-[var(--app-text-muted)] gap-2">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded-sm bg-[var(--chip-bg)]"></div>
          <div className="w-3 h-3 rounded-sm bg-green-900"></div>
          <div className="w-3 h-3 rounded-sm bg-green-700"></div>
          <div className="w-3 h-3 rounded-sm bg-green-500"></div>
          <div className="w-3 h-3 rounded-sm bg-green-400"></div>
        </div>
        <span>More</span>
      </div>
    </div>
  );
}
