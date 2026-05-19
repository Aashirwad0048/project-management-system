import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { CheckSquare, Trash2, ExternalLink, Filter } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const STATUS_COLORS = {
  todo: 'bg-gray-100 text-gray-700',
  'in-progress': 'bg-blue-100 text-blue-700',
  review: 'bg-yellow-100 text-yellow-700',
  done: 'bg-green-100 text-green-700',
};
const STATUS_LABELS = {
  all: 'All',
  todo: 'To Do',
  'in-progress': 'In Progress',
  review: 'Review',
  done: 'Done',
};
const PRIORITY_COLORS = {
  low: 'bg-gray-100 text-gray-600',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-red-100 text-red-700',
};

export default function Tasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState('');

  const fetchTasks = () => {
    setLoading(true);
    setError('');
    api.get('/tasks')
      .then(({ data }) => setTasks(data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load tasks'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchTasks(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${id}`);
      setTasks(tasks.filter(t => t._id !== id));
      toast.success('Task deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const { data } = await api.put(`/tasks/${id}`, { status });
      setTasks(tasks.map(t => t._id === id ? data : t));
      toast.success(data.statusRequest ? `Requested ${data.statusRequest.status}` : 'Status updated');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to update'); }
  };

  const filtered = filter === 'all' ? tasks : tasks.filter(t => t.status === filter);

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 text-xs font-semibold mb-3">
            <Filter size={12} /> Task board
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">My Tasks</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{filtered.length} task{filtered.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {Object.keys(STATUS_LABELS).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2.5 rounded-full text-sm font-semibold transition-all border ${
              filter === f
                ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-900/20 dark:bg-white dark:text-slate-900 dark:border-white'
                : 'bg-white text-slate-600 border-slate-200 hover:border-cyan-300 hover:text-slate-900 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800 dark:hover:border-cyan-500'
            }`}
          >
            {STATUS_LABELS[f]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-500" />
        </div>
      ) : error ? (
        <div className="card text-center py-12">
          <p className="text-sm font-medium text-rose-500 mb-3">{error}</p>
          <button onClick={fetchTasks} className="btn-primary">Retry</button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <CheckSquare size={56} className="mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">No tasks found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(t => (
            <div key={t._id} className="card flex flex-col lg:flex-row lg:items-center gap-4 hover:shadow-lg transition-shadow">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <p className="font-semibold text-slate-900 dark:text-white truncate">{t.title}</p>
                  <span className={`badge ${STATUS_COLORS[t.status]} shrink-0`}>{t.status}</span>
                  <span className={`badge ${PRIORITY_COLORS[t.priority]} shrink-0`}>{t.priority}</span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                  {t.project && (
                    <Link to={`/projects/${t.project._id}`} className="hover:text-cyan-600 dark:hover:text-cyan-400 flex items-center gap-1">
                      <ExternalLink size={11} /> {t.project.name}
                    </Link>
                  )}
                  {t.dueDate && <span>Due: {new Date(t.dueDate).toLocaleDateString()}</span>}
                  {t.assignedTo && <span>Assigned to: {t.assignedTo.name}</span>}
                </div>
                {t.statusRequest?.status && (
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                    {t.statusRequest.requestedBy?.name || 'A member'} requested {t.statusRequest.status}
                  </p>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">Status:</span>
                  <span className={`badge ${STATUS_COLORS[t.status]} text-xs`}>{STATUS_LABELS[t.status]}</span>
                </div>
                {String(t.project?.owner) === String(user?._id) && (
                  <button
                    onClick={() => handleDelete(t._id)}
                    className="p-2.5 text-slate-400 hover:text-rose-500 rounded-xl hover:bg-rose-500/10 transition-colors"
                    aria-label="Delete task"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
