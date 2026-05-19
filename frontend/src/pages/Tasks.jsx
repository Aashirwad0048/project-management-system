import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { CheckSquare, Trash2, ExternalLink } from 'lucide-react';

const STATUS_COLORS = {
  todo: 'bg-gray-100 text-gray-700',
  'in-progress': 'bg-blue-100 text-blue-700',
  review: 'bg-yellow-100 text-yellow-700',
  done: 'bg-green-100 text-green-700',
};
const PRIORITY_COLORS = {
  low: 'bg-gray-100 text-gray-600',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-red-100 text-red-700',
};

export default function Tasks() {
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
      toast.success('Status updated');
    } catch { toast.error('Failed to update'); }
  };

  const filtered = filter === 'all' ? tasks : tasks.filter(t => t.status === filter);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Tasks</h1>
          <p className="text-gray-500 text-sm mt-1">{filtered.length} task{filtered.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {['all', 'todo', 'in-progress', 'review', 'done'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
              filter === f ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}>
            {f === 'all' ? 'All' : f.replace('-', ' ')}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
        </div>
      ) : error ? (
        <div className="card text-center py-12">
          <p className="text-sm font-medium text-red-600 mb-3">{error}</p>
          <button onClick={fetchTasks} className="btn-primary">Retry</button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <CheckSquare size={56} className="mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">No tasks found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(t => (
            <div key={t._id} className="card flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <p className="font-medium text-gray-900 truncate">{t.title}</p>
                  <span className={`badge ${STATUS_COLORS[t.status]} shrink-0`}>{t.status}</span>
                  <span className={`badge ${PRIORITY_COLORS[t.priority]} shrink-0`}>{t.priority}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  {t.project && (
                    <Link to={`/projects/${t.project._id}`} className="hover:text-blue-600 flex items-center gap-1">
                      <ExternalLink size={11} /> {t.project.name}
                    </Link>
                  )}
                  {t.dueDate && <span>Due: {new Date(t.dueDate).toLocaleDateString()}</span>}
                  {t.assignedTo && <span>Assigned to: {t.assignedTo.name}</span>}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <select
                  value={t.status}
                  onChange={e => updateStatus(t._id, e.target.value)}
                  className="text-sm border border-gray-200 rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="review">Review</option>
                  <option value="done">Done</option>
                </select>
                <button onClick={() => handleDelete(t._id)}
                  className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
