import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Plus, FolderKanban, Trash2, ExternalLink, Users, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const STATUS_COLORS = {
  planning: 'bg-purple-100 text-purple-700',
  active: 'bg-blue-100 text-blue-700',
  'on-hold': 'bg-orange-100 text-orange-700',
  completed: 'bg-green-100 text-green-700',
};

export default function Projects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', status: 'planning', deadline: '' });
  const [joinCode, setJoinCode] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchProjects = () => {
    setLoading(true);
    setError('');
    return api.get('/projects')
      .then(({ data }) => setProjects(data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load projects'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchProjects(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.post('/projects', form);
      setProjects([data, ...projects]);
      setShowModal(false);
      setForm({ name: '', description: '', status: 'planning', deadline: '' });
      toast.success('Project created!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create project');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project?')) return;
    try {
      await api.delete(`/projects/${id}`);
      setProjects(projects.filter(p => p._id !== id));
      toast.success('Project deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.post('/projects/join', { inviteCode: joinCode });
      setProjects((current) => [data, ...current.filter((p) => p._id !== data._id)]);
      setJoinCode('');
      setShowJoinModal(false);
      toast.success('Joined project');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to join project');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 text-xs font-semibold mb-3">
            Workspace
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Projects</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowJoinModal(true)} className="btn-secondary flex items-center gap-2">
            <Users size={16} /> Join
          </button>
          <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> New Project
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-500" />
        </div>
      ) : error ? (
        <div className="card text-center py-12">
          <p className="text-sm font-medium text-rose-500 mb-3">{error}</p>
          <button onClick={fetchProjects} className="btn-primary">Retry</button>
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <FolderKanban size={56} className="mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">No projects yet</p>
          <p className="text-sm mb-4">Create your first project to get started</p>
          <button onClick={() => setShowModal(true)} className="btn-primary">Create Project</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map(p => (
            <div key={p._id} className="card hover:shadow-lg transition-shadow border-slate-200 dark:border-slate-800">
              <div className="flex items-start justify-between mb-3">
                <span className={`badge ${STATUS_COLORS[p.status]}`}>{p.status}</span>
                <div className="flex gap-2">
                  <Link to={`/projects/${p._id}`} className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-cyan-500 text-slate-950 font-semibold hover:bg-cyan-400 transition-colors shadow-lg shadow-cyan-500/20">
                    <ArrowRight size={14} /> Open
                  </Link>
                  {p.owner?._id === user?._id && (
                    <button onClick={() => handleDelete(p._id)} className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-500/10 transition-colors" aria-label="Delete project">
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-50 mb-1">{p.name}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 line-clamp-2">{p.description || 'No description'}</p>
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>{p.members?.length || 1} member{(p.members?.length || 1) !== 1 ? 's' : ''}</span>
                {p.deadline && <span>Due: {new Date(p.deadline).toLocaleDateString()}</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-md border border-slate-200 dark:border-slate-800 shadow-2xl">
            <h2 className="text-lg font-bold mb-5 text-slate-900 dark:text-white">Create Project</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Project Name *</label>
                <input className="input" placeholder="My Awesome Project" value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                <textarea className="input resize-none" rows={3} placeholder="What is this project about?"
                  value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
                  <select className="input" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                    <option value="planning">Planning</option>
                    <option value="active">Active</option>
                    <option value="on-hold">On Hold</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Deadline</label>
                  <input type="date" className="input" value={form.deadline}
                    onChange={e => setForm({ ...form, deadline: e.target.value })} />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1">
                  {saving ? 'Creating…' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showJoinModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-md border border-slate-200 dark:border-slate-800 shadow-2xl">
            <h2 className="text-lg font-bold mb-5 text-slate-900 dark:text-white">Join Project</h2>
            <form onSubmit={handleJoin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Invite Code</label>
                <input className="input uppercase tracking-wider" placeholder="8 character code" value={joinCode}
                  onChange={e => setJoinCode(e.target.value.toUpperCase())} required />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowJoinModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1">
                  {saving ? 'Joining...' : 'Join'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
