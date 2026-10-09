import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button.jsx';
import {
  HeartHandshake,
  Sparkles,
  BarChart3,
  Moon,
  Timer,
  ShieldCheck,
  ArrowRight,
  Database,
  Layers,
} from 'lucide-react';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-white">
      {/* Top Navbar */}
      <header className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between border-b border-slate-800/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/20">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <div>
            <span className="text-lg font-bold text-white tracking-tight">Wellbeing</span>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest block -mt-1">
              Analyzer
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/login">
            <Button variant="ghost" size="sm">
              Sign In
            </Button>
          </Link>
          <Link to="/register">
            <Button variant="primary" size="sm">
              Get Started
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-16 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-xs font-semibold text-emerald-400">
          <Sparkles className="w-3.5 h-3.5" />
          AI-Powered Screen-Time & Habit Optimization
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight max-w-4xl mx-auto">
          Understand Your Digital Habits with{' '}
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
            Transparent Analytics & AI
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Analyze screen-time patterns, identify late-night binging and marathon sessions, compute an explainable Digital Wellbeing Score (0–100), and receive actionable behavioral recommendations powered by Google Gemini.
        </p>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/register" className="w-full sm:w-auto">
            <Button size="lg" variant="primary" className="w-full sm:w-auto font-bold gap-2">
              Start Free Today <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link to="/login" className="w-full sm:w-auto">
            <Button size="lg" variant="secondary" className="w-full sm:w-auto">
              Explore Demo Account
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-6 py-16 border-t border-slate-800/60">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Built on Principled Architecture
          </h2>
          <p className="text-sm text-slate-400">
            Decoupled pure analytics calculations, isolated data-access repositories, and graceful rule-based fallbacks.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Transparent Wellbeing Score</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every point is mathematically explainable across 4 dimensions: Goal Adherence (35), Sleep Protection (25), Session Health (20), and Focus Consistency (20).
            </p>
          </div>

          <div className="glass-panel p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center">
              <Moon className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Pattern & Binge Detection</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Detects late-night activity past your customized bedtime, marathon unbroken sessions, category monopolies, and upward usage velocity.
            </p>
          </div>

          <div className="glass-panel p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Gemini AI with Fallback</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Generates tailored behavioral strategies. If the AI provider is offline or key missing, our deterministic rule engine provides immediate guidance.
            </p>
          </div>

          <div className="glass-panel p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <Timer className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Focus Sprints & Goals</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Built-in Pomodoro focus sessions and customized daily screen-time limits that directly boost your overall score upon completion.
            </p>
          </div>

          <div className="glass-panel p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Smart CSV Import & Export</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Import batch device logs with instant duplicate prevention, error validation reporting, and one-click data export.
            </p>
          </div>

          <div className="glass-panel p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Strict Security & Isolation</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              HTTP-only authentication cookies, rate limiting, and database queries strictly scoped to the authenticated user ID.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 py-8 px-6 text-center text-xs text-slate-500">
        <p>Digital Wellbeing Analyzer • Built with React, Vite, Tailwind CSS, Express, MongoDB, and Gemini</p>
      </footer>
    </div>
  );
}

export default LandingPage;
