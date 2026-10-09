import React, { useState, useEffect } from 'react';
import analyticsApi from '../../services/analyticsApi.js';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Spinner } from '../../components/ui/Spinner.jsx';
import DailyTrendChart from '../../components/charts/DailyTrendChart.jsx';
import WeeklyComparisonChart from '../../components/charts/WeeklyComparisonChart.jsx';
import CategoryPieChart from '../../components/charts/CategoryPieChart.jsx';
import TopAppsBarChart from '../../components/charts/TopAppsBarChart.jsx';
import {
  formatMinutesToHours,
  formatDate,
  CATEGORY_COLORS,
} from '../../utils/formatters.js';
import {
  BarChart3,
  Moon,
  Calendar,
  Layers,
  ShieldCheck,
  Info,
  TrendingUp,
} from 'lucide-react';

export function AnalyticsPage() {
  const [dailyData, setDailyData] = useState([]);
  const [weeklyData, setWeeklyData] = useState(null);
  const [categoryData, setCategoryData] = useState([]);
  const [scoreData, setScoreData] = useState(null);
  const [overview, setOverview] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    async function loadAnalytics() {
      setIsLoading(true);
      try {
        const [dailyRes, weeklyRes, catRes, scoreRes, overRes] = await Promise.all([
          analyticsApi.getDaily(),
          analyticsApi.getWeekly(),
          analyticsApi.getCategories(),
          analyticsApi.getWellbeingScore(),
          analyticsApi.getOverview(),
        ]);
        setDailyData(dailyRes.dailyAggregates || []);
        setWeeklyData(weeklyRes);
        setCategoryData(catRes || []);
        setScoreData(scoreRes);
        setOverview(overRes);
      } catch (err) {
        setErrorMessage(err.message || 'Failed to load detailed analytics');
      } finally {
        setIsLoading(false);
      }
    }
    loadAnalytics();
  }, []);

  if (isLoading) {
    return <Spinner size="lg" className="py-24" />;
  }

  if (errorMessage) {
    return (
      <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
        {errorMessage}
      </div>
    );
  }

  const { score = 100, components = {}, formulaSummary = '', classification = {} } =
    scoreData || {};
  const goalMinutes = overview?.settings?.dailyScreenTimeGoalMinutes || 360;
  const bedtime = overview?.settings?.bedtime || '23:00';
  const lateNightMinutes = overview?.lateNightMinutes || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-emerald-400" />
          Screen-Time Analytics & Trends
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          In-depth time-series aggregations, baseline shifts, and sleep interference metrics.
        </p>
      </div>

      {/* Row 1: Daily Usage & Weekly Baseline Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card className="lg:col-span-7">
          <CardHeader>
            <div>
              <CardTitle>14-Day Daily Usage Progression</CardTitle>
              <p className="text-xs text-slate-400 mt-1">
                Continuous timeline against your {formatMinutesToHours(goalMinutes)} goal.
              </p>
            </div>
          </CardHeader>
          <DailyTrendChart data={dailyData} goalMinutes={goalMinutes} height={280} />
        </Card>

        <Card className="lg:col-span-5">
          <CardHeader>
            <div>
              <CardTitle>
                <Calendar className="w-4 h-4 text-emerald-400" />
                Current Week vs. Prior Week
              </CardTitle>
              <p className="text-xs text-slate-400 mt-1">
                Side-by-side day-by-day comparison to establish trend direction.
              </p>
            </div>
          </CardHeader>
          <WeeklyComparisonChart
            currentWeekDaily={weeklyData?.currentWeek?.daily || []}
            previousWeekDaily={weeklyData?.previousWeek?.daily || []}
            height={280}
          />
        </Card>
      </div>

      {/* Row 2: Category Breakdown & Late-Night Sleep Impact */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Categories (6 cols) */}
        <Card className="lg:col-span-6">
          <CardHeader>
            <div>
              <CardTitle>
                <Layers className="w-4 h-4 text-emerald-400" />
                Category Allocation Breakdown
              </CardTitle>
              <p className="text-xs text-slate-400 mt-1">
                Proportionate distribution of time across distinct activity categories.
              </p>
            </div>
          </CardHeader>
          <CategoryPieChart data={categoryData} />

          <div className="mt-4 pt-3 border-t border-slate-800 space-y-2">
            {categoryData.slice(0, 4).map((c) => (
              <div key={c.category} className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: CATEGORY_COLORS[c.category] || '#94a3b8' }}
                  />
                  {c.category}
                </span>
                <span className="text-slate-400">
                  <strong className="text-white">{formatMinutesToHours(c.totalMinutes)}</strong> (
                  {c.percentage}%)
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Late-Night Usage & Sleep Impact (6 cols) */}
        <Card className="lg:col-span-6 flex flex-col justify-between">
          <div>
            <CardHeader>
              <div>
                <CardTitle>
                  <Moon className="w-4 h-4 text-indigo-400" />
                  Late-Night Usage & Circadian Impact
                </CardTitle>
                <p className="text-xs text-slate-400 mt-1">
                  Analysis of screen activity past your configured bedtime ({bedtime}).
                </p>
              </div>
              <Badge variant={lateNightMinutes > 30 ? 'rose' : 'emerald'} size="sm">
                {lateNightMinutes > 30 ? 'Disruptive' : 'Healthy Boundary'}
              </Badge>
            </CardHeader>

            <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 mb-4 space-y-2">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-slate-300">Total Bedtime Screen Exposure:</span>
                <span className="text-2xl font-black text-indigo-300">
                  {formatMinutesToHours(lateNightMinutes)}
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Short-wavelength blue light within 60 minutes of sleep suppresses melatonin release and shifts circadian rhythm by up to 1.5 hours.
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60">
                <span className="text-slate-400">Configured Bedtime</span>
                <span className="font-semibold text-white">{bedtime}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60">
                <span className="text-slate-400">Tolerance Threshold</span>
                <span className="font-semibold text-white">45 minutes past bedtime</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60">
                <span className="text-slate-400">Late-Night Status</span>
                <span
                  className={`font-semibold ${
                    lateNightMinutes === 0
                      ? 'text-emerald-400'
                      : lateNightMinutes > 45
                      ? 'text-rose-400'
                      : 'text-amber-400'
                  }`}
                >
                  {lateNightMinutes === 0
                    ? 'Protected (0m active)'
                    : `${lateNightMinutes}m logged past bedtime`}
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Row 3: Transparent Wellbeing Score Mathematical Audit */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              Transparent Wellbeing Score Formula & Audit
            </CardTitle>
            <p className="text-xs text-slate-400 mt-1">
              Fully explainable mathematical scoring breakdown without proprietary black-boxes.
            </p>
          </div>
          <Badge
            variant={
              classification.status === 'Balanced'
                ? 'emerald'
                : classification.status === 'Needs Attention'
                ? 'amber'
                : 'rose'
            }
            size="lg"
          >
            {score} / 100 ({classification.status})
          </Badge>
        </CardHeader>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              1. Goal Adherence
            </span>
            <span className="text-xl font-black text-emerald-400">
              {components.goalAdherence?.points || 0}{' '}
              <span className="text-xs text-slate-500 font-normal">/ 35 pts</span>
            </span>
            <p className="text-[11px] text-slate-400">{components.goalAdherence?.description}</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              2. Sleep Protection
            </span>
            <span className="text-xl font-black text-indigo-400">
              {components.lateNight?.points || 0}{' '}
              <span className="text-xs text-slate-500 font-normal">/ 25 pts</span>
            </span>
            <p className="text-[11px] text-slate-400">{components.lateNight?.description}</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              3. Session Health
            </span>
            <span className="text-xl font-black text-cyan-400">
              {components.sessionHealth?.points || 0}{' '}
              <span className="text-xs text-slate-500 font-normal">/ 20 pts</span>
            </span>
            <p className="text-[11px] text-slate-400">{components.sessionHealth?.description}</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              4. Focus Consistency
            </span>
            <span className="text-xl font-black text-amber-400">
              {components.focusConsistency?.points || 0}{' '}
              <span className="text-xs text-slate-500 font-normal">/ 20 pts</span>
            </span>
            <p className="text-[11px] text-slate-400">{components.focusConsistency?.description}</p>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs text-slate-400 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <span className="text-slate-200 font-semibold block">Scoring Formula Specification:</span>
            <p className="mt-0.5 leading-relaxed">{formulaSummary}</p>
            <span className="text-[11px] text-slate-500 block mt-1 italic">
              * Informational behavioral guidance only. Does not constitute a clinical or medical diagnosis.
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default AnalyticsPage;
