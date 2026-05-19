import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { ArrowLeft, Plus, Trash2, Edit2, Copy, Users, ArrowRight, ExternalLink } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const STATUSES = ['todo', 'in-progress', 'review', 'done'];
const STATUS_LABELS = { todo: 'To Do', 'in-progress': 'In Progress', review: 'Review', done: 'Done' };
const STATUS_COLORS = {
  todo: 'border-gray-300 bg-gray-50',
  'in-progress': 'border-blue-300 bg-blue-50',
  review: 'border-yellow-300 bg-yellow-50',
  done: 'border-green-300 bg-green-50',
};
const PRIORITY_BADGE = {
  low: 'bg-gray-100 text-gray-600',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-red-100 text-red-700',
};
export default function ProjectDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    assignedTo: '',
    dueDate: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchProjectDetail = () => {
    setLoading(true);
    setError('');
    Promise.all([api.get(`/projects/${id}`), api.get(`/tasks?project=${id}`)])
      .then(([pRes, tRes]) => { setProject(pRes.data); setTasks(tRes.data); })
      .catch((err) => setError(err.response?.data?.message || 'Failed to load project details'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchProjectDetail(); }, [id]);

  const members = project?.members || [];
  const isLeader = project?.owner?._id === user?._id;

  const openCreate = () => {
    setEditTask(null);
    setForm({ title: '', description: '', status: 'todo', priority: 'medium', assignedTo: '', dueDate: '' });
    setShowModal(true);
  };
  const openEdit = (task) => {
    setEditTask(task);
    setForm({
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      assignedTo: task.assignedTo?._id || '',
      dueDate: task.dueDate?.slice(0, 10) || '',
    });
    setShowModal(true);
  };

  const copyInvite = async () => {
    try {
      await navigator.clipboard.writeText(project.inviteCode);
      toast.success('Invite code copied');
    } catch {
      toast.error('Could not copy invite code');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        description: form.description,
        status: form.status,
        priority: form.priority,
        dueDate: form.dueDate,
      };
      if (isLeader) payload.assignedTo = form.assignedTo || null;

      if (editTask) {
        const { data } = await api.put(`/tasks/${editTask._id}`, payload);
        setTasks(tasks.map(t => t._id === editTask._id ? data : t));
        toast.success(data.statusRequest ? `Requested ${STATUS_LABELS[data.statusRequest.status]}` : 'Task updated!');
      } else {
        const { data } = await api.post('/tasks', {
          ...payload,
          assignedTo: isLeader ? form.assignedTo || undefined : undefined,
          project: id,
        });
        setTasks([data, ...tasks]);
        toast.success('Task created!');
      }
      setShowModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks(tasks.filter(t => t._id !== taskId));
      toast.success('Task deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  const updateStatus = async (taskId, status) => {
    try {
      const { data } = await api.put(`/tasks/${taskId}`, { status });
      setTasks(tasks.map(t => t._id === taskId ? data : t));
      toast.success(data.statusRequest ? `Requested ${STATUS_LABELS[data.statusRequest.status]}` : 'Status updated');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to update status'); }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-500" /></div>;
  if (error) return (
    <div className="p-8">
      <Link to="/projects" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white mb-6">
        <ArrowLeft size={16} /> Back to Projects
      </Link>
      <div className="card text-center py-12">
        <p className="text-sm font-medium text-rose-500 mb-3">{error}</p>
        <button onClick={fetchProjectDetail} className="btn-primary">Retry</button>
      </div>
    </div>
  );
  if (!project) return <div className="p-8 text-center text-slate-500 dark:text-slate-400">Project not found</div>;

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <Link to="/projects" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white mb-2">
        <ArrowLeft size={16} /> Back to Projects
      </Link>

      <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-5">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 text-xs font-semibold mb-3">
            Project workspace
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{project.name}</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 max-w-3xl">{project.description}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Leader: {project.owner?.name}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-700 rounded-xl px-3 py-2.5 flex items-center gap-3 shadow-sm dark:shadow-black/20">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-300">Invite code</p>
              <p className="text-sm font-semibold tracking-wider text-slate-900 dark:text-slate-50">{project.inviteCode}</p>
            </div>
            <button onClick={copyInvite} className="p-2 text-slate-500 hover:text-cyan-600 rounded-lg hover:bg-cyan-500/10 dark:hover:bg-cyan-500/20" aria-label="Copy invite code">
              <Copy size={16} />
            </button>
          </div>
          <button onClick={openCreate} className="btn-primary">
            <Plus size={16} /> Add Task
          </button>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Users size={18} className="text-cyan-500" />
          <h2 className="font-semibold text-slate-900 dark:text-white">Project Team</h2>
        </div>
        <div className="flex flex-wrap gap-3">
          {members.map((member) => (
            <div key={member._id} className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 px-3 py-2.5 bg-slate-50 dark:bg-slate-950/60">
              <div className="w-8 h-8 rounded-full bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 flex items-center justify-center text-xs font-bold">
                {member.name?.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">{member.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {member.email}{member._id === project.owner?._id ? ' · Leader' : ''}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {STATUSES.map(status => {
          const columnTasks = tasks.filter(t => t.status === status);
          return (
            <div key={status} className={`rounded-2xl border-2 ${STATUS_COLORS[status]} p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/70`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-slate-700 dark:text-slate-100 text-sm">{STATUS_LABELS[status]}</h3>
                <span className="bg-white dark:bg-slate-950 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-200 shadow-sm">{columnTasks.length}</span>
              </div>
              <div className="space-y-3 min-h-24">
                {columnTasks.map(task => (
                  <div key={task._id} className="bg-white dark:bg-slate-950 rounded-xl p-3 shadow-sm border border-white/60 dark:border-slate-800">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-sm text-slate-900 dark:text-slate-50">{task.title}</p>
                      <div className="flex gap-1 shrink-0">
                        <button onClick={() => openEdit(task)} className="p-1 text-slate-400 hover:text-cyan-600 rounded-lg hover:bg-cyan-500/10"><Edit2 size={12} /></button>
                        {isLeader && (
                          <button onClick={() => handleDelete(task._id)} className="p-1 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-500/10" aria-label="Delete task">
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                    {task.description && <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">{task.description}</p>}
                    <div className="flex items-center justify-between mt-2">
                      <span className={`badge text-xs ${PRIORITY_BADGE[task.priority]}`}>{task.priority}</span>
                      {task.dueDate && <span className="text-xs text-slate-500 dark:text-slate-400">{new Date(task.dueDate).toLocaleDateString()}</span>}
                    </div>
                    {task.assignedTo && (
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-2">Assigned to {task.assignedTo.name}</p>
                    )}
                    {task.statusRequest?.status && (
                      <div className="mt-2 rounded-lg bg-amber-500/10 border border-amber-500/20 px-2 py-1 text-xs text-amber-700 dark:text-amber-200">
                        {task.statusRequest.requestedBy?.name || 'A member'} requested {STATUS_LABELS[task.statusRequest.status]}
                      </div>
                    )}
                    <div className="mt-3 flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-2 py-2">
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">Move to</span>
                      <select
                        value={task.status}
                        onChange={e => updateStatus(task._id, e.target.value)}
                        className="flex-1 bg-transparent text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none"
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                        ))}
                      </select>
                      <ArrowRight size={11} className="text-slate-400" />
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {STATUSES.filter((s) => s !== status).map((s) => (
                        <button
                          key={s}
                          onClick={() => updateStatus(task._id, s)}
                          className="text-xs px-2.5 py-1 rounded-full bg-slate-100 hover:bg-cyan-500 hover:text-white text-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-cyan-500 dark:hover:text-slate-950 transition-colors inline-flex items-center gap-1"
                        >
                          <ArrowRight size={11} />
                          {STATUS_LABELS[s]}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Task Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-md border border-slate-200 dark:border-slate-800 shadow-2xl">
            <h2 className="text-lg font-bold mb-5 text-slate-900 dark:text-white">{editTask ? 'Edit Task' : 'New Task'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Title *</label>
                <input className="input" placeholder="Task title" value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                <textarea className="input resize-none" rows={2} placeholder="Details…"
                  value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
                  <select className="input" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                    {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Priority</label>
                  <select className="input" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              {isLeader ? (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Assign To</label>
                  <select className="input" value={form.assignedTo} onChange={e => setForm({ ...form, assignedTo: e.target.value })}>
                    <option value="">Unassigned</option>
                    {members.map((member) => (
                      <option key={member._id} value={member._id}>{member.name}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 text-sm text-slate-600 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-400">
                  Only the project leader can assign or reassign tasks.
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Due Date</label>
                <input type="date" className="input" value={form.dueDate}
                  onChange={e => setForm({ ...form, dueDate: e.target.value })} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1">
                  {saving ? 'Saving…' : editTask ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
