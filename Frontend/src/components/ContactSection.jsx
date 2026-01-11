import React from 'react';
import { Github, Linkedin, Mail, Facebook, MessageCircle } from 'lucide-react';
export function ContactSection() {
  return (
    <div className="bg-[var(--card-bg)] rounded-2xl p-6 border border-[var(--card-border)] mt-8">
      <div className="flex items-center mb-6">
        <Mail className="text-[var(--app-text-strong)] mr-3" size={20} />
        <h3 className="text-[var(--app-text-strong)] font-semibold text-lg">Get in touch</h3>
      </div>

      <div className="flex gap-4 mb-6">
        <SocialLink icon={Facebook} href="#" />
        <SocialLink icon={Mail} href="#" />
        <SocialLink icon={Github} href="#" />
        <SocialLink icon={Linkedin} href="#" />
        <SocialLink icon={MessageCircle} href="#" />
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
    <a href={href} className="w-10 h-10 rounded-full bg-[var(--chip-bg)] flex items-center justify-center text-[var(--app-text-strong)] hover:bg-[var(--app-text-strong)] hover:text-[var(--app-bg)] transition-all duration-300">
      <Icon size={18} />
    </a>
  );
}
