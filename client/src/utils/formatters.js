export function formatMinutesToHours(totalMinutes) {
  if (totalMinutes == null || isNaN(totalMinutes)) return '0m';
  const mins = Math.round(totalMinutes);
  const hours = Math.floor(mins / 60);
  const remainingMins = mins % 60;

  if (hours === 0) return `${remainingMins}m`;
  if (remainingMins === 0) return `${hours}h`;
  return `${hours}h ${remainingMins}m`;
}

export function formatDate(dateStr) {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatDayShort(dateStr) {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString('en-US', { weekday: 'short' });
}

export function formatTime24to12(timeStr) {
  if (!timeStr) return '';
  const [hours, minutes] = timeStr.split(':').map(Number);
  if (isNaN(hours)) return timeStr;
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  const displayMins = minutes < 10 ? `0${minutes}` : minutes;
  return `${displayHours}:${displayMins} ${ampm}`;
}

export const CATEGORY_COLORS = {
  Productivity: '#10b981', // emerald
  Entertainment: '#8b5cf6', // violet
  Social: '#ec4899', // pink
  Communication: '#3b82f6', // blue
  Gaming: '#f59e0b', // amber
  Utilities: '#64748b', // slate
  Other: '#94a3b8',
};

export function getCategoryBadgeClass(category) {
  switch (category) {
    case 'Productivity':
      return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
    case 'Entertainment':
      return 'bg-violet-500/15 text-violet-400 border-violet-500/30';
    case 'Social':
      return 'bg-pink-500/15 text-pink-400 border-pink-500/30';
    case 'Communication':
      return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
    case 'Gaming':
      return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
    case 'Utilities':
      return 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30';
    default:
      return 'bg-slate-500/15 text-slate-400 border-slate-500/30';
  }
}
