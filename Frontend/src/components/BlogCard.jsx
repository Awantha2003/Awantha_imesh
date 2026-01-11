import React from 'react';
import { Clock } from 'lucide-react';
import { motion } from 'framer-motion';
export function BlogCard({ title, date, imageUrl, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay }}
      className="relative group overflow-hidden rounded-xl aspect-video cursor-pointer"
    >
      <img src={imageUrl} alt={title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-5 flex flex-col justify-end">
        <div className="flex items-center text-[var(--app-text)] text-xs mb-2">
          <Clock size={12} className="mr-1.5" />
          <span>{date}</span>
        </div>
        <h3 className="text-[var(--app-text-strong)] font-bold text-lg leading-tight group-hover:text-[var(--accent)] transition-colors">{title}</h3>
      </div>
    </motion.div>
  );
}
