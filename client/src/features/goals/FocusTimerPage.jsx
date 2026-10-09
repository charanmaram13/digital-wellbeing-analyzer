import React, { useState, useEffect, useRef } from 'react';
import focusApi from '../../services/focusApi.js';
import goalApi from '../../services/goalApi.js';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import Input, { Select } from '../../components/ui/Input.jsx';
import { formatMinutesToHours, formatDate } from '../../utils/formatters.js';
import {
  Timer,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Target,
  Plus,
  Trash2,
  Zap,
} from 'lucide-react';

export function FocusTimerPage() {
  // Timer State
  const [selectedMinutes, setSelectedMinutes] = useState(25);
  const [secondsRemaining, setSecondsRemaining] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [sessionNotes, setSessionNotes] = useState('');
  const timerRef = useRef(null);

  // History & Goals State
  const [focusSessions, setFocusSessions] = useState([]);
  const [goals, setGoals] = useState([]);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [newGoalType, setNewGoalType] = useState('daily_limit');
  const [newGoalCategory, setNewGoalCategory] = useState('Social');
  const [newGoalTarget, setNewGoalTarget] = useState(60);
  const [isSavingGoal, setIsSavingGoal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [sessions, userGoals] = await Promise.all([
        focusApi.getAll(),
        goalApi.getAll(),
      ]);
      setFocusSessions(sessions || []);
      setGoals(userGoals || []);
    } catch (err) {
      console.error('Failed to load focus sessions / goals', err);
    }
  };

  // Timer Tick
  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleCompleteSession();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isActive]);

  const handleSelectDuration = (mins) => {
    if (isActive) return;
    setSelectedMinutes(mins);
    setSecondsRemaining(mins * 60);
  };

  const handleStartTimer = async () => {
    setIsActive(true);
    if (!activeSessionId) {
      try {
        const session = await focusApi.start({
          plannedDurationMinutes: selectedMinutes,
          notes: sessionNotes,
        });
        setActiveSessionId(session._id);
      } catch (err) {
        console.error('Failed to create focus session record', err);
      }
    }
  };

  const handlePauseTimer = () => {
    setIsActive(false);
  };

  const handleResetTimer = () => {
    setIsActive(false);
    setSecondsRemaining(selectedMinutes * 60);
    setActiveSessionId(null);
  };

  const handleCompleteSession = async () => {
    setIsActive(false);
    const elapsedMinutes = Math.max(1, Math.round((selectedMinutes * 60 - secondsRemaining) / 60));

    if (activeSessionId) {
      try {
        await focusApi.update(activeSessionId, {
          actualDurationMinutes: elapsedMinutes,
          status: 'completed',
          notes: sessionNotes,
        });
      } catch (err) {
        console.error('Failed to update completed focus session', err);
      }
    } else {
      try {
        const session = await focusApi.start({
          plannedDurationMinutes: selectedMinutes,
          notes: sessionNotes,
        });
        await focusApi.update(session._id, {
          actualDurationMinutes: elapsedMinutes,
          status: 'completed',
          notes: sessionNotes,
        });
      } catch (err) {
        console.error(err);
      }
    }

    alert('🎉 Focus Session Completed! Points added to your Wellbeing Score.');
    handleResetTimer();
    loadData();
    window.dispatchEvent(new CustomEvent('screentime-updated'));
  };

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    setIsSavingGoal(true);
    try {
      await goalApi.create({
        goalType: newGoalType,
        category: newGoalType === 'category_limit' ? newGoalCategory : null,
        targetValue: parseInt(newGoalTarget, 10),
        startDate: new Date().toISOString().split('T')[0],
      });
      setIsGoalModalOpen(false);
      loadData();
    } catch (err) {
      alert(err.message || 'Failed to create goal');
    } finally {
      setIsSavingGoal(false);
    }
  };

  const handleDeleteGoal = async (id) => {
    try {
      await goalApi.delete(id);
      setGoals((prev) => prev.filter((g) => g._id !== id));
    } catch (err) {
      alert(err.message || 'Failed to remove goal');
    }
  };

  const minutesDisplay = Math.floor(secondsRemaining / 60);
  const secondsDisplay = secondsRemaining % 60;
  const formattedTime = `${String(minutesDisplay).padStart(2, '0')}:${String(secondsDisplay).padStart(2, '0')}`;
  const totalSeconds = selectedMinutes * 60;
  const progressPercent = Math.round(((totalSeconds - secondsRemaining) / totalSeconds) * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <Timer className="w-6 h-6 text-emerald-400" />
          Focus Sessions & Intentional Goals
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Lock in dedicated monotasking blocks to rewire digital distractibility and boost your score.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Interactive Focus Timer (7 cols) */}
        <Card className="lg:col-span-7 flex flex-col items-center justify-center py-10 px-6 text-center">
          {/* Duration Preset Pills */}
          <div className="flex items-center gap-2 mb-8">
            {[15, 25, 50].map((mins) => (
              <button
                key={mins}
                type="button"
                disabled={isActive}
                onClick={() => handleSelectDuration(mins)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  selectedMinutes === mins
                    ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/25'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {mins} Minutes {mins === 25 ? '(Pomodoro)' : mins === 50 ? '(Deep Work)' : '(Sprint)'}
              </button>
            ))}
          </div>

          {/* Big Digital Countdown Circle */}
          <div className="relative w-64 h-64 flex items-center justify-center mb-8">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="transparent"
                stroke="#1e293b"
                strokeWidth="6"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="transparent"
                stroke="#10b981"
                strokeWidth="6"
                strokeDasharray="283"
                strokeDashoffset={283 - (283 * progressPercent) / 100}
                strokeLinecap="round"
                className="transition-all duration-300"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-5xl font-black text-white font-mono tracking-tight">
                {formattedTime}
              </span>
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest mt-1">
                {isActive ? 'In Progress' : 'Ready'}
              </span>
            </div>
          </div>

          {/* Optional Session Focus Intention */}
          <div className="w-full max-w-sm mb-6">
            <input
              type="text"
              placeholder="What is your singular focus intention? (e.g. Write report)"
              value={sessionNotes}
              onChange={(e) => setSessionNotes(e.target.value)}
              className="w-full text-xs py-2 px-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-center text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Timer Controls */}
          <div className="flex items-center gap-3">
            {!isActive ? (
              <Button
                onClick={handleStartTimer}
                variant="primary"
                size="lg"
                className="px-8 font-bold gap-2"
              >
                <Play className="w-4 h-4 fill-current" />
                Start Focus Sprint
              </Button>
            ) : (
              <Button
                onClick={handlePauseTimer}
                variant="secondary"
                size="lg"
                className="px-8 font-bold gap-2"
              >
                <Pause className="w-4 h-4 fill-current" />
                Pause
              </Button>
            )}

            <Button onClick={handleResetTimer} variant="outline" size="lg" title="Reset Timer">
              <RotateCcw className="w-4 h-4" />
            </Button>

            <Button
              onClick={handleCompleteSession}
              variant="outline"
              size="lg"
              className="text-emerald-400 hover:text-emerald-300 border-emerald-500/30"
              title="Mark Completed"
            >
              <CheckCircle2 className="w-4 h-4" />
            </Button>
          </div>
        </Card>

        {/* Goals Management (5 cols) */}
        <Card className="lg:col-span-5 flex flex-col justify-between">
          <div>
            <CardHeader>
              <div>
                <CardTitle>
                  <Target className="w-4 h-4 text-emerald-400" />
                  Active Behavioral Goals
                </CardTitle>
                <p className="text-xs text-slate-400 mt-1">
                  Enforce personal boundaries on daily time and specific categories.
                </p>
              </div>
              <Button
                onClick={() => setIsGoalModalOpen(true)}
                variant="primary"
                size="sm"
                className="text-xs font-bold"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add Goal
              </Button>
            </CardHeader>

            {goals.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No custom limits set. Click '+ Add Goal' to configure a target limit.
              </div>
            ) : (
              <div className="space-y-3">
                {goals.map((g) => (
                  <div
                    key={g._id}
                    className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-white block">
                        {g.goalType === 'daily_limit'
                          ? `Daily Ceiling: ${formatMinutesToHours(g.targetValue)}`
                          : g.goalType === 'category_limit'
                          ? `${g.category} Limit: ${formatMinutesToHours(g.targetValue)}`
                          : `Focus Target: ${formatMinutesToHours(g.targetValue)}`}
                      </span>
                      <span className="text-slate-400 text-[11px]">
                        Started {formatDate(g.startDate)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant="emerald" size="sm">
                        {g.status}
                      </Badge>
                      <button
                        onClick={() => handleDeleteGoal(g._id)}
                        className="p-1 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Completed Sessions */}
          <div className="mt-6 pt-4 border-t border-slate-800">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Recent Completed Sessions
            </h4>
            {focusSessions.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No completed sessions yet.</p>
            ) : (
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {focusSessions.slice(0, 4).map((s) => (
                  <div
                    key={s._id}
                    className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-slate-950/60 text-slate-300"
                  >
                    <span className="flex items-center gap-1.5 truncate max-w-[180px]">
                      <Zap className="w-3 h-3 text-emerald-400 shrink-0" />
                      {s.notes || `${s.actualDurationMinutes}m Focus Block`}
                    </span>
                    <span className="text-emerald-400 font-bold shrink-0">
                      {s.actualDurationMinutes}m
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Add Goal Modal */}
      <Modal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        title="Create New Behavioral Goal"
        description="Set a ceiling on device usage or target daily focus sprint minutes."
      >
        <form onSubmit={handleCreateGoal} className="space-y-4">
          <Select
            id="goalType"
            label="Goal Type"
            options={[
              { value: 'daily_limit', label: 'Overall Daily Screen Time Limit' },
              { value: 'category_limit', label: 'Category-Specific Limit (e.g. Social)' },
              { value: 'focus_minutes', label: 'Daily Focus Sprint Target' },
            ]}
            value={newGoalType}
            onChange={(e) => setNewGoalType(e.target.value)}
          />

          {newGoalType === 'category_limit' && (
            <Select
              id="category"
              label="Select Category"
              options={[
                { value: 'Social', label: 'Social' },
                { value: 'Entertainment', label: 'Entertainment' },
                { value: 'Gaming', label: 'Gaming' },
                { value: 'Communication', label: 'Communication' },
              ]}
              value={newGoalCategory}
              onChange={(e) => setNewGoalCategory(e.target.value)}
            />
          )}

          <Input
            id="targetValue"
            label="Target Value (Minutes)"
            type="number"
            min="10"
            max="1440"
            value={newGoalTarget}
            onChange={(e) => setNewGoalTarget(e.target.value)}
            required
            helperText={`${Math.floor(newGoalTarget / 60)}h ${newGoalTarget % 60}m`}
          />

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-800">
            <Button variant="ghost" onClick={() => setIsGoalModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSavingGoal}>
              Create Goal
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default FocusTimerPage;
