import React, { useState } from 'react';
import { Clock, Award, FolderGit2, Code2, ChevronDown, ChevronRight, Layout, Palette, Megaphone, User } from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { FeaturedSection } from '../components/FeaturedSection';
import { ContactSection } from '../components/ContactSection';
import { motion } from 'framer-motion';
export function Home() {
  return (
    <div className="flex flex-col xl:flex-row gap-6">
      <div className="flex-1 min-w-0">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative h-[280px] rounded-3xl overflow-hidden mb-8 group">
          <img src="/image.png" alt="Hero" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent p-8 flex flex-col justify-between">
            <div className="flex items-center gap-2 text-[var(--app-text)] bg-black/30 backdrop-blur-md w-fit px-3 py-1.5 rounded-lg border border-white/10">
              <Clock size={16} />
              <span className="text-sm font-medium">Wed, January 7, 2026</span>
            </div>

            <div className="max-w-lg">
              <h1 className="text-4xl md:text-5xl font-bold text-[var(--app-text-strong)] mb-2 tracking-tight">
                Good afternoon
                <span className="inline-block w-1 h-12 bg-white ml-1 animate-pulse align-middle"></span>
              </h1>
            </div>
          </div>
        </motion.div>

        <div className="mb-8">
          <h2 className="text-[var(--app-text-strong)] font-semibold text-xl mb-6 flex items-center gap-3">
            <span className="text-2xl">📊</span> Career Stats
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard icon={Clock} value="1" label="years" sublabel="Experience" colorClass="bg-purple-500/20 text-purple-400" delay={0.1} />
            <StatCard icon={Award} value="19" label="Certificates" colorClass="bg-orange-500/20 text-orange-400" delay={0.2} />
            <StatCard icon={FolderGit2} value="23" label="Projects" colorClass="bg-cyan-500/20 text-cyan-400" delay={0.3} />
            <StatCard icon={Code2} value="15" label="Technologies" colorClass="bg-blue-500/20 text-blue-400" delay={0.4} />
          </div>
        </div>

        <FeaturedSection />
      </div>

      <div className="w-full xl:w-[320px] flex flex-col gap-6">
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="bg-[var(--card-bg)] rounded-2xl p-6 border border-[var(--card-border)]">
          <h3 className="text-[var(--app-text-strong)] font-semibold text-lg mb-6 flex items-center gap-3">
            <Code2 size={20} className="text-cyan-400" /> Skill Set
          </h3>
          <div className="grid grid-cols-5 gap-3">
            <TechIcon icon={<svg viewBox="0 0 128 128" className="w-8 h-8">...</svg>} name="HTML5" />
            <TechIcon icon={<svg viewBox="0 0 128 128" className="w-8 h-8">...</svg>} name="JavaScript" />
            <TechIcon icon={<svg viewBox="0 0 128 128" className="w-8 h-8">...</svg>} name="TypeScript" />
            <TechIcon icon={<svg viewBox="0 0 128 128" className="w-8 h-8">...</svg>} name="React" />
            <TechIcon icon={<svg viewBox="0 0 128 128" className="w-8 h-8">...</svg>} name="Next.js" />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="bg-[var(--card-bg)] rounded-2xl p-6 border border-[var(--card-border)]">
          <h3 className="text-[var(--app-text-strong)] font-semibold text-lg mb-6 flex items-center gap-3">
            <User size={20} className="text-blue-400" /> Expertise
          </h3>
          <div className="space-y-3">
            <ExpertiseItem icon={Code2} title="Web Development" color="bg-purple-500/20 text-purple-400" />
            <ExpertiseItem icon={Palette} title="Graphic Design" color="bg-orange-500/20 text-orange-400" />
            <ExpertiseItem icon={Megaphone} title="Digital Marketing" color="bg-cyan-500/20 text-cyan-400" />
            <ExpertiseItem icon={Layout} title="UI / UX Design" color="bg-blue-500/20 text-blue-400" />
          </div>
        </motion.div>

        <ContactSection />
      </div>
    </div>
  );
}
function TechIcon({ icon, name }) {
  return <div className="aspect-square bg-[var(--card-muted)] rounded-lg flex items-center justify-center hover:bg-[var(--card-hover)] transition-all cursor-pointer group relative border border-[var(--card-border)] hover:border-[var(--app-text-subtle)] hover:scale-105" title={name}>{icon}</div>;
}
function ExpertiseItem({ icon: Icon, title, color }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border border-[var(--card-border)] rounded-xl overflow-hidden transition-colors hover:border-[var(--app-text-subtle)]">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between p-3 bg-[var(--card-muted)] hover:bg-[var(--card-hover)] transition-colors">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${color}`}>
            <Icon size={18} />
          </div>
          <span className="text-[var(--app-text)] text-sm font-medium">{title}</span>
        </div>
        {isOpen ? <ChevronDown size={16} className="text-[var(--app-text-subtle)]" /> : <ChevronRight size={16} className="text-[var(--app-text-subtle)]" />}
      </button>
      {isOpen && <div className="p-3 bg-[var(--card-bg)] text-xs text-[var(--app-text-muted)] border-t border-[var(--card-border)]">Specialized in building scalable applications using modern frameworks and best practices.</div>}
    </div>
  );
}
