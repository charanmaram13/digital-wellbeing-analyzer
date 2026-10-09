import React, { useState, useEffect } from 'react';
import settingsApi from '../../services/settingsApi.js';
import apiClient from '../../services/apiClient.js';
import { useTheme } from '../../context/ThemeContext.jsx';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Input, Select } from '../../components/ui/Input.jsx';
import { Spinner } from '../../components/ui/Spinner.jsx';
import {
  Settings,
  ShieldCheck,
  Moon,
  Clock,
  Sparkles,
  Database,
  Smartphone,
  CheckCircle,
} from 'lucide-react';

export function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [settings, setSettings] = useState(null);
  const [health, setHealth] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Form State
  const [dailyGoal, setDailyGoal] = useState(360);
  const [bedtime, setBedtime] = useState('23:00');
  const [wakeTime, setWakeTime] = useState('07:00');
  const [longSessionThreshold, setLongSessionThreshold] = useState(90);
  const [lateNightThreshold, setLateNightThreshold] = useState(45);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [settingsData, healthRes] = await Promise.all([
          settingsApi.getSettings(),
          apiClient.get('/health').catch(() => null),
        ]);

        if (settingsData) {
          setSettings(settingsData);
          setDailyGoal(settingsData.dailyScreenTimeGoalMinutes || 360);
          setBedtime(settingsData.bedtime || '23:00');
          setWakeTime(settingsData.wakeTime || '07:00');
          setLongSessionThreshold(settingsData.longSessionThresholdMinutes || 90);
          setLateNightThreshold(settingsData.lateNightThresholdMinutes || 45);
        }
        if (healthRes?.data) {
          setHealth(healthRes.data);
        }
      } catch (err) {
        setErrorMessage(err.message || 'Failed to load configuration');
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const updated = await settingsApi.updateSettings({
        dailyScreenTimeGoalMinutes: parseInt(dailyGoal, 10),
        bedtime,
        wakeTime,
        longSessionThresholdMinutes: parseInt(longSessionThreshold, 10),
        lateNightThresholdMinutes: parseInt(lateNightThreshold, 10),
        theme,
      });

      setSettings(updated);
      setSuccessMessage('Settings updated successfully!');
      window.dispatchEvent(new CustomEvent('screentime-updated'));
    } catch (err) {
      setErrorMessage(err.message || 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <Spinner size="lg" className="py-24" />;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-emerald-400" />
          Settings & Threshold Configuration
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Customize your daily screen-time target, sleep windows, and algorithm sensitivity.
        </p>
      </div>

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 font-semibold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 font-medium">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Core Daily Boundaries */}
        <Card>
          <CardHeader>
            <CardTitle>
              <Clock className="w-5 h-5 text-emerald-400" />
              Daily Screen-Time Boundaries
            </CardTitle>
          </CardHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              id="dailyGoal"
              label="Daily Screen-Time Goal (Minutes)"
              type="number"
              min="30"
              max="1440"
              value={dailyGoal}
              onChange={(e) => setDailyGoal(e.target.value)}
              helperText={`Equivalent to: ${Math.floor(dailyGoal / 60)} hours ${dailyGoal % 60} minutes`}
              required
            />

            <Select
              id="theme"
              label="Interface Theme"
              options={[
                { value: 'dark', label: 'Dark Charcoal (Recommended)' },
                { value: 'light', label: 'Clean Light' },
              ]}
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
            />
          </div>
        </Card>

        {/* Section 2: Sleep & Circadian Protection */}
        <Card>
          <CardHeader>
            <CardTitle>
              <Moon className="w-5 h-5 text-indigo-400" />
              Sleep & Bedtime Parameters
            </CardTitle>
          </CardHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              id="bedtime"
              label="Target Bedtime (24-Hour HH:mm)"
              type="text"
              placeholder="23:00"
              value={bedtime}
              onChange={(e) => setBedtime(e.target.value)}
              helperText="Usage logged after this time is categorized as late-night activity"
              required
            />

            <Input
              id="wakeTime"
              label="Wake-Up Time (24-Hour HH:mm)"
              type="text"
              placeholder="07:00"
              value={wakeTime}
              onChange={(e) => setWakeTime(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <Input
              id="lateNightThreshold"
              label="Late-Night Tolerance (Minutes)"
              type="number"
              min="10"
              max="180"
              value={lateNightThreshold}
              onChange={(e) => setLateNightThreshold(e.target.value)}
              helperText="Triggers Late-Night Binge alert when exceeded past bedtime"
              required
            />

            <Input
              id="longSessionThreshold"
              label="Long Session Threshold (Minutes)"
              type="number"
              min="30"
              max="360"
              value={longSessionThreshold}
              onChange={(e) => setLongSessionThreshold(e.target.value)}
              helperText="Flags continuous unbroken sessions without breaks"
              required
            />
          </div>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" variant="primary" size="lg" isLoading={isSaving} className="font-bold">
            Save Configuration
          </Button>
        </div>
      </form>

      {/* Section 3: System Health & Diagnostics */}
      <Card>
        <CardHeader>
          <CardTitle>
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            System Health & Service Probes
          </CardTitle>
          <Badge variant={health?.status === 'healthy' ? 'emerald' : 'amber'} size="sm">
            {health?.status === 'healthy' ? 'Healthy System' : 'Degraded'}
          </Badge>
        </CardHeader>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs mb-4">
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="text-slate-400 block font-medium">Database Persistence</span>
            <span className="text-sm font-bold text-white flex items-center gap-1.5">
              <Database className="w-4 h-4 text-emerald-400" />
              {health?.services?.database === 'connected' ? 'MongoDB Atlas (Connected)' : 'Disconnected'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="text-slate-400 block font-medium">AI Provider Pipeline</span>
            <span className="text-sm font-bold text-white flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              {health?.services?.aiProvider === 'available'
                ? 'Google Gemini API'
                : 'Deterministic Fallback Active'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="text-slate-400 block font-medium">Backend Uptime</span>
            <span className="text-sm font-bold text-white">
              {health?.uptimeSeconds != null ? `${health.uptimeSeconds} seconds` : 'Online'}
            </span>
          </div>
        </div>

        {/* Companion App Architecture Note */}
        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs text-slate-400 space-y-1.5">
          <span className="text-slate-200 font-bold flex items-center gap-1.5">
            <Smartphone className="w-4 h-4 text-emerald-400" />
            Future Native Android / Desktop Companion App Documentation
          </span>
          <p className="leading-relaxed">
            Automatic background device tracking can be supported through an Android native daemon utilizing Android's <code className="text-emerald-300">UsageStatsManager</code> permission (or Windows API <code className="text-emerald-300">GetForegroundWindow</code> on desktop). The daemon can securely synchronize usage logs directly into this system via <code className="text-emerald-300">POST /api/v1/screen-time/import</code> using user API tokens.
          </p>
        </div>
      </Card>
    </div>
  );
}

export default SettingsPage;
