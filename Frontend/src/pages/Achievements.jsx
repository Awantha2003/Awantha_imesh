import React from 'react';
import { Trophy, Award, Medal } from 'lucide-react';
import { CertificateCard } from '../components/CertificateCard';
import { ContactSection } from '../components/ContactSection';
import { motion } from 'framer-motion';
export function Achievements() {
  const certificates = [
    { title: 'Career Essentials in Cybersecurity', issuer: 'Microsoft and LinkedIn', date: 'Aug 2024', image: '/image.png' },
    { title: 'Career Essentials in GitHub', issuer: 'GitHub', date: 'Aug 2024', image: '/image.png' },
    { title: 'Career Essentials in System Administration', issuer: 'Microsoft', date: 'Aug 2024', image: '/image.png' },
    { title: 'Introduction to Career Skills', issuer: 'LinkedIn', date: 'Aug 2024', image: '/image.png' },
    { title: 'Cybersecurity Foundations', issuer: 'LinkedIn', date: 'Aug 2024', image: '/image.png' },
    { title: 'Microsoft Security Copilot', issuer: 'Microsoft', date: 'Aug 2024', image: '/image.png' }
  ];
  return (
    <div className="max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--app-text-strong)] mb-2 flex items-center gap-3"><Trophy className="text-yellow-500" /> Licenses & Certifications</h1>
        <p className="text-[var(--app-text-muted)]">Professional certifications and verified credentials.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {certificates.map((cert, idx) => (
          <CertificateCard key={idx} title={cert.title} issuer={cert.issuer} date={cert.date} imageUrl={cert.image} delay={idx * 0.1} />
        ))}
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="flex justify-center mb-16">
        <button className="px-6 py-2.5 bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--app-text-strong)] rounded-xl hover:bg-[var(--card-hover)] transition-colors text-sm font-medium">Load More (9 more certifications)</button>
      </motion.div>

      <div className="mb-12">
        <h2 className="text-2xl font-bold text-[var(--app-text-strong)] mb-6 flex items-center gap-3"><Medal className="text-orange-500" /> Badges & Community</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-[var(--card-bg)] p-4 rounded-xl border border-[var(--card-border)] flex items-center gap-4 hover:border-[var(--app-text-subtle)] transition-colors">
              <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center"><Award className="text-blue-400" /></div>
              <div>
                <h4 className="text-[var(--app-text-strong)] font-medium text-sm">Google Cloud Innovator</h4>
                <p className="text-[var(--app-text-subtle)] text-xs">Issued Sep 2025</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <ContactSection />
    </div>
  );
}
