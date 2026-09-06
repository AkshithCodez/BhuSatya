import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api/client';

export default function LoginPage() {
  const [email, setEmail] = useState('officer@sih.demo');
  const [password, setPassword] = useState('demo123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await login({ email, password });
      localStorage.setItem('token', res.access_token);
      localStorage.setItem('userId', String(res.user_id));
      localStorage.setItem('userName', res.full_name);
      localStorage.setItem('userRole', res.role);
      navigate('/');
    } catch {
      setError('Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">🏛️ BhuSatya</h1>
          <p className="text-slate-400">Intelligent Land Record Digitization & Validation System</p>
        </div>

        <div className="bg-white rounded-xl shadow-xl p-8">
          <h2 className="text-xl font-semibold text-slate-800 mb-6">Sign In</h2>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3 mb-4 border border-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 p-3 bg-slate-50 rounded-lg text-xs text-slate-500">
            <p className="font-medium mb-1">Demo Credentials</p>
            <p>officer@sih.demo / demo123</p>
            <p>operator@sih.demo / demo123</p>
          </div>
        </div>

        <p className="text-center text-xs text-slate-500 mt-6">
          AI assists document digitization and anomaly detection.<br />
          Final verification remains with authorized government officials.
        </p>
      </div>
    </div>
  );
}
