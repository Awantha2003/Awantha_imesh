import React, { useState } from 'react';
import { motion } from 'framer-motion';
export function ContributionHeatmap() {
  const [year, setYear] = useState(2025);
  const generateData = () => {
    const data = [];
    for (let i = 0; i < 52 * 7; i++) {
      data.push(Math.random() > 0.7 ? Math.floor(Math.random() * 5) : 0);
    }
    return data;
  };
  const contributions = generateData();
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
  return (
    <div className="bg-[var(--card-bg)] p-6 rounded-2xl border border-[var(--card-border)] mb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h3 className="text-[var(--app-text-strong)] font-semibold text-lg flex items-center">
          <span className="mr-2">⚡</span> Contributions
        </h3>

        <div className="flex bg-[var(--card-muted)] rounded-lg p-1">
          {[2025, 2024, 2023].map((y) => (
            <button key={y} onClick={() => setYear(y)} className={`px-4 py-1.5 rounded-md text-sm transition-all ${year === y ? 'bg-blue-600 text-white shadow-lg' : 'text-[var(--app-text-muted)] hover:text-[var(--app-text-strong)]'}`}>
              {y}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto pb-2">
        <div className="min-w-[700px]">
          <div className="flex text-xs text-[var(--app-text-subtle)] mb-2 justify-between px-2">
            <span>Nov</span>
            <span>Dec</span>
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
          </div>

          <div className="grid grid-rows-7 grid-flow-col gap-1 h-[140px]">
            {contributions.map((level, i) => (
              <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.001 }} className={`w-3 h-3 rounded-sm ${getColor(level)}`} title={`${level} contributions`} />
            ))}
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
