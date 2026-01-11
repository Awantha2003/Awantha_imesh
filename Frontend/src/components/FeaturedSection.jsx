import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
export function FeaturedSection() {
  const scrollRef = useRef(null);
  const scroll = (direction) => {
    if (scrollRef.current) {
      const current = scrollRef.current;
      const scrollAmount = 300;
      if (direction === 'left') {
        current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };
  const items = [
    { title: 'Presenting the IEEE CS SLIIT Web Development Team 25/26!', image: '/image.png', date: '2025, August 30' },
    { title: 'Google I/O Extended Sri Lanka - An Amazing Experience!', image: '/image.png', date: '2025, July 27' },
    { title: 'My Spy Mic Project Got Attention from Researchers!', image: '/image.png', date: '2024, October 11' }
  ];
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-[var(--app-text-strong)] font-semibold text-xl flex items-center gap-3">
          <span className="text-2xl">🏆</span> Featured
        </h3>
        <div className="flex gap-2">
          <button onClick={() => scroll('left')} className="p-1.5 rounded-full bg-[var(--card-bg)] text-[var(--app-text-muted)] hover:text-[var(--app-text-strong)] hover:bg-[var(--card-hover)] transition-all">
            <ChevronLeft size={18} />
          </button>
          <button onClick={() => scroll('right')} className="p-1.5 rounded-full bg-[var(--card-bg)] text-[var(--app-text-muted)] hover:text-[var(--app-text-strong)] hover:bg-[var(--card-hover)] transition-all">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div ref={scrollRef} className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {items.map((item, idx) => (
          <motion.div key={idx} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }} className="min-w-[300px] md:min-w-[350px] snap-start bg-[var(--card-bg)] rounded-xl overflow-hidden border border-[var(--card-border)] group cursor-pointer hover:border-[var(--app-text-subtle)] transition-all">
            <div className="h-48 overflow-hidden relative">
              <img src={item.image} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-60" />
            </div>
            <div className="p-4">
              <h4 className="text-[var(--app-text-strong)] font-medium mb-2 line-clamp-2 group-hover:text-[var(--accent)] transition-colors">{item.title}</h4>
              <div className="flex items-center justify-between text-xs text-[var(--app-text-subtle)]">
                <span>{item.date}</span>
                <ArrowRight size={14} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-[var(--accent)]" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
