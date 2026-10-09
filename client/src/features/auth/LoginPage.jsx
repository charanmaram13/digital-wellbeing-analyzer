import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { HeartHandshake, ShieldCheck, Sparkles, UserCheck } from 'lucide-react';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    try {
      await login({ email, password });
      navigate('/dashboard');
    } catch (err) {
      setErrorMessage(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    setEmail('demo@wellbeing.local');
    setPassword('DemoUser123!');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 shadow-xl shadow-emerald-500/25 mb-2 font-black">
            <HeartHandshake className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Digital Wellbeing Analyzer
          </h1>
          <p className="text-sm text-slate-400">
            Sign in to analyze your habits and receive AI-guided recommendations
          </p>
        </div>

        {/* Card */}
        <div className="glass-panel p-6 sm:p-8 bg-slate-900/80 border-slate-800">
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 font-medium">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="email"
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              id="password"
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              className="w-full font-bold shadow-emerald-500/20 mt-2"
            >
              Sign In
            </Button>
          </form>

          {/* Quick Demo Fill button */}
          <div className="mt-5 pt-4 border-t border-slate-800/80">
            <button
              type="button"
              onClick={fillDemoCredentials}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-xs font-semibold text-emerald-400 border border-emerald-500/30 flex items-center justify-center gap-2 transition-colors"
            >
              <UserCheck className="w-4 h-4" />
              Quick Fill Demo Account (14 Days Data)
            </button>
          </div>

          <div className="mt-6 text-center text-xs text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-emerald-400 font-semibold hover:underline">
              Register now
            </Link>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Private & Scoped
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Gemini AI Powered
          </span>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
