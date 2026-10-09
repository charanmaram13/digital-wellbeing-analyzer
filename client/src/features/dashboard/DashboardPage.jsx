import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import analyticsApi from '../../services/analyticsApi.js';
import recommendationApi from '../../services/recommendationApi.js';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Spinner } from '../../components/ui/Spinner.jsx';
import { EmptyState } from '../../components/ui/EmptyState.jsx';
import MetricCard from '../../components/dashboard/MetricCard.jsx';
import DemoBanner from '../../components/dashboard/DemoBanner.jsx';
import DailyTrendChart from '../../components/charts/DailyTrendChart.jsx';
import CategoryPieChart from '../../components/charts/CategoryPieChart.jsx';
import TopAppsBarChart from '../../components/charts/TopAppsBarChart.jsx';
import WellbeingScoreGauge from '../../components/charts/WellbeingScoreGauge.jsx';
import RecommendationCard from '../../components/insights/RecommendationCard.jsx';
import CsvImportModal from '../screenTime/CsvImportModal.jsx';
import { formatMinutesToHours } from '../../utils/formatters.js';
import {
  Clock,
  Calendar,
  Smartphone,
  Target,
  Sparkles,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Layers,
} from 'lucide-react';

export function DashboardPage() {
  const { openAddModal } = useOutletContext() || {};
  const [overview, setOverview] = useState(null);
  const [dailyData, setDailyData] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const results = await Promise.allSettled([
        analyticsApi.getOverview(),
        analyticsApi.getDaily(),
        recommendationApi.getRecommendations({ status: 'active' }),
      ]);

      const [overviewResult, dailyResult, recsResult] = results;

      if (overviewResult.status === 'fulfilled') {
        setOverview(overviewResult.value);
      } else {
        throw overviewResult.reason;
      }

      if (dailyResult.status === 'fulfilled') {
        setDailyData(dailyResult.value?.dailyAggregates || []);
      }

      if (recsResult.status === 'fulfilled') {
        setRecommendations(recsResult.value || []);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to load dashboard analytics');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();

    const handleUpdate = () => loadDashboard();
    window.addEventListener('screentime-updated', handleUpdate);
    return () => window.removeEventListener('screentime-updated', handleUpdate);
  }, [loadDashboard]);

  const handleUpdateRecStatus = async (id, status) => {
    try {
      await recommendationApi.updateStatus(id, status);
      setRecommendations((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      alert(err.message || 'Failed to update recommendation');
    }
  };

  const handleDeleteRec = async (id) => {
    try {
      await recommendationApi.delete(id);
      setRecommendations((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      alert(err.message || 'Failed to dismiss recommendation');
    }
  };

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

  const {
    today = {},
    dailyAverageMinutes = 0,
    topApps = [],
    topCategories = [],
    score = 100,
    scoreBreakdown = {},
    classification = {},
    baselineComparison = null,
    patterns = [],
    settings = {},
    hasData = false,
  } = overview || {};

  const mostUsedApp = topApps.length > 0 ? topApps[0] : null;

  // Week over week trend
  let wowTrend = null;
  if (baselineComparison && baselineComparison.percentageChange !== null) {
    const isIncrease = baselineComparison.percentageChange > 0;
    wowTrend = {
      type: isIncrease ? 'increase' : 'decrease',
      label: `${Math.abs(baselineComparison.percentageChange)}% vs prior week`,
    };
  } else if (baselineComparison?.status === 'new_usage') {
    wowTrend = {
      type: 'neutral',
      label: 'New baseline recording',
    };
  }

  return (
    <div className="space-y-6">
      {/* Demo Banner if active */}
      <DemoBanner
        onOpenImport={() => setIsImportModalOpen(true)}
        onOpenAdd={openAddModal}
      />

      {/* 6 Key Dashboard Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* 1. Screen Time Today */}
        <MetricCard
          title="Screen Time Today"
          value={formatMinutesToHours(today.totalMinutes)}
          subvalue={`Goal: ${formatMinutesToHours(today.goalMinutes)}`}
          icon={Clock}
          color={today.isOverGoal ? 'rose' : 'emerald'}
          trend={
            today.isOverGoal
              ? { type: 'increase', label: 'Over target' }
              : { type: 'decrease', label: 'Within target' }
          }
        />

        {/* 2. Daily Average */}
        <MetricCard
          title="7-Day Daily Avg"
          value={formatMinutesToHours(dailyAverageMinutes)}
          subvalue="Across recent 7 days"
          icon={Calendar}
          color="violet"
        />

        {/* 3. Most Used Application */}
        <MetricCard
          title="Most Used App"
          value={mostUsedApp ? mostUsedApp.applicationName : 'None'}
          subvalue={
            mostUsedApp
              ? `${formatMinutesToHours(mostUsedApp.totalMinutes)} (${mostUsedApp.percentage}%)`
              : 'No app logged'
          }
          icon={Smartphone}
          color="blue"
        />

        {/* 4. Goal Progress */}
        <MetricCard
          title="Goal Progress"
          value={`${today.progressPercent || 0}%`}
          subvalue={
            today.isOverGoal
              ? `Exceeded by ${today.totalMinutes - today.goalMinutes}m`
              : `${today.goalMinutes - (today.totalMinutes || 0)}m remaining`
          }
          icon={Target}
          color={today.isOverGoal ? 'rose' : 'amber'}
        />

        {/* 5. Week-over-Week Change */}
        <MetricCard
          title="Week-over-Week"
          value={
            baselineComparison && baselineComparison.percentageChange !== null
              ? `${baselineComparison.percentageChange > 0 ? '+' : ''}${
                  baselineComparison.percentageChange
                }%`
              : 'Baseline Active'
          }
          subvalue={
            baselineComparison?.hasSufficientBaseline
              ? `${baselineComparison.absoluteChange > 0 ? '+' : ''}${formatMinutesToHours(
                  baselineComparison.absoluteChange
                )}`
              : 'Building history'
          }
          icon={TrendingUp}
          color="cyan"
          trend={wowTrend}
        />

        {/* 6. Wellbeing Score */}
        <MetricCard
          title="Wellbeing Score"
          value={`${score}/100`}
          subvalue={classification.status || 'Balanced'}
          icon={Sparkles}
          color={score >= 75 ? 'emerald' : score >= 50 ? 'amber' : 'rose'}
        />
      </div>

      {/* Main Grid: Wellbeing Score Breakdown & Daily Usage Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Wellbeing Score Gauge Card (5 cols) */}
        <Card className="lg:col-span-5">
          <CardHeader>
            <div>
              <CardTitle>
                <Sparkles className="w-5 h-5 text-emerald-400" />
                Digital Wellbeing Score
              </CardTitle>
              <p className="text-xs text-slate-400 mt-1">
                Transparent 0–100 behavioral composite index.
              </p>
            </div>
            <Link to="/analytics">
              <Button variant="ghost" size="sm" className="text-xs">
                Audit Details <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </CardHeader>

          <WellbeingScoreGauge
            score={score}
            classification={classification}
            breakdown={scoreBreakdown}
          />
        </Card>

        {/* Daily Trend Chart (7 cols) */}
        <Card className="lg:col-span-7">
          <CardHeader>
            <div>
              <CardTitle>
                <Clock className="w-5 h-5 text-emerald-400" />
                Daily Screen Time Trend
              </CardTitle>
              <p className="text-xs text-slate-400 mt-1">
                Total usage vs configured daily goal ({formatMinutesToHours(settings.dailyScreenTimeGoalMinutes)}).
              </p>
            </div>
            <Link to="/analytics">
              <Button variant="ghost" size="sm" className="text-xs">
                Deep Dive <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </CardHeader>

          <DailyTrendChart
            data={dailyData}
            goalMinutes={settings.dailyScreenTimeGoalMinutes || 360}
          />
        </Card>
      </div>

      {/* Visualizations: Category Distribution & Top Apps */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Category Breakdown (6 cols) */}
        <Card className="lg:col-span-6">
          <CardHeader>
            <div>
              <CardTitle>Category Distribution</CardTitle>
              <p className="text-xs text-slate-400 mt-1">
                Time committed across productivity, entertainment, social, and work.
              </p>
            </div>
          </CardHeader>
          <CategoryPieChart data={topCategories} />
        </Card>

        {/* Top Applications (6 cols) */}
        <Card className="lg:col-span-6">
          <CardHeader>
            <div>
              <CardTitle>Top Applications</CardTitle>
              <p className="text-xs text-slate-400 mt-1">
                Highest duration applications in the current window.
              </p>
            </div>
          </CardHeader>
          <TopAppsBarChart data={topApps} />
        </Card>
      </div>

      {/* Detected Patterns & AI Recommendations Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Active Behavioral Alerts (5 cols) */}
        <Card className="lg:col-span-5">
          <CardHeader>
            <div>
              <CardTitle>
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                Active Pattern Alerts ({patterns.length})
              </CardTitle>
              <p className="text-xs text-slate-400 mt-1">
                Algorithmic anomaly detection based on your settings.
              </p>
            </div>
            <Link to="/patterns">
              <Button variant="ghost" size="sm" className="text-xs">
                View All
              </Button>
            </Link>
          </CardHeader>

          {patterns.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              <span className="text-emerald-400 font-bold block text-sm mb-1">
                ✓ No Problematic Patterns
              </span>
              Your device usage is well within your goal, bedtime, and session duration parameters.
            </div>
          ) : (
            <div className="space-y-3">
              {patterns.slice(0, 3).map((pattern, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-xl border text-xs space-y-1 ${
                    pattern.severity === 'high'
                      ? 'bg-rose-500/10 border-rose-500/30 text-rose-200'
                      : 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      {pattern.title}
                    </span>
                    <Badge variant={pattern.severity === 'high' ? 'rose' : 'amber'} size="sm">
                      {pattern.severity.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-slate-300 leading-relaxed">{pattern.description}</p>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* AI Recommendations (7 cols) */}
        <Card className="lg:col-span-7">
          <CardHeader>
            <div>
              <CardTitle>
                <Sparkles className="w-5 h-5 text-emerald-400" />
                Personalized AI Recommendations
              </CardTitle>
              <p className="text-xs text-slate-400 mt-1">
                Practical, achievable habit adjustments generated by Gemini AI.
              </p>
            </div>
            <Link to="/insights">
              <Button variant="primary" size="sm" className="text-xs font-bold">
                Generate / Manage <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </CardHeader>

          {recommendations.length === 0 ? (
            <EmptyState
              icon={Sparkles}
              title="No Active Recommendations"
              description="Generate personalized behavioral strategies with Gemini based on your current 14-day metrics."
              actionLabel="Generate AI Insights"
              onAction={() => (window.location.href = '/insights')}
            />
          ) : (
            <div className="space-y-3">
              {recommendations.slice(0, 2).map((rec) => (
                <RecommendationCard
                  key={rec._id}
                  recommendation={rec}
                  onUpdateStatus={handleUpdateRecStatus}
                  onDelete={handleDeleteRec}
                />
              ))}
            </div>
          )}
        </Card>
      </div>

      <CsvImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={() => loadDashboard()}
      />
    </div>
  );
}

export default DashboardPage;
