import { User, Mail, Shield, CheckSquare, FolderKanban } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user } = useAuth();

  const initials = user?.name
    ?.split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Profile</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Your account and collaboration identity.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card lg:col-span-1">
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center text-2xl font-bold mb-4 shadow-lg shadow-cyan-500/20">
              {initials || <User size={28} />}
            </div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{user?.name}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">{user?.email}</p>
            <span className="badge bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 mt-3">{user?.role}</span>
          </div>
        </div>

        <div className="card lg:col-span-2">
          <h2 className="font-semibold text-slate-900 dark:text-white mb-4">Account Details</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <User className="text-slate-400 dark:text-slate-500" size={18} />
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Name</p>
                <p className="text-sm font-medium text-slate-900 dark:text-white">{user?.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="text-slate-400 dark:text-slate-500" size={18} />
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Email</p>
                <p className="text-sm font-medium text-slate-900 dark:text-white">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="text-slate-400 dark:text-slate-500" size={18} />
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Role</p>
                <p className="text-sm font-medium text-slate-900 dark:text-white">{user?.role}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card lg:col-span-3">
          <h2 className="font-semibold text-slate-900 dark:text-white mb-4">How Team Work Happens</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/80 dark:bg-slate-950/60">
              <FolderKanban className="text-cyan-500 mb-3" size={22} />
              <p className="font-medium text-slate-900 dark:text-white">Join shared projects</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Use a project invite code from a teammate to join their workspace.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/80 dark:bg-slate-950/60">
              <CheckSquare className="text-emerald-500 mb-3" size={22} />
              <p className="font-medium text-slate-900 dark:text-white">Share task ownership</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Project members can assign tasks to each other and track status together.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
