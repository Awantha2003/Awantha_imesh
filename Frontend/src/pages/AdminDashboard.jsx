import React, { useEffect, useMemo, useState } from 'react';
import { FolderPlus, CheckCircle2, AlertTriangle, RefreshCcw, Pin, Pencil, Trash2, X, ListTodo, AlertCircle, CalendarDays, BarChart3, BellRing, LogIn, LogOut, MessageSquare } from 'lucide-react';
import { apiGet, apiPost, apiPut, apiDelete, apiUpload, API_BASE_URL, setAuthToken, clearAuthToken, getAuthToken } from '../lib/api';
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

const TASK_STATUS_OPTIONS = ['TODO', 'IN_PROGRESS', 'COMPLETED', 'PENDING'];
const TASK_PRIORITY_OPTIONS = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
const TASK_RECURRENCE_OPTIONS = ['NONE', 'DAILY', 'WEEKLY', 'MONTHLY'];

const initialTaskForm = {
  title: '',
  description: '',
  status: TASK_STATUS_OPTIONS[0],
  priority: TASK_PRIORITY_OPTIONS[1],
  recurrence: TASK_RECURRENCE_OPTIONS[0],
  scheduledDate: '',
  dueDate: '',
  reminderEnabled: true,
  reminderTime: ''
};

