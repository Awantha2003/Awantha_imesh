import React from 'react';
import { BookOpen, Search, Tag } from 'lucide-react';
import { BlogCard } from '../components/BlogCard';
import { ContactSection } from '../components/ContactSection';
import { motion } from 'framer-motion';
export function Blogs() {
  const blogs = [
    { title: 'Google I/O Extended Sri Lanka - An Amazing Experience!', date: '2025, July 27', image: '/image.png' },
    { title: 'My Spy Mic Project Got Attention from Researchers!', date: '2024, Oct 11', image: '/image.png' },
    { title: 'CSNE Batch Inauguration - Beginning My Journey', date: '2023, Oct 18', image: '/image.png' },
    { title: 'Understanding React Server Components', date: '2023, Sep 15', image: '/image.png' }
  ];
  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-[var(--app-text-strong)] flex items-center gap-3"><BookOpen className="text-pink-500" /> Blogs</h1>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {blogs.map((blog, i) => <BlogCard key={i} title={blog.title} date={blog.date} imageUrl={blog.image} delay={i * 0.1} />)}
        </div>

        <ContactSection />
      </div>

      <div className="w-full lg:w-[300px] space-y-6">
        <div className="bg-[var(--card-bg)] p-5 rounded-2xl border border-[var(--card-border)]">
          <h3 className="text-[var(--app-text-strong)] font-semibold mb-4 flex items-center gap-2"><Search size={18} /> Search</h3>
          <input type="text" placeholder="Search articles..." className="w-full bg-[var(--card-muted)] border border-[var(--card-border)] text-[var(--app-text-strong)] text-sm px-4 py-2.5 rounded-lg focus:outline-none focus:border-blue-500" />
        </div>

        <div className="bg-[var(--card-bg)] p-5 rounded-2xl border border-[var(--card-border)]">
          <h3 className="text-[var(--app-text-strong)] font-semibold mb-4 flex items-center gap-2"><Tag size={18} /> Recent Posts</h3>
          <div className="space-y-4">
            {blogs.slice(0, 3).map((blog, i) => (
              <div key={i} className="flex gap-3 group cursor-pointer">
                <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                  <img src={blog.image} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                </div>
                <div>
                  <h4 className="text-[var(--app-text-strong)] text-sm font-medium line-clamp-2 group-hover:text-[var(--accent)] transition-colors">{blog.title}</h4>
                  <span className="text-xs text-[var(--app-text-subtle)]">{blog.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
