import React from 'react';
import { ExternalLink, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
export function CertificateCard({ title, issuer, date, imageUrl, logoUrl, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="bg-[var(--card-bg)] rounded-xl overflow-hidden border border-[var(--card-border)] hover:border-[var(--app-text-subtle)] transition-all group flex flex-col h-full"
    >
      <div className="relative h-40 overflow-hidden bg-[var(--card-muted)]">
        <img src={imageUrl} alt={title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" />
        {logoUrl && (
          <div className="absolute bottom-2 left-2 bg-white p-1 rounded-md shadow-md">
            <img src={logoUrl} alt={issuer} className="w-6 h-6 object-contain" />
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-[var(--app-text-strong)] font-semibold mb-1 line-clamp-2">{title}</h3>
        <p className="text-[var(--app-text-muted)] text-sm mb-3">{issuer}</p>

        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-center text-[var(--app-text-subtle)] text-xs">
            <Calendar size={12} className="mr-1.5" />
            <span>{date}</span>
          </div>

          <button className="flex items-center text-xs text-[var(--app-text-strong)] border border-[var(--card-border)] px-3 py-1.5 rounded-lg hover:bg-[var(--card-hover)] transition-colors">
            <ExternalLink size={12} className="mr-1.5" />
            Show Credential
          </button>
        </div>
      </div>
    </motion.div>
  );
}
