import React from 'react';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';
export function StatCard({ icon: Icon, value, label, sublabel, colorClass = 'bg-blue-500', delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="bg-[var(--card-bg)] p-6 rounded-2xl border border-[var(--card-border)] hover:border-[var(--app-text-subtle)] transition-all group relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-24 h-24 opacity-5 -mr-8 -mt-8">
        <Icon size={96} className="text-[var(--app-text-strong)]" />
      </div>
      <div className="relative z-10">
        <div className={cn('p-3 rounded-full mb-4 text-white inline-flex', colorClass)}>
          <Icon size={24} />
        </div>
        <div className="flex items-baseline gap-2 mb-2">
          <h3 className="text-4xl font-bold text-[var(--app-text-strong)] group-hover:scale-105 transition-transform duration-300">{value}</h3>
          {sublabel && <span className="text-sm text-[var(--app-text-muted)]">{sublabel}</span>}
        </div>
        <p className="text-[var(--app-text-muted)] text-sm font-medium">{label}</p>
      </div>
    </motion.div>
  );
}
