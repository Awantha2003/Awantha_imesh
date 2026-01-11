import React, { useEffect, useMemo, useState } from 'react';
import { Github, Linkedin, Mail, Facebook, MessageCircle, Globe } from 'lucide-react';
import { apiGet } from '../lib/api';
export function ContactSection() {
  const [links, setLinks] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadLinks = async () => {
      setError('');
      try {
        const data = await apiGet('/api/social-links');
        setLinks(Array.isArray(data) ? data : []);
      } catch (err) {
        setError('Unable to load social links.');
      }
    };
    loadLinks();
  }, []);

  const iconMap = useMemo(() => ({
    github: Github,
    linkedin: Linkedin,
    email: Mail,
    mail: Mail,
    facebook: Facebook,
    messenger: MessageCircle,
    whatsapp: MessageCircle,
    website: Globe
  }), []);

  const normalizeUrl = (url) => {
    if (!url) {
      return '#';
    }
    if (url.includes('@') && !url.startsWith('mailto:')) {
      return `mailto:${url}`;
    }
    if (!url.startsWith('http') && !url.startsWith('mailto:')) {
      return `https://${url}`;
    }
    return url;
  };
  return (
    <div className="bg-[var(--card-bg)] rounded-2xl p-6 border border-[var(--card-border)] mt-8">
      <div className="flex items-center mb-6">
        <Mail className="text-[var(--app-text-strong)] mr-3" size={20} />
        <h3 className="text-[var(--app-text-strong)] font-semibold text-lg">Get in touch</h3>
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        {links.map((link) => {
          const iconKey = (link.iconKey || link.platform || '').toLowerCase();
          const Icon = iconMap[iconKey] || Globe;
          return (
            <SocialLink
              key={link.id}
              icon={Icon}
              href={normalizeUrl(link.url)}
              label={link.label || link.platform}
            />
          );
        })}
        {links.length === 0 && error && (
          <p className="text-xs text-[var(--app-text-subtle)]">{error}</p>
        )}
        {links.length === 0 && !error && (
          <p className="text-xs text-[var(--app-text-subtle)]">No social links yet.</p>
        )}
      </div>

      <p className="text-[var(--app-text-muted)] text-sm leading-relaxed">
        Let's build something great together — feel free to connect with me
        through any of the platforms above.
      </p>
    </div>
  );
}
function SocialLink({ icon: Icon, href }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="w-10 h-10 rounded-full bg-[var(--chip-bg)] flex items-center justify-center text-[var(--app-text-strong)] hover:bg-[var(--app-text-strong)] hover:text-[var(--app-bg)] transition-all duration-300"
    >
      <Icon size={18} />
    </a>
  );
}
