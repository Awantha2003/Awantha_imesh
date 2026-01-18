import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  ExternalLink,
  Github,
  Globe,
  Layers,
  Lock,
  MapPin,
  MessageSquare,
  Tag
} from 'lucide-react';
import { motion } from 'framer-motion';
import { apiGet, apiPost, API_BASE_URL } from '../lib/api';
import { getCountryFlagUrl } from '../lib/countries';

const initialCommentForm = {
  name: '',
  email: '',
  message: ''
};

const FRONTEND_KEYWORDS = ['react', 'vue', 'angular', 'svelte', 'html', 'css', 'javascript', 'typescript', 'tailwind', 'bootstrap', 'next', 'nuxt', 'vite'];
const BACKEND_KEYWORDS = ['node', 'express', 'spring', 'java', 'php', 'laravel', 'django', 'flask', 'fastapi', 'dotnet', '.net', 'c#', 'nestjs', 'ruby', 'rails'];
const DATABASE_KEYWORDS = ['mysql', 'postgres', 'postgresql', 'mongodb', 'mariadb', 'sqlite', 'firebase', 'supabase', 'redis'];
const SECURITY_KEYWORDS = ['jwt', 'oauth', 'auth', 'session', 'bcrypt', 'passport', 'spring security'];
const AVATAR_GRADIENTS = [
  'from-blue-500/40 via-sky-400/20 to-emerald-400/30',
  'from-amber-500/30 via-orange-400/20 to-rose-400/30',
  'from-purple-500/30 via-fuchsia-400/20 to-pink-400/30',
  'from-cyan-500/30 via-teal-400/20 to-lime-400/30'
];

const getInitial = (name) => (name ? name.trim().charAt(0).toUpperCase() : '?');

const getAvatarGradient = (name) => {
  if (!name) {
    return AVATAR_GRADIENTS[0];
  }
  const code = name.trim().charCodeAt(0);
  return AVATAR_GRADIENTS[code % AVATAR_GRADIENTS.length];
};

const parseTechStack = (value) => {
  if (!value) {
    return [];
  }
  return value
    .split(/[,|]/)
    .map((item) => item.trim())
    .filter(Boolean);
};

const summarizeTech = (items) => {
  if (!items.length) {
    return 'Not specified';
  }
  if (items.length <= 3) {
    return items.join(', ');
  }
  return `${items.slice(0, 3).join(', ')} +${items.length - 3}`;
};

const filterStack = (stack, keywords) =>
  stack.filter((item) => keywords.some((keyword) => item.toLowerCase().includes(keyword)));

const buildHighlights = (project, techStack) => {
  if (!project) {
    return [];
  }
  const highlights = [];
  const description = project.description?.trim();
  if (description) {
    const lines = description
      .split(/\r?\n/)
      .map((line) => line.replace(/^[\s•*-]+/, '').trim())
      .filter(Boolean);
    if (lines.length > 1) {
      highlights.push(...lines);
    } else {
      const sentences = description
        .split(/(?:\.\s+|;\s+)/)
        .map((line) => line.trim())
        .filter(Boolean);
      if (sentences.length > 1) {
        highlights.push(...sentences);
      }
    }
  }

  if (highlights.length < 3) {
    if (project.category) {
      highlights.push(`Category: ${project.category}`);
    }
    if (project.country) {
      highlights.push(`Client region: ${project.country}`);
    }
    if (techStack.length) {
      highlights.push(`Stack: ${summarizeTech(techStack)}`);
    }
    highlights.push(project.isPublic ? 'Visibility: Public' : 'Visibility: Private');
  }

  return Array.from(new Set(highlights)).slice(0, 4);
};

