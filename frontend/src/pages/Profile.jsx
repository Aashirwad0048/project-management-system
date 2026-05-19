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
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-500 text-sm mt-1">Your account and collaboration identity.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card lg:col-span-1">
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl font-bold mb-4">
              {initials || <User size={28} />}
            </div>
            <h2 className="text-lg font-semibold text-gray-900">{user?.name}</h2>
            <p className="text-sm text-gray-500">{user?.email}</p>
            <span className="badge bg-blue-100 text-blue-700 mt-3">{user?.role}</span>
          </div>
        </div>

        <div className="card lg:col-span-2">
          <h2 className="font-semibold text-gray-900 mb-4">Account Details</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <User className="text-gray-400" size={18} />
              <div>
                <p className="text-xs text-gray-500">Name</p>
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="text-gray-400" size={18} />
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="text-sm font-medium text-gray-900">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="text-gray-400" size={18} />
              <div>
                <p className="text-xs text-gray-500">Role</p>
                <p className="text-sm font-medium text-gray-900">{user?.role}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card lg:col-span-3">
          <h2 className="font-semibold text-gray-900 mb-4">How Team Work Happens</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-lg border border-gray-100 p-4">
              <FolderKanban className="text-blue-600 mb-3" size={22} />
              <p className="font-medium text-gray-900">Join shared projects</p>
              <p className="text-sm text-gray-500 mt-1">Use a project invite code from a teammate to join their workspace.</p>
            </div>
            <div className="rounded-lg border border-gray-100 p-4">
              <CheckSquare className="text-green-600 mb-3" size={22} />
              <p className="font-medium text-gray-900">Share task ownership</p>
              <p className="text-sm text-gray-500 mt-1">Project members can assign tasks to each other and track status together.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
