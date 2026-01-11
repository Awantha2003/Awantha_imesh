import React, { useEffect, useMemo, useState } from 'react';
import { FolderPlus, CheckCircle2, AlertTriangle, RefreshCcw, Pin, Pencil, Trash2, X, Link2 } from 'lucide-react';
import { apiGet, apiPost, apiPut, apiDelete, apiUpload, API_BASE_URL } from '../lib/api';
import { ProjectCard } from '../components/ProjectCard';

const CATEGORY_OPTIONS = ['Academic Project', 'Personal Project', 'Client Project'];
const COUNTRY_OPTIONS = [
  'Sri Lanka',
  'India',
  'United States',
  'United Kingdom',
  'Australia',
  'Canada',
  'Germany',
  'Singapore',
  'United Arab Emirates',
  'Other'
];

const initialForm = {
  title: '',
  description: '',
  displayDate: '',
  isPublic: true,
  imageUrl: '',
  githubUrl: '',
  liveUrl: '',
  techStack: '',
  category: CATEGORY_OPTIONS[0],
  country: COUNTRY_OPTIONS[0],
  pinned: false
};

const initialLinkForm = {
  platform: '',
  url: '',
  label: '',
  iconKey: '',
  sortOrder: 0,
  active: true
};

export function AdminDashboard() {
  const [form, setForm] = useState(initialForm);
  const [projects, setProjects] = useState([]);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [socialLinks, setSocialLinks] = useState([]);
  const [linkForm, setLinkForm] = useState(initialLinkForm);
  const [linkStatus, setLinkStatus] = useState({ type: '', message: '' });
  const [linksLoading, setLinksLoading] = useState(true);
  const [linkSaving, setLinkSaving] = useState(false);
  const [linkEditingId, setLinkEditingId] = useState(null);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const data = await apiGet('/api/projects');
      setProjects(Array.isArray(data) ? data : []);
    } catch (error) {
      setStatus({ type: 'error', message: 'Failed to load projects.' });
    } finally {
      setLoading(false);
    }
  };

  const loadLinks = async () => {
    setLinksLoading(true);
    try {
      const data = await apiGet('/api/social-links/all');
      setSocialLinks(Array.isArray(data) ? data : []);
    } catch (error) {
      setLinkStatus({ type: 'error', message: 'Failed to load social links.' });
    } finally {
      setLinksLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
    loadLinks();
  }, []);

  const handleChange = (field) => (event) => {
    const { type, checked, value } = event.target;
    const nextValue = type === 'checkbox' ? checked : value;
    setForm((prev) => ({ ...prev, [field]: nextValue }));
  };
  const handleImageChange = (event) => {
    const file = event.target.files?.[0] || null;
    setImageFile(file);
  };

  const handleLinkChange = (field) => (event) => {
    const { type, checked, value } = event.target;
    let nextValue = type === 'checkbox' ? checked : value;
    if (type === 'number') {
      nextValue = value === '' ? '' : Number(value);
    }
    setLinkForm((prev) => ({ ...prev, [field]: nextValue }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setStatus({ type: '', message: '' });
    try {
      let payload = { ...form };
      if (imageFile) {
        const upload = await apiUpload('/api/uploads/project-image', imageFile);
        payload = { ...payload, imageUrl: upload.url };
      }
      if (editingId) {
        await apiPut(`/api/projects/${editingId}`, payload);
        setStatus({ type: 'success', message: 'Project updated successfully.' });
      } else {
        await apiPost('/api/projects', payload);
        setStatus({ type: 'success', message: 'Project created successfully.' });
      }
      setForm(initialForm);
      setImageFile(null);
      setEditingId(null);
      await loadProjects();
    } catch (error) {
      setStatus({ type: 'error', message: editingId ? 'Failed to update project.' : 'Failed to create project.' });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (project) => {
    setEditingId(project.id);
    setForm({
      title: project.title || '',
      description: project.description || '',
      displayDate: project.displayDate || '',
      isPublic: Boolean(project.isPublic),
      imageUrl: project.imageUrl || '',
      githubUrl: project.githubUrl || '',
      liveUrl: project.liveUrl || '',
      techStack: project.techStack || '',
      category: project.category || CATEGORY_OPTIONS[0],
      country: project.country || COUNTRY_OPTIONS[0],
      pinned: Boolean(project.pinned)
    });
    setImageFile(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm(initialForm);
    setImageFile(null);
  };

  const handleDelete = async (projectId) => {
    if (!window.confirm('Delete this project?')) {
      return;
    }
    try {
      await apiDelete(`/api/projects/${projectId}`);
      await loadProjects();
    } catch (error) {
      setStatus({ type: 'error', message: 'Failed to delete project.' });
    }
  };

  const handleTogglePin = async (project) => {
    try {
      await apiPut(`/api/projects/${project.id}`, {
        title: project.title,
        description: project.description,
        displayDate: project.displayDate,
        isPublic: project.isPublic,
        imageUrl: project.imageUrl,
        githubUrl: project.githubUrl,
        liveUrl: project.liveUrl,
        techStack: project.techStack,
        category: project.category,
        country: project.country,
        pinned: !project.pinned
      });
      await loadProjects();
    } catch (error) {
      setStatus({ type: 'error', message: 'Failed to update pin.' });
    }
  };

  const handleLinkSubmit = async (event) => {
    event.preventDefault();
    setLinkSaving(true);
    setLinkStatus({ type: '', message: '' });
    try {
      const payload = {
        ...linkForm,
        sortOrder: linkForm.sortOrder === '' ? 0 : Number(linkForm.sortOrder)
      };
      if (linkEditingId) {
        await apiPut(`/api/social-links/${linkEditingId}`, payload);
        setLinkStatus({ type: 'success', message: 'Social link updated.' });
      } else {
        await apiPost('/api/social-links', payload);
        setLinkStatus({ type: 'success', message: 'Social link created.' });
      }
      setLinkForm(initialLinkForm);
      setLinkEditingId(null);
      await loadLinks();
    } catch (error) {
      setLinkStatus({ type: 'error', message: linkEditingId ? 'Failed to update link.' : 'Failed to create link.' });
    } finally {
      setLinkSaving(false);
    }
  };

  const handleLinkEdit = (link) => {
    setLinkEditingId(link.id);
    setLinkForm({
      platform: link.platform || '',
      url: link.url || '',
      label: link.label || '',
      iconKey: link.iconKey || '',
      sortOrder: link.sortOrder ?? 0,
      active: Boolean(link.active)
    });
  };

  const handleLinkCancel = () => {
    setLinkEditingId(null);
    setLinkForm(initialLinkForm);
  };

  const handleLinkDelete = async (linkId) => {
    if (!window.confirm('Delete this social link?')) {
      return;
    }
    try {
      await apiDelete(`/api/social-links/${linkId}`);
      await loadLinks();
    } catch (error) {
      setLinkStatus({ type: 'error', message: 'Failed to delete link.' });
    }
  };

  const statusIcon = useMemo(() => {
    if (status.type === 'success') {
      return <CheckCircle2 size={18} className="text-green-400" />;
    }
    if (status.type === 'error') {
      return <AlertTriangle size={18} className="text-red-400" />;
    }
    return null;
  }, [status]);

  const linkStatusIcon = useMemo(() => {
    if (linkStatus.type === 'success') {
      return <CheckCircle2 size={18} className="text-green-400" />;
    }
    if (linkStatus.type === 'error') {
      return <AlertTriangle size={18} className="text-red-400" />;
    }
    return null;
  }, [linkStatus]);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col gap-4 rounded-3xl border border-[var(--card-border)] bg-[var(--card-bg)] p-6 md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[var(--app-text-strong)] flex items-center gap-3">
              <FolderPlus className="text-blue-400" /> Admin Dashboard
            </h1>
            <p className="text-[var(--app-text-muted)] text-sm mt-1">
              Create and manage portfolio projects. API: {API_BASE_URL}
            </p>
          </div>
          <button
            type="button"
            onClick={loadProjects}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--button-border)] bg-[var(--button-bg)] px-4 py-2 text-sm font-semibold text-[var(--app-text-strong)] hover:bg-[var(--card-hover)]"
          >
            <RefreshCcw size={16} />
            Refresh
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="text-xs uppercase tracking-wide text-[var(--app-text-subtle)]">Title</label>
            <input
              value={form.title}
              onChange={handleChange('title')}
              required
              className="mt-2 w-full rounded-xl border border-[var(--card-border)] bg-[var(--card-muted)] px-4 py-2 text-sm text-[var(--app-text-strong)] focus:outline-none focus:border-blue-500"
              placeholder="Project title"
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-xs uppercase tracking-wide text-[var(--app-text-subtle)]">Description</label>
            <textarea
              value={form.description}
              onChange={handleChange('description')}
              rows="4"
              className="mt-2 w-full rounded-xl border border-[var(--card-border)] bg-[var(--card-muted)] px-4 py-2 text-sm text-[var(--app-text-strong)] focus:outline-none focus:border-blue-500"
              placeholder="Short description"
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-wide text-[var(--app-text-subtle)]">Display Date</label>
            <input
              value={form.displayDate}
              onChange={handleChange('displayDate')}
              required
              className="mt-2 w-full rounded-xl border border-[var(--card-border)] bg-[var(--card-muted)] px-4 py-2 text-sm text-[var(--app-text-strong)] focus:outline-none focus:border-blue-500"
              placeholder="Dec 2024"
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-wide text-[var(--app-text-subtle)]">Visibility</label>
            <select
              value={form.isPublic ? 'public' : 'private'}
              onChange={(event) => setForm((prev) => ({ ...prev, isPublic: event.target.value === 'public' }))}
              className="mt-2 w-full rounded-xl border border-[var(--card-border)] bg-[var(--card-muted)] px-4 py-2 text-sm text-[var(--app-text-strong)] focus:outline-none focus:border-blue-500"
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </div>

          <div>
            <label className="text-xs uppercase tracking-wide text-[var(--app-text-subtle)]">Project Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="mt-2 w-full rounded-xl border border-[var(--card-border)] bg-[var(--card-muted)] px-4 py-2 text-sm text-[var(--app-text-strong)] file:mr-3 file:rounded-lg file:border-0 file:bg-blue-600 file:px-3 file:py-1.5 file:text-white"
            />
            <p className="mt-2 text-xs text-[var(--app-text-subtle)]">
              {imageFile ? imageFile.name : 'Select an image to upload.'}
            </p>
          </div>

          <div>
            <label className="text-xs uppercase tracking-wide text-[var(--app-text-subtle)]">GitHub URL</label>
            <input
              value={form.githubUrl}
              onChange={handleChange('githubUrl')}
              className="mt-2 w-full rounded-xl border border-[var(--card-border)] bg-[var(--card-muted)] px-4 py-2 text-sm text-[var(--app-text-strong)] focus:outline-none focus:border-blue-500"
              placeholder="https://github.com/user/repo"
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-wide text-[var(--app-text-subtle)]">Live URL</label>
            <input
              value={form.liveUrl}
              onChange={handleChange('liveUrl')}
              className="mt-2 w-full rounded-xl border border-[var(--card-border)] bg-[var(--card-muted)] px-4 py-2 text-sm text-[var(--app-text-strong)] focus:outline-none focus:border-blue-500"
              placeholder="https://example.com"
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-wide text-[var(--app-text-subtle)]">Tech Stack</label>
            <input
              value={form.techStack}
              onChange={handleChange('techStack')}
              className="mt-2 w-full rounded-xl border border-[var(--card-border)] bg-[var(--card-muted)] px-4 py-2 text-sm text-[var(--app-text-strong)] focus:outline-none focus:border-blue-500"
              placeholder="React, Spring Boot, MySQL"
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-wide text-[var(--app-text-subtle)]">Category</label>
            <select
              value={form.category}
              onChange={handleChange('category')}
              className="mt-2 w-full rounded-xl border border-[var(--card-border)] bg-[var(--card-muted)] px-4 py-2 text-sm text-[var(--app-text-strong)] focus:outline-none focus:border-blue-500"
            >
              {CATEGORY_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs uppercase tracking-wide text-[var(--app-text-subtle)]">Country</label>
            <select
              value={form.country}
              onChange={handleChange('country')}
              className="mt-2 w-full rounded-xl border border-[var(--card-border)] bg-[var(--card-muted)] px-4 py-2 text-sm text-[var(--app-text-strong)] focus:outline-none focus:border-blue-500"
            >
              {COUNTRY_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3 md:pt-6">
            <input
              id="pinned"
              type="checkbox"
              checked={form.pinned}
              onChange={handleChange('pinned')}
              className="h-4 w-4 rounded border border-[var(--card-border)]"
            />
            <label htmlFor="pinned" className="text-sm text-[var(--app-text-strong)]">
              Pin this project
            </label>
          </div>

          <div className="md:col-span-2 flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-full border border-[var(--button-border)] bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-60"
            >
              {saving ? 'Saving...' : editingId ? 'Update Project' : 'Create Project'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="inline-flex items-center gap-2 rounded-full border border-[var(--button-border)] bg-[var(--button-bg)] px-4 py-2 text-sm font-semibold text-[var(--app-text-strong)] hover:bg-[var(--card-hover)]"
              >
                <X size={16} />
                Cancel
              </button>
            )}
            {status.message && (
              <div className="inline-flex items-center gap-2 text-sm text-[var(--app-text-strong)]">
                {statusIcon}
                <span>{status.message}</span>
              </div>
            )}
          </div>
        </form>
      </div>

      <div className="rounded-3xl border border-[var(--card-border)] bg-[var(--card-bg)] p-6 md:p-8">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-[var(--app-text-strong)]">All Projects</h2>
          <span className="text-xs text-[var(--app-text-subtle)]">
            {loading ? 'Loading...' : `${projects.length} items`}
          </span>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <div key={project.id} className="space-y-3">
              <ProjectCard
                title={project.title}
                description={project.description}
                isPublic={project.isPublic}
                date={project.displayDate}
                imageUrl={project.imageUrl}
                category={project.category}
                country={project.country}
                delay={0}
              />
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleEdit(project)}
                  className="inline-flex items-center gap-2 rounded-full border border-[var(--button-border)] bg-[var(--button-bg)] px-3 py-1.5 text-xs text-[var(--app-text-strong)] hover:bg-[var(--card-hover)]"
                >
                  <Pencil size={14} />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleTogglePin(project)}
                  className="inline-flex items-center gap-2 rounded-full border border-[var(--button-border)] bg-[var(--button-bg)] px-3 py-1.5 text-xs text-[var(--app-text-strong)] hover:bg-[var(--card-hover)]"
                >
                  <Pin size={14} />
                  {project.pinned ? 'Unpin' : 'Pin'}
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(project.id)}
                  className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs text-red-200 hover:bg-red-500/20"
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            </div>
          ))}
          {!loading && projects.length === 0 && (
            <div className="rounded-2xl border border-dashed border-[var(--card-border)] p-6 text-sm text-[var(--app-text-muted)]">
              No projects yet. Create your first project above.
            </div>
          )}
        </div>
      </div>

      <div className="rounded-3xl border border-[var(--card-border)] bg-[var(--card-bg)] p-6 md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-[var(--app-text-strong)] flex items-center gap-2">
              <Link2 size={18} className="text-blue-400" /> Contact & Social Links
            </h2>
            <p className="text-xs text-[var(--app-text-subtle)] mt-1">
              Add or update social links once, and they update everywhere.
            </p>
          </div>
          <button
            type="button"
            onClick={loadLinks}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--button-border)] bg-[var(--button-bg)] px-4 py-2 text-sm font-semibold text-[var(--app-text-strong)] hover:bg-[var(--card-hover)]"
          >
            <RefreshCcw size={16} />
            Refresh
          </button>
        </div>

        <form onSubmit={handleLinkSubmit} className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="text-xs uppercase tracking-wide text-[var(--app-text-subtle)]">Platform</label>
            <input
              value={linkForm.platform}
              onChange={handleLinkChange('platform')}
              required
              className="mt-2 w-full rounded-xl border border-[var(--card-border)] bg-[var(--card-muted)] px-4 py-2 text-sm text-[var(--app-text-strong)] focus:outline-none focus:border-blue-500"
              placeholder="LinkedIn"
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-wide text-[var(--app-text-subtle)]">URL</label>
            <input
              value={linkForm.url}
              onChange={handleLinkChange('url')}
              required
              className="mt-2 w-full rounded-xl border border-[var(--card-border)] bg-[var(--card-muted)] px-4 py-2 text-sm text-[var(--app-text-strong)] focus:outline-none focus:border-blue-500"
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-wide text-[var(--app-text-subtle)]">Label</label>
            <input
              value={linkForm.label}
              onChange={handleLinkChange('label')}
              className="mt-2 w-full rounded-xl border border-[var(--card-border)] bg-[var(--card-muted)] px-4 py-2 text-sm text-[var(--app-text-strong)] focus:outline-none focus:border-blue-500"
              placeholder="LinkedIn"
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-wide text-[var(--app-text-subtle)]">Icon Key</label>
            <input
              value={linkForm.iconKey}
              onChange={handleLinkChange('iconKey')}
              className="mt-2 w-full rounded-xl border border-[var(--card-border)] bg-[var(--card-muted)] px-4 py-2 text-sm text-[var(--app-text-strong)] focus:outline-none focus:border-blue-500"
              placeholder="linkedin"
            />
            <p className="mt-2 text-xs text-[var(--app-text-subtle)]">
              Use: github, linkedin, email, facebook, messenger, whatsapp, website.
            </p>
          </div>

          <div>
            <label className="text-xs uppercase tracking-wide text-[var(--app-text-subtle)]">Sort Order</label>
            <input
              type="number"
              value={linkForm.sortOrder}
              onChange={handleLinkChange('sortOrder')}
              className="mt-2 w-full rounded-xl border border-[var(--card-border)] bg-[var(--card-muted)] px-4 py-2 text-sm text-[var(--app-text-strong)] focus:outline-none focus:border-blue-500"
              placeholder="0"
            />
          </div>

          <div className="flex items-center gap-3 md:pt-6">
            <input
              id="linkActive"
              type="checkbox"
              checked={linkForm.active}
              onChange={handleLinkChange('active')}
              className="h-4 w-4 rounded border border-[var(--card-border)]"
            />
            <label htmlFor="linkActive" className="text-sm text-[var(--app-text-strong)]">
              Active
            </label>
          </div>

          <div className="md:col-span-2 flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={linkSaving}
              className="inline-flex items-center gap-2 rounded-full border border-[var(--button-border)] bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-60"
            >
              {linkSaving ? 'Saving...' : linkEditingId ? 'Update Link' : 'Add Link'}
            </button>
            {linkEditingId && (
              <button
                type="button"
                onClick={handleLinkCancel}
                className="inline-flex items-center gap-2 rounded-full border border-[var(--button-border)] bg-[var(--button-bg)] px-4 py-2 text-sm font-semibold text-[var(--app-text-strong)] hover:bg-[var(--card-hover)]"
              >
                <X size={16} />
                Cancel
              </button>
            )}
            {linkStatus.message && (
              <div className="inline-flex items-center gap-2 text-sm text-[var(--app-text-strong)]">
                {linkStatusIcon}
                <span>{linkStatus.message}</span>
              </div>
            )}
          </div>
        </form>

        <div className="mt-6 space-y-3">
          {linksLoading && (
            <div className="text-sm text-[var(--app-text-muted)]">Loading social links...</div>
          )}
          {!linksLoading && socialLinks.length === 0 && (
            <div className="text-sm text-[var(--app-text-muted)]">No social links yet.</div>
          )}
          {!linksLoading && socialLinks.map((link) => (
            <div key={link.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--card-border)] bg-[var(--card-muted)] px-4 py-3">
              <div>
                <div className="text-sm text-[var(--app-text-strong)]">{link.platform}</div>
                <div className="text-xs text-[var(--app-text-subtle)]">{link.url}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-1 rounded-full border ${link.active ? 'border-green-500/30 text-green-400 bg-green-500/10' : 'border-[var(--card-border)] text-[var(--app-text-muted)] bg-[var(--card-bg)]'}`}>
                  {link.active ? 'Active' : 'Hidden'}
                </span>
                <button
                  type="button"
                  onClick={() => handleLinkEdit(link)}
                  className="inline-flex items-center gap-2 rounded-full border border-[var(--button-border)] bg-[var(--button-bg)] px-3 py-1.5 text-xs text-[var(--app-text-strong)] hover:bg-[var(--card-hover)]"
                >
                  <Pencil size={14} />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleLinkDelete(link.id)}
                  className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs text-red-200 hover:bg-red-500/20"
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
