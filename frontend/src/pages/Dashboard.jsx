import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { FolderKanban, CheckSquare, Clock, CheckCircle, Plus } from 'lucide-react';

const STATUS_COLORS = {
  todo: 'bg-gray-100 text-gray-700',
  'in-progress': 'bg-blue-100 text-blue-700',
  review: 'bg-yellow-100 text-yellow-700',
  done: 'bg-green-100 text-green-700',
  planning: 'bg-purple-100 text-purple-700',
  active: 'bg-blue-100 text-blue-700',
  'on-hold': 'bg-orange-100 text-orange-700',
  completed: 'bg-green-100 text-green-700',
};

export default function Dashboard() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboard = () => {
    setLoading(true);
    setError('');
    Promise.all([api.get('/projects'), api.get('/tasks')])
      .then(([pRes, tRes]) => {
        setProjects(pRes.data);
        setTasks(tRes.data);
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed to load dashboard data'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchDashboard(); }, []);

  const stats = [
    { label: 'Total Projects', value: projects.length, icon: FolderKanban, color: 'bg-blue-500' },
    { label: 'Total Tasks', value: tasks.length, icon: CheckSquare, color: 'bg-purple-500' },
    { label: 'In Progress', value: tasks.filter(t => t.status === 'in-progress').length, icon: Clock, color: 'bg-orange-500' },
    { label: 'Completed', value: tasks.filter(t => t.status === 'done').length, icon: CheckCircle, color: 'bg-green-500' },
  ];

  if (loading) return (
    <div className="p-8 flex items-center justify-center min-h-96">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-500" />
    </div>
  );

  if (error) return (
    <div className="p-8">
      <div className="card text-center py-12">
        <p className="text-sm font-medium text-rose-500 mb-3">{error}</p>
        <button onClick={fetchDashboard} className="btn-primary">Retry</button>
      </div>
    </div>
  );

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 text-xs font-semibold mb-3">
          Overview
        </div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Good morning, {user?.name?.split(' ')[0]} 👋</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Here's what's happening with your projects today.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card flex items-center gap-4">
            <div className={`${color} p-3 rounded-2xl text-white shadow-lg`}>
              <Icon size={22} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900 dark:text-white">Recent Projects</h2>
            <Link to="/projects" className="text-sm text-cyan-600 dark:text-cyan-400 hover:underline">View all</Link>
          </div>
          {projects.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <FolderKanban size={40} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">No projects yet</p>
              <Link to="/projects" className="text-cyan-600 dark:text-cyan-400 text-sm hover:underline mt-1 inline-block">
                Create your first project
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {projects.slice(0, 5).map(p => (
                <Link key={p._id} to={`/projects/${p._id}`}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                  <div>
                    <p className="font-medium text-sm text-slate-900 dark:text-white">{p.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{p.owner?.name}</p>
                  </div>
                  <span className={`badge ${STATUS_COLORS[p.status]}`}>{p.status}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Tasks */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900 dark:text-white">My Tasks</h2>
            <Link to="/tasks" className="text-sm text-cyan-600 dark:text-cyan-400 hover:underline">View all</Link>
          </div>
          {tasks.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <CheckSquare size={40} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">No tasks assigned yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.slice(0, 5).map(t => (
                <div key={t._id}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-slate-900 dark:text-white truncate">{t.title}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{t.project?.name}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-3">
                    <span className={`badge ${STATUS_COLORS[t.status]}`}>{t.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
