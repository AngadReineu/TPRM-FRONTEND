import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { Eye, EyeOff, Mail, Lock, User, Building2, AlertCircle, ChevronDown, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { authApi } from '../../../lib/api';
import { useAuthStore } from '../../../stores/authStore';

const INDUSTRIES = [
  'Healthcare',
  'Finance',
  'Insurance',
  'Technology',
  'Manufacturing',
  'Retail',
  'Consulting',
  'Other',
];

// Password strength calculator
function getPasswordStrength(password: string): { strength: number; label: string; color: string } {
  if (password.length === 0) return { strength: 0, label: '', color: '' };
  
  let strength = 0;
  if (password.length >= 8) strength += 25;
  if (password.length >= 12) strength += 15;
  if (/[a-z]/.test(password)) strength += 15;
  if (/[A-Z]/.test(password)) strength += 15;
  if (/[0-9]/.test(password)) strength += 15;
  if (/[^a-zA-Z0-9]/.test(password)) strength += 15;
  
  if (strength < 40) return { strength, label: 'Weak', color: '#EF4444' };
  if (strength < 70) return { strength, label: 'Fair', color: '#F59E0B' };
  if (strength < 90) return { strength, label: 'Good', color: '#0EA5E9' };
  return { strength: 100, label: 'Strong', color: '#10B981' };
}

export function RegisterPage() {
  const navigate = useNavigate();
  const { login, token, user, _hasHydrated } = useAuthStore();

  const [orgName, setOrgName] = useState('');
  const [industry, setIndustry] = useState('Healthcare');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const passwordStrength = getPasswordStrength(password);
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;

  // Redirect to dashboard if already authenticated (only after hydration)
  useEffect(() => {
    if (_hasHydrated && token && user) {
      navigate('/', { replace: true });
    }
  }, [_hasHydrated, token, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      const resp = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          org_name: orgName,
          industry: industry,
          name: name,
          email: email,
          password: password,
        })
      });

      const data = await resp.json();
      
      if (resp.ok) {
        // Store token and fetch user data
        const userData = await authApi.me(data.access_token);
        login(data.access_token, userData);
        navigate('/', { replace: true });
      } else {
        setError(data.detail || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Show loading while hydrating
  if (!_hasHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
      </div>
    );
  }

  // Don't render form if already authenticated
  if (token && user) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <svg width="40" height="40" viewBox="0 0 26 26" fill="none">
              <circle cx="13" cy="13" r="11" stroke="#0EA5E9" strokeWidth="1.5"/>
              <circle cx="13" cy="13" r="6" stroke="#0EA5E9" strokeWidth="1.5"/>
              <circle cx="13" cy="13" r="2" fill="#0EA5E9"/>
              <line x1="13" y1="2" x2="13" y2="6" stroke="#0EA5E9" strokeWidth="1.5"/>
              <line x1="13" y1="20" x2="13" y2="24" stroke="#0EA5E9" strokeWidth="1.5"/>
              <line x1="2" y1="13" x2="6" y2="13" stroke="#0EA5E9" strokeWidth="1.5"/>
              <line x1="20" y1="13" x2="24" y2="13" stroke="#0EA5E9" strokeWidth="1.5"/>
            </svg>
            <span className="text-2xl font-extrabold text-slate-900 tracking-tight">TPRM</span>
          </div>
          <p className="text-slate-500">Third-Party Risk Management</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
          <h1 className="text-xl font-semibold text-slate-900 mb-6">Create your account</h1>

          {error && (
            <div className="flex items-center gap-2 p-3 mb-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Organization Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Organisation Name</label>
              <div className="relative">
                <Building2 size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="ABC Insurance Company"
                  required
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Industry */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Industry / Sector</label>
              <div className="relative">
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  required
                  className="w-full pl-4 pr-10 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent appearance-none bg-white"
                >
                  {INDUSTRIES.map((ind) => (
                    <option key={ind} value={ind}>{ind}</option>
                  ))}
                </select>
                <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
              <div className="relative">
                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  required
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  required
                  minLength={8}
                  className="w-full pl-10 pr-12 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {/* Password strength indicator */}
              {password.length > 0 && (
                <div className="mt-2">
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full transition-all duration-300 rounded-full"
                      style={{ width: `${passwordStrength.strength}%`, backgroundColor: passwordStrength.color }}
                    />
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs" style={{ color: passwordStrength.color }}>
                      {passwordStrength.label}
                    </span>
                    <span className="text-xs text-slate-400">
                      {password.length >= 8 ? '✓' : '✗'} 8+ characters
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  required
                  className="w-full pl-10 pr-12 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                />
                {confirmPassword.length > 0 && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {passwordsMatch ? (
                      <CheckCircle size={18} className="text-emerald-500" />
                    ) : (
                      <XCircle size={18} className="text-red-500" />
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="text-sky-500 hover:underline font-medium">
              Sign in →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
