import StatCard from '../shared/StatCard';

function formatTime(seconds) {
  if (!seconds) return '—';
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
  return `${Math.round(seconds / 3600)}h`;
}

export default function SummaryCards({ clicks, bookings, conversion, avgTimeToBook }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard label="Total Clicks" value={clicks?.total_all_time} sub={`${clicks?.total_7d || 0} last 7d`} />
      <StatCard label="Total Bookings" value={bookings?.total_all_time} sub={`${bookings?.total_7d || 0} last 7d`} />
      <StatCard
        label="Conversion Rate"
        value={conversion?.rate != null ? `${conversion.rate}%` : '—'}
        sub={conversion?.bookings != null ? `${conversion.bookings} of ${conversion.clicks} booking clicks` : null}
      />
      <StatCard label="Avg Time to Book" value={formatTime(avgTimeToBook)} sub="From click to booking" />
    </div>
  );
}
