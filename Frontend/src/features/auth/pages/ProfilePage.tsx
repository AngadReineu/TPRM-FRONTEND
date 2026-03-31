import { useState } from 'react';
import { User, Mail, Lock, Save } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/authStore';
import { authApi } from '@/lib/api';

export function ProfilePage() {
  const { user, setUser } = useAuthStore();
  
  const [emailForm, setEmailForm] = useState({
    email: user?.email || '',
    password: '',
  });
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [emailLoading, setEmailLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!emailForm.password) {
      toast.error('Please enter your current password');
      return;
    }

    setEmailLoading(true);
    try {
      const response = await fetch('/api/auth/update-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${useAuthStore.getState().token}`,
        },
        body: JSON.stringify({
          new_email: emailForm.email,
          password: emailForm.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to update email');
      }

      // Update user in store
      if (user) {
        setUser({ ...user, email: emailForm.email });
      }

      toast.success('Email updated successfully');
      setEmailForm({ ...emailForm, password: '' });
    } catch (error: any) {
      toast.error(error.message || 'Failed to update email');
    } finally {
      setEmailLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordForm.newPassword.length < 8) {
      toast.error('New password must be at least 8 characters');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setPasswordLoading(true);
    try {
      const response = await fetch('/api/auth/update-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${useAuthStore.getState().token}`,
        },
        body: JSON.stringify({
          current_password: passwordForm.currentPassword,
          new_password: passwordForm.newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to update password');
      }

      toast.success('Password updated successfully');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error: any) {
      toast.error(error.message || 'Failed to update password');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="max-w-[800px]">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 m-0">Profile Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your account settings and security</p>
      </div>

      {/* Profile Info Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-sky-500 to-indigo-500 flex items-center justify-center text-white text-xl font-bold">
            {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{user?.name}</h2>
            <p className="text-sm text-slate-500">{user?.email}</p>
            <p className="text-xs text-slate-400 mt-1">
              {user?.org_name} · {user?.role}
            </p>
          </div>
        </div>
      </div>

      {/* Change Email */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Mail size={20} className="text-slate-600" />
          <h3 className="text-base font-semibold text-slate-900">Change Email</h3>
        </div>
        
        <form onSubmit={handleEmailChange} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              New Email Address
            </label>
            <input
              type="email"
              value={emailForm.email}
              onChange={(e) => setEmailForm({ ...emailForm, email: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Current Password
            </label>
            <input
              type="password"
              value={emailForm.password}
              onChange={(e) => setEmailForm({ ...emailForm, password: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="Enter your current password"
              required
            />
            <p className="text-xs text-slate-500 mt-1">
              Confirm your password to change your email
            </p>
          </div>

          <button
            type="submit"
            disabled={emailLoading}
            className="flex items-center gap-2 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white font-medium rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={16} />
            {emailLoading ? 'Updating...' : 'Update Email'}
          </button>
        </form>
      </div>

      {/* Change Password */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Lock size={20} className="text-slate-600" />
          <h3 className="text-base font-semibold text-slate-900">Change Password</h3>
        </div>
        
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Current Password
            </label>
            <input
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="Enter your current password"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              New Password
            </label>
            <input
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="Minimum 8 characters"
              required
              minLength={8}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Confirm New Password
            </label>
            <input
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="Re-enter new password"
              required
              minLength={8}
            />
          </div>

          <button
            type="submit"
            disabled={passwordLoading}
            className="flex items-center gap-2 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white font-medium rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={16} />
            {passwordLoading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
