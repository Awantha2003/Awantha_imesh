import React from 'react';
import { Mail, Calendar, MapPin, Building2, GraduationCap, Download } from 'lucide-react';
import { FeaturedSection } from '../components/FeaturedSection';
import { ContactSection } from '../components/ContactSection';
import { motion } from 'framer-motion';
export function About() {
  return (
    <div className="max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[var(--card-bg)] rounded-3xl p-8 border border-[var(--card-border)] mb-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-blue-900/40 to-purple-900/40"></div>

        <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start pt-12">
          <div className="w-32 h-32 rounded-full border-4 border-[var(--card-bg)] overflow-hidden shadow-xl">
            <img src="/image.png" alt="Profile" className="w-full h-full object-cover" />
          </div>

          <div className="flex-1">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
              <div>
                <h1 className="text-3xl font-bold text-[var(--app-text-strong)] mb-1">Awantha imesh</h1>
                <p className="text-blue-400 font-medium">Full-Stack Developer</p>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 rounded-full font-medium border border-[var(--button-border)] bg-[var(--button-bg)] text-[var(--app-text-strong)] hover:bg-[var(--card-muted)] transition-colors">
                <Mail size={18} />
                <span>Message</span>
              </button>
            </div>

            <div className="max-w-none">
              <p className="text-[var(--app-text)] leading-relaxed mb-4">I am a motivated and versatile individual, always eager to take on new challenges. With a passion for learning I am dedicated to delivering high-quality results. My journey in tech has been driven by curiosity and a desire to build meaningful solutions.</p>
              <button className="text-blue-400 text-sm hover:underline">View more</button>
            </div>
          </div>
        </div>
      </motion.div>

      <FeaturedSection />

      <div className="grid md:grid-cols-2 gap-8 mb-8">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="bg-[var(--card-bg)] rounded-2xl p-6 border border-[var(--card-border)]">
          <h3 className="text-[var(--app-text-strong)] font-semibold text-lg mb-6 flex items-center gap-2"><GraduationCap className="text-blue-500" /> Education</h3>

          <div className="space-y-8 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[var(--card-border)]">
            <TimelineItem title="Bachelor of Technology" subtitle="Sri Lanka Institute of Information Technology" date="Nov 2023 - 2026" description="Pursuing BTech in Computer Systems and Network Engineering. Maintaining good GPA." />
            <TimelineItem title="ISC(XII), Science with Computer" subtitle="Dharmapala College" date="Apr 2019 - Apr 2023" description="Completed GCO A/L Examination with 2S & 1C passes." />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="bg-[var(--card-bg)] rounded-2xl p-6 border border-[var(--card-border)]">
          <h3 className="text-[var(--app-text-strong)] font-semibold text-lg mb-6 flex items-center gap-2"><Building2 className="text-orange-500" /> Experience</h3>

          <div className="space-y-8 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[var(--card-border)]">
            <TimelineItem title="Web Developer (Volunteering)" subtitle="IEEE Computer Society" date="Aug 2025 - Present" description="Contributing to designing and maintaining web platforms, improving user experience." />
            <TimelineItem title="Intern Software Engineer" subtitle="Cypsolab Pvt Ltd" date="Dec 2023 - Jun 2024" description="Worked on software development projects and gained hands-on experience in the industry." />
          </div>
        </motion.div>
      </div>

      <ContactSection />
    </div>
  );
}
function TimelineItem({ title, subtitle, date, description }) {
  return (
    <div className="pl-8 relative">
      <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full bg-[var(--card-bg)] border-2 border-blue-500"></div>
      <h4 className="text-[var(--app-text-strong)] font-medium mb-1">{title}</h4>
      <p className="text-[var(--app-text-muted)] text-sm mb-2">{subtitle}</p>
      <div className="flex items-center text-xs text-[var(--app-text-subtle)] mb-3">
        <Calendar size={12} className="mr-1.5" />
        {date}
      </div>
      <p className="text-[var(--app-text-muted)] text-sm leading-relaxed text-sm">{description}</p>
      <button className="text-blue-400 text-xs mt-2 hover:underline">See more</button>
    </div>
  );
}
