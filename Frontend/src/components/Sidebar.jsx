import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, User, Trophy, Folder, BookOpen, Download, Moon, Shield } from 'lucide-react';

const links = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/about', label: 'About', icon: User },
  { to: '/achievements', label: 'Achievements', icon: Trophy },
  { to: '/projects', label: 'Projects', icon: Folder },
  { to: '/blogs', label: 'Blogs', icon: BookOpen },
  { to: '/admin', label: 'Admin', icon: Shield }
];

export function Sidebar() {
  const [darkMode, setDarkMode] = React.useState(true);
  const [menuOpen, setMenuOpen] = React.useState(false);
  React.useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('theme-light', !darkMode);
  }, [darkMode]);
  return (
    <>
      <div className="lg:hidden">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-[var(--panel-border)] bg-[var(--panel-strong)]/90 px-4 py-3 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 overflow-hidden rounded-xl bg-[var(--button-bg)] ring-1 ring-[var(--panel-border)]">
              <img src="/image.png" alt="Profile" className="h-full w-full object-cover" />
            </div>
            <div>
              <div className="text-sm font-semibold text-[var(--app-text-strong)]">Awantha imesh</div>
              <div className="text-[10px] uppercase tracking-[0.25em] text-[var(--accent)]">Full-Stack</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--panel-border)] bg-[var(--button-bg)] text-[var(--app-text-strong)]"
            aria-label="Open menu"
          >
            <span className="flex h-5 w-5 flex-col items-center justify-center gap-1">
              <span className="h-0.5 w-5 rounded-full bg-[var(--app-text-strong)]" />
              <span className="h-0.5 w-4 rounded-full bg-[var(--app-text-strong)]/80" />
              <span className="h-0.5 w-3 rounded-full bg-[var(--app-text-strong)]/60" />
            </span>
          </button>
        </header>

        {menuOpen ? (
          <div className="fixed inset-0 z-40">
            <button
              type="button"
              className="absolute inset-0 bg-black/60"
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
            />
            <div className="absolute right-4 top-4 w-[85%] max-w-sm overflow-hidden rounded-3xl border border-[var(--panel-border)] bg-[var(--panel-bg)] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.45)]">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-lg font-semibold text-[var(--app-text-strong)]">Menu</div>
                  <div className="text-xs text-[var(--app-text-muted)]">Navigate sections</div>
                </div>
                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-full border border-[var(--panel-border)] bg-[var(--button-bg)] px-3 py-1 text-xs text-[var(--app-text-strong)]"
                >
                  Close
                </button>
              </div>

              <nav className="mt-4 space-y-1">
                {links.map((link) => {
                  const Icon = link.icon;
                  return (
                    <NavLink
                      key={link.to}
                      to={link.to}
                      onClick={() => setMenuOpen(false)}
                      className={({ isActive }) =>
                        [
                          'flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm transition-colors',
                          isActive
                            ? 'bg-[var(--button-bg)] text-[var(--accent)]'
                            : 'text-[var(--app-text)] hover:bg-[var(--button-bg)] hover:text-[var(--app-text-strong)]'
                        ].join(' ')
                      }
                    >
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--button-bg)]">
                        <Icon size={18} />
                      </span>
                      {link.label}
                    </NavLink>
                  );
                })}
              </nav>

              <div className="mt-4 space-y-3">
                <button
                  type="button"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[var(--button-border)] bg-[var(--button-bg)] px-4 py-2 text-sm font-semibold text-[var(--app-text-strong)] transition hover:bg-[var(--button-bg)]"
                >
                  <Download size={16} />
                  Resume
                </button>
                <div className="flex items-center justify-between rounded-2xl border border-[var(--panel-border)] bg-[var(--panel-muted)] px-4 py-3">
                  <div className="flex items-center gap-3 text-sm text-[var(--app-text-strong)]">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--button-bg)]">
                      <Moon size={16} />
                    </span>
                    Dark Mode
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={darkMode}
                    onClick={() => setDarkMode((value) => !value)}
                    className={[
                      'relative h-7 w-14 rounded-full border border-[var(--panel-border)] transition',
                      darkMode ? 'bg-[var(--accent)]' : 'bg-[var(--button-bg)]'
                    ].join(' ')}
                  >
                    <span
                      className={[
                        'absolute top-0.5 h-6 w-6 rounded-full bg-white transition',
                        darkMode ? 'left-7' : 'left-0.5'
                      ].join(' ')}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <aside className="hidden lg:flex lg:fixed lg:inset-y-0 lg:w-[320px] lg:p-6 lg:bg-[var(--panel-strong)]">
        <div className="flex h-full w-full flex-col rounded-[28px] border border-[var(--panel-border)] bg-[var(--panel-bg)] px-6 py-7 shadow-[0_20px_60px_rgba(0,0,0,0.4)]">
          <div className="flex flex-col items-start">
            <div className="h-28 w-28 overflow-hidden rounded-full bg-[var(--button-bg)] ring-2 ring-[var(--panel-border)]">
              <img
                src="/image.png"
                alt="Profile"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="mt-5">
              <div className="text-2xl font-semibold text-[var(--app-text-strong)]">Awantha imesh</div>
              <div className="mt-1 text-sm text-[var(--app-text-muted)]">Full-Stack Developer</div>
            </div>
          </div>

          <button
            type="button"
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full border border-[var(--button-border)] bg-[var(--button-bg)] px-4 py-2.5 text-sm font-semibold text-[var(--app-text-strong)] transition hover:bg-[var(--button-bg)]"
          >
            <Download size={16} />
            Resume
          </button>

          <nav className="mt-8 space-y-1">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                  [
                    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors',
                    isActive
                      ? 'bg-[var(--button-bg)] text-[var(--accent)]'
                      : 'text-[var(--app-text)] hover:bg-[var(--button-bg)] hover:text-[var(--app-text-strong)]'
                  ].join(' ')
                }
              >
                <Icon size={18} />
                {link.label}
                </NavLink>
              );
            })}
          </nav>

          <div className="mt-auto pt-6">
            <div className="flex items-center justify-between rounded-2xl border border-[var(--panel-border)] bg-[var(--panel-muted)] px-4 py-3">
              <div className="flex items-center gap-3 text-sm text-[var(--app-text-strong)]">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--button-bg)]">
                  <Moon size={16} />
                </span>
                Dark Mode
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={darkMode}
                onClick={() => setDarkMode((value) => !value)}
                className={[
                  'relative h-7 w-14 rounded-full border border-[var(--panel-border)] transition',
                  darkMode ? 'bg-[var(--accent)]' : 'bg-[var(--button-bg)]'
                ].join(' ')}
              >
                <span
                  className={[
                    'absolute top-0.5 h-6 w-6 rounded-full bg-white transition',
                    darkMode ? 'left-7' : 'left-0.5'
                  ].join(' ')}
                />
              </button>
            </div>
            <div className="mt-4 text-xs leading-relaxed text-[var(--app-text-subtle)]">
              Designed &amp; Built by Awantha imesh
              <br />
              © 2025. All rights reserved.
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