export function ProjectDetails() {
  const { projectId } = useParams();
  const location = useLocation();
  const initialProject = useMemo(() => {
    const candidate = location.state?.project;
    if (candidate && String(candidate.id) === String(projectId)) {
      return candidate;
    }
    return null;
  }, [location.state, projectId]);
  const [project, setProject] = useState(initialProject);
  const [loading, setLoading] = useState(!initialProject);
  const [error, setError] = useState('');
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsError, setCommentsError] = useState('');
  const [commentForm, setCommentForm] = useState(initialCommentForm);
  const [commentStatus, setCommentStatus] = useState({ type: '', message: '' });
  const [commentSubmitting, setCommentSubmitting] = useState(false);

  useEffect(() => {
    if (!projectId) {
      setError('Project not found.');
      setLoading(false);
      return;
    }
    if (initialProject) {
      return;
    }
    let ignore = false;
    const loadProject = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await apiGet('/api/projects/public');
        const found = Array.isArray(data)
          ? data.find((item) => String(item.id) === String(projectId))
          : null;
        if (ignore) {
          return;
        }
        setProject(found || null);
        if (!found) {
          setError('Project not found.');
        }
      } catch (err) {
        if (!ignore) {
          setError('Unable to load project details.');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };
    loadProject();
    return () => {
      ignore = true;
    };
  }, [projectId, initialProject]);

  useEffect(() => {
    if (!project?.id) {
      setComments([]);
      setCommentsError('');
      setCommentForm(initialCommentForm);
      setCommentStatus({ type: '', message: '' });
      return;
    }
    let ignore = false;
    const loadComments = async () => {
      setCommentsLoading(true);
      setCommentsError('');
      try {
        const data = await apiGet(`/api/projects/${project.id}/comments`);
        if (!ignore) {
          setComments(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (!ignore) {
          setCommentsError('Unable to load comments right now.');
          setComments([]);
        }
      } finally {
        if (!ignore) {
          setCommentsLoading(false);
        }
      }
    };
    loadComments();
    return () => {
      ignore = true;
    };
  }, [project?.id]);

  const techStack = useMemo(() => parseTechStack(project?.techStack), [project?.techStack]);
  const heroImage = useMemo(() => {
    if (!project?.imageUrl) {
      return '';
    }
    return project.imageUrl.startsWith('/uploads')
      ? `${API_BASE_URL}${project.imageUrl}`
      : project.imageUrl;
  }, [project?.imageUrl]);
  const flagUrl = useMemo(() => (project?.country ? getCountryFlagUrl(project.country) : ''), [project?.country]);
  const highlights = useMemo(() => buildHighlights(project, techStack), [project, techStack]);
  const frontEndStack = useMemo(() => summarizeTech(filterStack(techStack, FRONTEND_KEYWORDS)), [techStack]);
  const backEndStack = useMemo(() => summarizeTech(filterStack(techStack, BACKEND_KEYWORDS)), [techStack]);
  const databaseStack = useMemo(() => summarizeTech(filterStack(techStack, DATABASE_KEYWORDS)), [techStack]);
  const securityStack = useMemo(() => summarizeTech(filterStack(techStack, SECURITY_KEYWORDS)), [techStack]);

  const snapshotItems = useMemo(() => {
    if (!project) {
      return [];
    }
    return [
      { label: 'Date', value: project.displayDate || 'Not set', icon: Calendar },
      {
        label: 'Visibility',
        value: project.isPublic ? 'Public' : 'Private',
        icon: project.isPublic ? Globe : Lock,
        valueClass: project.isPublic ? 'text-green-400' : 'text-[var(--app-text-muted)]'
      },
      {
        label: 'Category',
        value: project.category || 'General',
        icon: Tag
      },
      {
        label: 'Region',
        value: project.country || 'Global',
        icon: MapPin
      }
    ];
  }, [project]);

  const handleCommentChange = (field) => (event) => {
    const { value } = event.target;
    setCommentForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCommentSubmit = async (event) => {
    event.preventDefault();
    if (!project?.id) {
      return;
    }
    setCommentSubmitting(true);
    setCommentStatus({ type: '', message: '' });
    const payload = {
      name: commentForm.name.trim(),
      email: commentForm.email.trim() || null,
      message: commentForm.message.trim()
    };
    if (!payload.name || !payload.message) {
      setCommentStatus({ type: 'error', message: 'Name and comment are required.' });
      setCommentSubmitting(false);
      return;
    }
    try {
      await apiPost(`/api/projects/${project.id}/comments`, payload);
      setCommentForm(initialCommentForm);
      setCommentStatus({ type: 'success', message: 'Thanks for the feedback! Awaiting approval.' });
      const data = await apiGet(`/api/projects/${project.id}/comments`);
      setComments(Array.isArray(data) ? data : []);
    } catch (err) {
      setCommentStatus({ type: 'error', message: 'Failed to send comment.' });
    } finally {
      setCommentSubmitting(false);
    }
  };

  const formatCommentDate = (value) => {
    if (!value) {
      return '';
    }
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return value;
    }
    return parsed.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="rounded-3xl border border-[var(--card-border)] bg-[var(--card-bg)] p-6 text-sm text-[var(--app-text-muted)]">
          Loading project details...
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="rounded-3xl border border-[var(--card-border)] bg-[var(--card-bg)] p-6 text-sm text-[var(--app-text-muted)]">
          {error || 'Project not found.'}
        </div>
      </div>
    );
  }

  return (
    <div className="relative max-w-6xl mx-auto">
      <div className="pointer-events-none absolute -top-12 right-0 h-64 w-64 rounded-full bg-blue-500/15 blur-3xl" />
      <div className="pointer-events-none absolute bottom-12 left-0 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" />

      <div className="relative space-y-8">
        <Link
          to="/projects"
          className="inline-flex items-center gap-2 text-sm text-[var(--app-text-muted)] hover:text-[var(--app-text-strong)]"
        >
          <ArrowLeft size={16} />
          Back to Projects
        </Link>

        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="relative overflow-hidden rounded-3xl border border-[var(--card-border)] bg-[var(--card-bg)] p-6 md:p-8"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-transparent" />
          <div className="relative">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl md:text-4xl font-bold text-[var(--app-text-strong)]">{project.title}</h1>
              <span className={`text-xs px-2.5 py-1 rounded-full border ${project.isPublic ? 'border-green-500/30 text-green-400 bg-green-500/10' : 'border-[var(--card-border)] text-[var(--app-text-muted)] bg-[var(--card-muted)]'}`}>
                {project.isPublic ? 'Public' : 'Private'}
              </span>
              {project.category && (
                <span className="text-xs px-2.5 py-1 rounded-full border border-[var(--card-border)] bg-[var(--card-muted)] text-[var(--app-text)]">
                  {project.category}
                </span>
              )}
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-[var(--app-text-subtle)]">
              {project.displayDate && (
                <span className="inline-flex items-center gap-1">
                  <Calendar size={12} />
                  {project.displayDate}
                </span>
              )}
              {project.country && (
                <span className="inline-flex items-center gap-2">
                  <MapPin size={12} />
                  {project.country}
                  {flagUrl && (
                    <img
                      src={flagUrl}
                      alt={project.country}
                      title={project.country}
                      className="h-4 w-6 rounded-sm border border-[var(--card-border)] object-cover"
                    />
                  )}
                </span>
              )}
            </div>

            {heroImage && (
              <div className="mt-6 overflow-hidden rounded-2xl border border-[var(--card-border)] shadow-lg shadow-black/30">
                <img src={heroImage} alt={project.title} className="h-64 w-full object-cover" />
              </div>
            )}
          </div>
        </motion.section>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="rounded-3xl border border-[var(--card-border)] bg-[var(--card-bg)] p-6 md:p-8"
          >
            <div>
              <h2 className="text-lg font-semibold text-[var(--app-text-strong)] mb-2">About This Project</h2>
              <p className="text-sm text-[var(--app-text-muted)] leading-relaxed">
                {project.description || 'No description provided for this project yet.'}
              </p>
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-semibold text-[var(--app-text-strong)] mb-2">Technologies Used</h3>
              <div className="flex flex-wrap gap-2">
                {techStack.length > 0 ? (
                  techStack.map((tech) => (
                    <span
                      key={tech}
                      className="text-xs px-3 py-1 rounded-full border border-[var(--card-border)] bg-[var(--card-muted)] text-[var(--app-text)]"
                    >
                      {tech}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-[var(--app-text-subtle)]">No tech stack listed.</span>
                )}
              </div>
            </div>

            {highlights.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-[var(--app-text-strong)] mb-3">Key Highlights</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {highlights.map((item) => (
                    <div key={item} className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-muted)] p-3">
                      <div className="flex items-start gap-2 text-sm text-[var(--app-text-muted)]">
                        <CheckCircle2 size={16} className="text-emerald-400 mt-0.5" />
                        <span>{item}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 flex flex-wrap gap-3">
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-[var(--button-border)] bg-[var(--button-bg)] px-4 py-2 text-sm text-[var(--app-text-strong)] hover:bg-[var(--card-hover)]"
                >
                  <Github size={16} />
                  View Code
                </a>
              )}
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-blue-500/40 bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-500"
                >
                  <ExternalLink size={16} />
                  Live Demo
                </a>
              )}
            </div>
          </motion.section>

          <motion.aside
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.2 }}
            className="space-y-6"
          >
            <div className="rounded-3xl border border-[var(--card-border)] bg-[var(--card-bg)] p-6">
              <h3 className="text-[var(--app-text-strong)] font-semibold mb-4 flex items-center gap-2">
                <Tag size={16} />
                Project Snapshot
              </h3>
              <div className="space-y-3">
                {snapshotItems.map(({ label, value, icon: Icon, valueClass }) => (
                  <div key={label} className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--card-border)] bg-[var(--card-muted)] px-3 py-2">
                    <div className="flex items-center gap-2 text-xs text-[var(--app-text-subtle)]">
                      <Icon size={14} />
                      {label}
                    </div>
                    <div className={`text-xs font-semibold text-right text-[var(--app-text-strong)] ${valueClass || ''}`}>
                      {value}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {techStack.length > 0 && (
              <div className="rounded-3xl border border-[var(--card-border)] bg-[var(--card-bg)] p-6">
                <h3 className="text-[var(--app-text-strong)] font-semibold mb-4 flex items-center gap-2">
                  <Layers size={16} />
                  Technical Architecture
                </h3>
                <div className="grid gap-3">
                  {[
                    { title: 'Frontend', value: frontEndStack },
                    { title: 'Backend', value: backEndStack },
                    { title: 'Database', value: databaseStack },
                    { title: 'Auth & Security', value: securityStack }
                  ].map((item) => (
                    <div key={item.title} className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-muted)] p-3">
                      <div className="text-xs text-[var(--app-text-subtle)]">{item.title}</div>
                      <div className="text-sm text-[var(--app-text-strong)] mt-1">{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.aside>
        </div>

        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.3 }}
          className="relative overflow-hidden rounded-3xl border border-[var(--card-border)] bg-[var(--card-bg)] p-6 md:p-8"
        >
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-blue-500/10 blur-2xl" />
          <div className="pointer-events-none absolute bottom-0 left-10 h-32 w-32 rounded-full bg-emerald-400/10 blur-2xl" />

          <div className="relative">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-[var(--app-text-strong)] flex items-center gap-2">
                <MessageSquare size={18} />
                Client Feedback
              </h2>
              <span className="text-xs text-[var(--app-text-subtle)]">
                {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
              </span>
            </div>
            <p className="mt-1 text-xs text-[var(--app-text-subtle)]">
              Share feedback or a quick note about this project. Comments appear after admin approval.
            </p>

            <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
              <div className="rounded-3xl bg-gradient-to-br from-blue-500/30 via-transparent to-emerald-400/20 p-[1px]">
                <form onSubmit={handleCommentSubmit} className="grid gap-4 rounded-[calc(1.5rem-1px)] border border-[var(--card-border)] bg-[var(--card-muted)] p-5">
                  <div className="flex items-center justify-between text-xs text-[var(--app-text-subtle)]">
                    <span>Write a quick review</span>
                    <span>Visible after approval</span>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <label className="text-xs uppercase tracking-wide text-[var(--app-text-subtle)]">Name</label>
                      <input
                        value={commentForm.name}
                        onChange={handleCommentChange('name')}
                        required
                        maxLength={100}
                        className="mt-2 w-full rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] px-4 py-2 text-sm text-[var(--app-text-strong)] focus:outline-none focus:border-blue-500"
                        placeholder="Client name"
                      />
                    </div>
                    <div>
                      <label className="text-xs uppercase tracking-wide text-[var(--app-text-subtle)]">Email (optional)</label>
                      <input
                        type="email"
                        value={commentForm.email}
                        onChange={handleCommentChange('email')}
                        maxLength={255}
                        className="mt-2 w-full rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] px-4 py-2 text-sm text-[var(--app-text-strong)] focus:outline-none focus:border-blue-500"
                        placeholder="client@email.com"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-wide text-[var(--app-text-subtle)]">Comment</label>
                    <textarea
                      value={commentForm.message}
                      onChange={handleCommentChange('message')}
                      required
                      maxLength={2000}
                      rows="4"
                      className="mt-2 w-full rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] px-4 py-2 text-sm text-[var(--app-text-strong)] focus:outline-none focus:border-blue-500"
                      placeholder="Share your feedback..."
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="submit"
                      disabled={commentSubmitting}
                      className="inline-flex items-center gap-2 rounded-full border border-[var(--button-border)] bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-60"
                    >
                      {commentSubmitting ? 'Sending...' : 'Send Comment'}
                    </button>
                    {commentStatus.message && (
                      <div className={`text-sm ${commentStatus.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                        {commentStatus.message}
                      </div>
                    )}
                  </div>
                </form>
              </div>

              <div className="relative">
                <div className="pointer-events-none absolute -top-6 right-6 text-6xl font-black text-blue-500/10">"</div>
                <div className="space-y-4">
                  {commentsLoading && (
                    <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-muted)] p-4 text-sm text-[var(--app-text-muted)]">
                      Loading comments...
                    </div>
                  )}
                  {!commentsLoading && commentsError && (
                    <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
                      {commentsError}
                    </div>
                  )}
                  {!commentsLoading && !commentsError && comments.length === 0 && (
                    <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-muted)] p-4 text-sm text-[var(--app-text-muted)]">
                      No comments yet. Be the first.
                    </div>
                  )}
                  {!commentsLoading && !commentsError && comments.map((comment, index) => (
                    <motion.div
                      key={comment.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.04 }}
                      className="group relative overflow-hidden rounded-2xl border border-[var(--card-border)] bg-[var(--card-muted)] p-4"
                    >
                      <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-gradient-to-br from-blue-500/10 via-transparent to-emerald-400/10" />
                      <div className="relative">
                        <div className="flex items-start gap-3">
                          <div className={`flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br ${getAvatarGradient(comment.name)} text-sm font-semibold text-[var(--app-text-strong)]`}>
                            {getInitial(comment.name)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="text-sm font-semibold text-[var(--app-text-strong)]">{comment.name}</div>
                              <div className="text-xs text-[var(--app-text-subtle)]">{formatCommentDate(comment.createdAt)}</div>
                            </div>
                            <p className="mt-2 text-sm text-[var(--app-text-muted)] whitespace-pre-line leading-relaxed">
                              {comment.message}
                            </p>
                            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-[var(--app-text-subtle)]">
                              <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-emerald-200">
                                Approved feedback
                              </span>
                              <span className="rounded-full border border-[var(--card-border)] bg-[var(--card-bg)] px-2 py-0.5">
                                {project.category || 'Project'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