export function AdminDashboard() {
  const [authForm, setAuthForm] = useState({ email: '', password: '' });
  const [authStatus, setAuthStatus] = useState({ type: '', message: '' });
  const [authChecking, setAuthChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authProfile, setAuthProfile] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [projects, setProjects] = useState([]);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [taskForm, setTaskForm] = useState(initialTaskForm);
  const [taskEditingId, setTaskEditingId] = useState(null);
  const [taskSaving, setTaskSaving] = useState(false);
  const [taskStatus, setTaskStatus] = useState({ type: '', message: '' });
  const [pendingComments, setPendingComments] = useState([]);
  const [pendingCommentsLoading, setPendingCommentsLoading] = useState(true);
  const [pendingCommentsStatus, setPendingCommentsStatus] = useState({ type: '', message: '' });
  const [pendingCommentActionId, setPendingCommentActionId] = useState(null);

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

  const loadTasks = async () => {
    setTasksLoading(true);
    try {
      const data = await apiGet('/api/tasks');
      setTasks(Array.isArray(data) ? data : []);
    } catch (error) {
      setTaskStatus({ type: 'error', message: 'Failed to load tasks.' });
    } finally {
      setTasksLoading(false);
    }
  };

  const loadPendingComments = async () => {
    setPendingCommentsLoading(true);
    setPendingCommentsStatus({ type: '', message: '' });
    try {
      const data = await apiGet('/api/admin/project-comments/pending');
      setPendingComments(Array.isArray(data) ? data : []);
    } catch (error) {
      setPendingCommentsStatus({ type: 'error', message: 'Failed to load pending comments.' });
    } finally {
      setPendingCommentsLoading(false);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      const token = getAuthToken();
      if (!token) {
        setAuthChecking(false);
        return;
      }
      try {
        const profile = await apiGet('/api/auth/me');
        setAuthProfile(profile);
        setIsAuthenticated(true);
      } catch (error) {
        clearAuthToken();
      } finally {
        setAuthChecking(false);
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }
    loadProjects();
    loadTasks();
    loadPendingComments();
  }, [isAuthenticated]);

  const handleChange = (field) => (event) => {
    const { type, checked, value } = event.target;
    const nextValue = type === 'checkbox' ? checked : value;
    setForm((prev) => ({ ...prev, [field]: nextValue }));
  };

  const handleAuthChange = (field) => (event) => {
    const { value } = event.target;
    setAuthForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setAuthStatus({ type: '', message: '' });
    const email = authForm.email.trim();
    const password = authForm.password;
    if (!email || !password) {
      setAuthStatus({ type: 'error', message: 'Enter your email and password.' });
      return;
    }
    const token = window.btoa(`${email}:${password}`);
    setAuthToken(token);
    try {
      const profile = await apiGet('/api/auth/me');
      setAuthProfile(profile);
      setIsAuthenticated(true);
      setAuthStatus({ type: 'success', message: 'Logged in successfully.' });
    } catch (error) {
      clearAuthToken();
      setIsAuthenticated(false);
      setAuthProfile(null);
      setAuthStatus({ type: 'error', message: 'Invalid email or password.' });
    }
  };

  const handleLogout = () => {
    clearAuthToken();
    setIsAuthenticated(false);
    setAuthProfile(null);
    setAuthForm({ email: '', password: '' });
    setAuthStatus({ type: '', message: '' });
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0] || null;
    setImageFile(file);
  };

  const handleTaskChange = (field) => (event) => {
    const { type, checked, value } = event.target;
    const nextValue = type === 'checkbox' ? checked : value;
    setTaskForm((prev) => ({ ...prev, [field]: nextValue }));
  };

  const handleTaskSubmit = async (event) => {
    event.preventDefault();
    setTaskSaving(true);
    setTaskStatus({ type: '', message: '' });
    try {
      const payload = {
        ...taskForm,
        scheduledDate: taskForm.scheduledDate || null,
        dueDate: taskForm.dueDate || null,
        reminderTime: taskForm.reminderTime || null
      };
      if (taskEditingId) {
        await apiPut(`/api/tasks/${taskEditingId}`, payload);
        setTaskStatus({ type: 'success', message: 'Task updated.' });
      } else {
        await apiPost('/api/tasks', payload);
        setTaskStatus({ type: 'success', message: 'Task created.' });
      }
      setTaskForm(initialTaskForm);
      setTaskEditingId(null);
      await loadTasks();
    } catch (error) {
      setTaskStatus({ type: 'error', message: taskEditingId ? 'Failed to update task.' : 'Failed to create task.' });
    } finally {
      setTaskSaving(false);
    }
  };

  const handleTaskEdit = (task) => {
    setTaskEditingId(task.id);
    setTaskForm({
      title: task.title || '',
      description: task.description || '',
      status: task.status || TASK_STATUS_OPTIONS[0],
      priority: task.priority || TASK_PRIORITY_OPTIONS[1],
      recurrence: task.recurrence || TASK_RECURRENCE_OPTIONS[0],
      scheduledDate: task.scheduledDate || '',
      dueDate: task.dueDate || '',
      reminderEnabled: task.reminderEnabled !== false,
      reminderTime: task.reminderTime || ''
    });
  };

  const handleTaskCancel = () => {
    setTaskEditingId(null);
    setTaskForm(initialTaskForm);
  };

  const handleTaskDelete = async (taskId) => {
    if (!window.confirm('Delete this task?')) {
      return;
    }
    try {
      await apiDelete(`/api/tasks/${taskId}`);
      await loadTasks();
    } catch (error) {
      setTaskStatus({ type: 'error', message: 'Failed to delete task.' });
    }
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

  const handleApproveComment = async (commentId) => {
    if (!commentId) {
      return;
    }
    setPendingCommentActionId(commentId);
    setPendingCommentsStatus({ type: '', message: '' });
    try {
      await apiPut(`/api/admin/project-comments/${commentId}/approve`, {});
      setPendingComments((prev) => prev.filter((comment) => comment.id !== commentId));
      setPendingCommentsStatus({ type: 'success', message: 'Comment approved.' });
    } catch (error) {
      setPendingCommentsStatus({ type: 'error', message: 'Failed to approve comment.' });
    } finally {
      setPendingCommentActionId(null);
    }
  };

  const handleRejectComment = async (commentId) => {
    if (!commentId) {
      return;
    }
    if (!window.confirm('Reject this comment?')) {
      return;
    }
    setPendingCommentActionId(commentId);
    setPendingCommentsStatus({ type: '', message: '' });
    try {
      await apiDelete(`/api/admin/project-comments/${commentId}`);
      setPendingComments((prev) => prev.filter((comment) => comment.id !== commentId));
      setPendingCommentsStatus({ type: 'success', message: 'Comment rejected.' });
    } catch (error) {
      setPendingCommentsStatus({ type: 'error', message: 'Failed to reject comment.' });
    } finally {
      setPendingCommentActionId(null);
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

  const parseDate = (value) => (value ? new Date(`${value}T00:00:00`) : null);

  const isSameDay = (left, right) => {
    if (!left || !right) {
      return false;
    }
    return left.toDateString() === right.toDateString();
  };

  const isTaskForDate = (task, date) => {
    const scheduled = parseDate(task.scheduledDate);
    if (task.recurrence === 'DAILY') {
      return true;
    }
    if (task.recurrence === 'WEEKLY') {
      return scheduled && scheduled.getDay() === date.getDay();
    }
    if (task.recurrence === 'MONTHLY') {
      return scheduled && scheduled.getDate() === date.getDate();
    }
    return isSameDay(scheduled, date) || isSameDay(parseDate(task.dueDate), date);
  };

  const isTaskOverdue = (task, date) => {
    const due = parseDate(task.dueDate);
    return due && due < date && task.status !== 'COMPLETED';
  };

  const isTaskUpcoming = (task, date) => {
    const due = parseDate(task.dueDate);
    return due && due > date && task.status !== 'COMPLETED';
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

  const calendar = useMemo(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const monthLabel = today.toLocaleString(undefined, { month: 'long', year: 'numeric' });
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < firstDay; i += 1) {
      cells.push(null);
    }
    for (let day = 1; day <= daysInMonth; day += 1) {
      cells.push(day);
    }
    while (cells.length % 7 !== 0) {
      cells.push(null);
    }
    return { monthLabel, cells, todayDay: today.getDate() };
  }, []);

  const authStatusIcon = useMemo(() => {
    if (authStatus.type === 'success') {
      return <CheckCircle2 size={18} className="text-green-400" />;
    }
    if (authStatus.type === 'error') {
      return <AlertTriangle size={18} className="text-red-400" />;
    }
    return null;
  }, [authStatus]);

  const taskStatusIcon = useMemo(() => {
    if (taskStatus.type === 'success') {
      return <CheckCircle2 size={18} className="text-green-400" />;
    }
    if (taskStatus.type === 'error') {
      return <AlertTriangle size={18} className="text-red-400" />;
    }
    return null;
  }, [taskStatus]);

  const pendingCommentsStatusIcon = useMemo(() => {
    if (pendingCommentsStatus.type === 'success') {
      return <CheckCircle2 size={18} className="text-green-400" />;
    }
    if (pendingCommentsStatus.type === 'error') {
      return <AlertTriangle size={18} className="text-red-400" />;
    }
    return null;
  }, [pendingCommentsStatus]);

  const taskSummary = useMemo(() => {
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const tasksForToday = tasks.filter((task) => isTaskForDate(task, todayStart));
    const overdue = tasks.filter((task) => isTaskOverdue(task, todayStart));
    const completed = tasks.filter((task) => task.status === 'COMPLETED');
    const todo = tasks.filter((task) => task.status === 'TODO');
    const inProgress = tasks.filter((task) => task.status === 'IN_PROGRESS');
    const pending = tasks.filter((task) => task.status === 'PENDING');
    const completionRate = tasks.length ? Math.round((completed.length / tasks.length) * 100) : 0;
    const upcoming = tasks.filter((task) => isTaskUpcoming(task, todayStart)).length;
    const carriedForward = tasks.filter((task) => {
      const scheduled = parseDate(task.scheduledDate);
      const recurrence = task.recurrence || 'NONE';
      return scheduled && scheduled < todayStart && task.status !== 'COMPLETED' && recurrence === 'NONE';
    }).length;
    const reminderCount = tasks.filter((task) => task.reminderEnabled).length;
    return {
      total: tasks.length,
      tasksForToday,
      overdue,
      completed,
      todo,
      inProgress,
      pending,
      completionRate,
      upcoming,
      carriedForward,
      reminderCount
    };
  }, [tasks]);

  if (authChecking) {
    return (
      <div className="max-w-md mx-auto rounded-3xl border border-[var(--card-border)] bg-[var(--card-bg)] p-6 text-sm text-[var(--app-text-muted)]">
        Checking admin session...
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto rounded-3xl border border-[var(--card-border)] bg-[var(--card-bg)] p-6 md:p-8">
        <div className="flex items-center gap-3 text-2xl font-semibold text-[var(--app-text-strong)]">
          <LogIn className="text-blue-400" /> Admin Login
        </div>
        <p className="mt-2 text-sm text-[var(--app-text-muted)]">
          Sign in to manage projects, tasks, and social links. API: {API_BASE_URL}
        </p>
        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          <div>
            <label className="text-xs uppercase tracking-wide text-[var(--app-text-subtle)]">Email</label>
            <input
              type="email"
              value={authForm.email}
              onChange={handleAuthChange('email')}
              className="mt-2 w-full rounded-xl border border-[var(--card-border)] bg-[var(--card-muted)] px-4 py-2 text-sm text-[var(--app-text-strong)] focus:outline-none focus:border-blue-500"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wide text-[var(--app-text-subtle)]">Password</label>
            <input
              type="password"
              value={authForm.password}
              onChange={handleAuthChange('password')}
              className="mt-2 w-full rounded-xl border border-[var(--card-border)] bg-[var(--card-muted)] px-4 py-2 text-sm text-[var(--app-text-strong)] focus:outline-none focus:border-blue-500"
              placeholder="Your password"
            />
          </div>
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-full border border-[var(--button-border)] bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-500"
          >
            <LogIn size={16} />
            Sign in
          </button>
          {authStatus.message && (
            <div className="inline-flex items-center gap-2 text-sm text-[var(--app-text-strong)]">
              {authStatusIcon}
              <span>{authStatus.message}</span>
            </div>
          )}
        </form>
      </div>
    );
  }

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
            {authProfile?.email && (
              <p className="text-xs text-[var(--app-text-subtle)] mt-2">Signed in as {authProfile.email}</p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={loadProjects}
              className="inline-flex items-center gap-2 rounded-full border border-[var(--button-border)] bg-[var(--button-bg)] px-4 py-2 text-sm font-semibold text-[var(--app-text-strong)] hover:bg-[var(--card-hover)]"
            >
              <RefreshCcw size={16} />
              Refresh
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-200 hover:bg-red-500/20"
            >
              <LogOut size={16} />
              Log out
            </button>
          </div>
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
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-xl font-semibold text-[var(--app-text-strong)]">Work Management System</h2>
          <button
            type="button"
            onClick={loadTasks}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--button-border)] bg-[var(--button-bg)] px-4 py-2 text-sm font-semibold text-[var(--app-text-strong)] hover:bg-[var(--card-hover)]"
          >
            <RefreshCcw size={16} />
            Refresh Tasks
          </button>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-muted)] p-4">
            <div className="flex items-center gap-2 text-xs text-[var(--app-text-subtle)]">
              <ListTodo size={14} /> Today's Tasks
            </div>
            <div className="mt-2 text-2xl font-semibold text-[var(--app-text-strong)]">
              {tasksLoading ? '...' : taskSummary.tasksForToday.length}
            </div>
          </div>
          <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-muted)] p-4">
            <div className="flex items-center gap-2 text-xs text-[var(--app-text-subtle)]">
              <AlertCircle size={14} /> Overdue
            </div>
            <div className="mt-2 text-2xl font-semibold text-[var(--app-text-strong)]">
              {tasksLoading ? '...' : taskSummary.overdue.length}
            </div>
          </div>
          <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-muted)] p-4">
            <div className="flex items-center gap-2 text-xs text-[var(--app-text-subtle)]">
              <CheckCircle2 size={14} /> Completed
            </div>
            <div className="mt-2 text-2xl font-semibold text-[var(--app-text-strong)]">
              {tasksLoading ? '...' : taskSummary.completed.length}
            </div>
          </div>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
          <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-muted)] p-4">
            <div className="flex items-center justify-between text-xs text-[var(--app-text-subtle)]">
              <span className="inline-flex items-center gap-2"><CalendarDays size={14} /> {calendar.monthLabel}</span>
              <span className="inline-flex items-center gap-2"><BellRing size={14} /> Reminders on</span>
            </div>
            <div className="mt-3 grid grid-cols-7 gap-2 text-[10px] text-[var(--app-text-subtle)]">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((label) => (
                <div key={label} className="text-center">{label}</div>
              ))}
            </div>
            <div className="mt-2 grid grid-cols-7 gap-2 text-xs">
              {calendar.cells.map((day, index) => (
                <div
                  key={`${day || 'empty'}-${index}`}
                  className={`h-8 rounded-lg flex items-center justify-center border border-[var(--card-border)] ${day === calendar.todayDay ? 'bg-blue-600/80 text-white border-blue-500/60' : 'bg-[var(--card-bg)] text-[var(--app-text-muted)]'}`}
                >
                  {day || ''}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-muted)] p-4">
            <div className="flex items-center gap-2 text-xs text-[var(--app-text-subtle)]">
              <BarChart3 size={14} /> Monthly Overview
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs text-[var(--app-text-subtle)]">
                <span>Progress</span>
                <span>{tasksLoading ? '...' : `${taskSummary.completionRate}%`}</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-[var(--card-bg)] overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${taskSummary.completionRate}%` }}></div>
              </div>
            </div>
            <div className="mt-4 space-y-2 text-xs text-[var(--app-text-muted)]">
              <div className="flex items-center justify-between">
                <span>Milestones</span>
                <span>{tasksLoading ? '...' : `${taskSummary.completed.length}/${taskSummary.total}`}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Upcoming deadlines</span>
                <span>{tasksLoading ? '...' : taskSummary.upcoming}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Carried forward</span>
                <span>{tasksLoading ? '...' : taskSummary.carriedForward}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-muted)] p-4">
            <div className="text-xs text-[var(--app-text-subtle)] mb-3">Task Lifecycle</div>
            <div className="space-y-2 text-xs text-[var(--app-text-muted)]">
              <div className="flex items-center justify-between">
                <span>To-do</span>
                <span className="text-[var(--app-text-strong)]">{tasksLoading ? '...' : taskSummary.todo.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>In progress</span>
                <span className="text-[var(--app-text-strong)]">{tasksLoading ? '...' : taskSummary.inProgress.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Completed</span>
                <span className="text-[var(--app-text-strong)]">{tasksLoading ? '...' : taskSummary.completed.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Pending</span>
                <span className="text-[var(--app-text-strong)]">{tasksLoading ? '...' : taskSummary.pending.length}</span>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-muted)] p-4">
            <div className="text-xs text-[var(--app-text-subtle)] mb-3">Reminder Pipeline</div>
            <div className="space-y-2 text-xs text-[var(--app-text-muted)]">
              <div className="flex items-center justify-between">
                <span>Daily task digest</span>
                <span className="text-green-400">{tasksLoading ? '...' : `${taskSummary.tasksForToday.length} tasks`}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Overdue alerts</span>
                <span className="text-yellow-400">{tasksLoading ? '...' : `${taskSummary.overdue.length} alerts`}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Monthly summary</span>
                <span className="text-blue-400">{tasksLoading ? '...' : `${taskSummary.total} tasks`}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
          <form onSubmit={handleTaskSubmit} className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-muted)] p-4 space-y-4">
            <div className="text-sm font-semibold text-[var(--app-text-strong)]">Add Task</div>
            <div>
              <label className="text-xs uppercase tracking-wide text-[var(--app-text-subtle)]">Title</label>
              <input
                value={taskForm.title}
                onChange={handleTaskChange('title')}
                required
                className="mt-2 w-full rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] px-4 py-2 text-sm text-[var(--app-text-strong)] focus:outline-none focus:border-blue-500"
                placeholder="Task title"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wide text-[var(--app-text-subtle)]">Description</label>
              <textarea
                value={taskForm.description}
                onChange={handleTaskChange('description')}
                rows="3"
                className="mt-2 w-full rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] px-4 py-2 text-sm text-[var(--app-text-strong)] focus:outline-none focus:border-blue-500"
                placeholder="Task details"
              />
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div>
                <label className="text-xs uppercase tracking-wide text-[var(--app-text-subtle)]">Status</label>
                <select
                  value={taskForm.status}
                  onChange={handleTaskChange('status')}
                  className="mt-2 w-full rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] px-4 py-2 text-sm text-[var(--app-text-strong)] focus:outline-none focus:border-blue-500"
                >
                  {TASK_STATUS_OPTIONS.map((option) => (
                    <option key={option} value={option}>{option.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs uppercase tracking-wide text-[var(--app-text-subtle)]">Priority</label>
                <select
                  value={taskForm.priority}
                  onChange={handleTaskChange('priority')}
                  className="mt-2 w-full rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] px-4 py-2 text-sm text-[var(--app-text-strong)] focus:outline-none focus:border-blue-500"
                >
                  {TASK_PRIORITY_OPTIONS.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs uppercase tracking-wide text-[var(--app-text-subtle)]">Recurrence</label>
                <select
                  value={taskForm.recurrence}
                  onChange={handleTaskChange('recurrence')}
                  className="mt-2 w-full rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] px-4 py-2 text-sm text-[var(--app-text-strong)] focus:outline-none focus:border-blue-500"
                >
                  {TASK_RECURRENCE_OPTIONS.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs uppercase tracking-wide text-[var(--app-text-subtle)]">Scheduled Date</label>
                <input
                  type="date"
                  value={taskForm.scheduledDate}
                  onChange={handleTaskChange('scheduledDate')}
                  className="mt-2 w-full rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] px-4 py-2 text-sm text-[var(--app-text-strong)] focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-wide text-[var(--app-text-subtle)]">Due Date</label>
                <input
                  type="date"
                  value={taskForm.dueDate}
                  onChange={handleTaskChange('dueDate')}
                  className="mt-2 w-full rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] px-4 py-2 text-sm text-[var(--app-text-strong)] focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-wide text-[var(--app-text-subtle)]">Reminder Time</label>
                <input
                  type="time"
                  value={taskForm.reminderTime}
                  onChange={handleTaskChange('reminderTime')}
                  className="mt-2 w-full rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] px-4 py-2 text-sm text-[var(--app-text-strong)] focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex items-center gap-3 md:pt-6">
                <input
                  id="taskReminder"
                  type="checkbox"
                  checked={taskForm.reminderEnabled}
                  onChange={handleTaskChange('reminderEnabled')}
                  className="h-4 w-4 rounded border border-[var(--card-border)]"
                />
                <label htmlFor="taskReminder" className="text-sm text-[var(--app-text-strong)]">
                  Reminder enabled
                </label>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={taskSaving}
                className="inline-flex items-center gap-2 rounded-full border border-[var(--button-border)] bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-60"
              >
                {taskSaving ? 'Saving...' : taskEditingId ? 'Update Task' : 'Create Task'}
              </button>
              {taskEditingId && (
                <button
                  type="button"
                  onClick={handleTaskCancel}
                  className="inline-flex items-center gap-2 rounded-full border border-[var(--button-border)] bg-[var(--button-bg)] px-4 py-2 text-sm font-semibold text-[var(--app-text-strong)] hover:bg-[var(--card-hover)]"
                >
                  <X size={16} />
                  Cancel
                </button>
              )}
              {taskStatus.message && (
                <div className="inline-flex items-center gap-2 text-sm text-[var(--app-text-strong)]">
                  {taskStatusIcon}
                  <span>{taskStatus.message}</span>
                </div>
              )}
            </div>
          </form>

          <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-muted)] p-4">
            <div className="flex items-center justify-between text-sm font-semibold text-[var(--app-text-strong)]">
              <span>All Tasks</span>
              <span className="text-xs text-[var(--app-text-subtle)]">{tasksLoading ? 'Loading...' : `${tasks.length} items`}</span>
            </div>
            <div className="mt-4 space-y-3">
              {tasksLoading && (
                <div className="text-sm text-[var(--app-text-muted)]">Loading tasks...</div>
              )}
              {!tasksLoading && tasks.length === 0 && (
                <div className="text-sm text-[var(--app-text-muted)]">No tasks yet.</div>
              )}
              {!tasksLoading && tasks.map((task) => {
                const statusStyle = task.status === 'COMPLETED'
                  ? 'border-green-500/30 text-green-400 bg-green-500/10'
                  : task.status === 'IN_PROGRESS'
                    ? 'border-blue-500/30 text-blue-300 bg-blue-500/10'
                    : task.status === 'PENDING'
                      ? 'border-yellow-500/30 text-yellow-300 bg-yellow-500/10'
                      : 'border-[var(--card-border)] text-[var(--app-text-muted)] bg-[var(--card-bg)]';
                return (
                  <div key={task.id} className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] p-4 space-y-3">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <div className="text-sm font-semibold text-[var(--app-text-strong)]">{task.title}</div>
                        {task.description && (
                          <div className="text-xs text-[var(--app-text-muted)] mt-1">{task.description}</div>
                        )}
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full border ${statusStyle}`}>
                        {task.status?.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 gap-2 text-xs text-[var(--app-text-subtle)] md:grid-cols-4">
                      <div>Priority: {task.priority || 'MEDIUM'}</div>
                      <div>Recurrence: {task.recurrence || 'NONE'}</div>
                      <div>Due: {task.dueDate || 'Not set'}</div>
                      <div>Reminder: {task.reminderTime || 'Not set'}</div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleTaskEdit(task)}
                        className="inline-flex items-center gap-2 rounded-full border border-[var(--button-border)] bg-[var(--button-bg)] px-3 py-1.5 text-xs text-[var(--app-text-strong)] hover:bg-[var(--card-hover)]"
                      >
                        <Pencil size={14} />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleTaskDelete(task.id)}
                        className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs text-red-200 hover:bg-red-500/20"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-[var(--card-border)] bg-[var(--card-bg)] p-6 md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-[var(--app-text-strong)] flex items-center gap-2">
              <MessageSquare size={18} className="text-blue-400" /> Client Feedback
            </h2>
            <p className="text-xs text-[var(--app-text-subtle)] mt-1">
              Approve comments before they appear on project pages.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-[var(--app-text-subtle)]">
              {pendingCommentsLoading ? 'Loading...' : `${pendingComments.length} pending`}
            </span>
            <button
              type="button"
              onClick={loadPendingComments}
              className="inline-flex items-center gap-2 rounded-full border border-[var(--button-border)] bg-[var(--button-bg)] px-4 py-2 text-sm font-semibold text-[var(--app-text-strong)] hover:bg-[var(--card-hover)]"
            >
              <RefreshCcw size={16} />
              Refresh
            </button>
          </div>
        </div>

        {pendingCommentsStatus.message && (
          <div className="mt-4 inline-flex items-center gap-2 text-sm text-[var(--app-text-strong)]">
            {pendingCommentsStatusIcon}
            <span>{pendingCommentsStatus.message}</span>
          </div>
        )}

        <div className="mt-6 space-y-3">
          {pendingCommentsLoading && (
            <div className="text-sm text-[var(--app-text-muted)]">Loading pending comments...</div>
          )}
          {!pendingCommentsLoading && pendingComments.length === 0 && (
            <div className="text-sm text-[var(--app-text-muted)]">No pending comments right now.</div>
          )}
          {!pendingCommentsLoading && pendingComments.map((comment) => (
            <div key={comment.id} className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-muted)] p-4 space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-[var(--app-text-strong)]">{comment.name}</div>
                  <div className="text-xs text-[var(--app-text-subtle)]">
                    {comment.projectTitle || `Project #${comment.projectId}`}
                  </div>
                  {comment.email && (
                    <div className="text-xs text-[var(--app-text-subtle)]">{comment.email}</div>
                  )}
                </div>
                <div className="text-xs text-[var(--app-text-subtle)]">{formatCommentDate(comment.createdAt)}</div>
              </div>
              <p className="text-sm text-[var(--app-text-muted)] whitespace-pre-line">{comment.message}</p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleApproveComment(comment.id)}
                  disabled={pendingCommentActionId === comment.id}
                  className="inline-flex items-center gap-2 rounded-full border border-green-500/40 bg-green-500/20 px-3 py-1.5 text-xs text-green-100 hover:bg-green-500/30 disabled:opacity-60"
                >
                  <CheckCircle2 size={14} />
                  {pendingCommentActionId === comment.id ? 'Approving...' : 'Approve'}
                </button>
                <button
                  type="button"
                  onClick={() => handleRejectComment(comment.id)}
                  disabled={pendingCommentActionId === comment.id}
                  className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs text-red-200 hover:bg-red-500/20 disabled:opacity-60"
                >
                  <Trash2 size={14} />
                  {pendingCommentActionId === comment.id ? 'Removing...' : 'Reject'}
                </button>
              </div>
            </div>
          ))}
        </div>
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
    </div>
  );
}
