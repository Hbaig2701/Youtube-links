import { CalendarCheck, Clock } from 'lucide-react';

function formatTime(seconds) {
  if (!seconds) return null;
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
  return `${Math.round(seconds / 3600)}h`;
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr + (dateStr.endsWith('Z') ? '' : 'Z')).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const statusColors = {
  confirmed: 'bg-blue-50 text-blue-700',
  completed: 'bg-green-50 text-green-700',
  cancelled: 'bg-red-50 text-red-700',
  'no-show': 'bg-yellow-50 text-yellow-700',
};

export default function RecentBookings({ bookings }) {
  if (!bookings || bookings.length === 0) return null;

  return (
    <div className="rounded-xl bg-white shadow-sm border border-gray-100">
      <div className="px-6 py-4 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-900">Recent Bookings</h3>
      </div>
      <div className="divide-y divide-gray-50">
        {bookings.map((b) => (
          <div key={b.id} className="px-6 py-3 flex items-center gap-4">
            <CalendarCheck size={16} className="text-green-500 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900">
                <span className="font-medium">{b.contact_name}</span>
                {b.contact_email && <span className="text-gray-400 ml-1.5 text-xs">{b.contact_email}</span>}
              </p>
              <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-400">
                {b.video_title && <span>{b.video_title}</span>}
                {b.link_label && (
                  <>
                    <span className="inline-block w-0.5 h-0.5 rounded-full bg-gray-300" />
                    <span className="text-indigo-500">{b.link_label}</span>
                  </>
                )}
                {b.time_to_book_seconds && (
                  <>
                    <span className="inline-block w-0.5 h-0.5 rounded-full bg-gray-300" />
                    <span className="flex items-center gap-0.5"><Clock size={10} /> {formatTime(b.time_to_book_seconds)}</span>
                  </>
                )}
              </div>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[b.status] || 'bg-gray-50 text-gray-600'}`}>
              {b.status}
            </span>
            <span className="text-xs text-gray-400 shrink-0">{timeAgo(b.booked_at)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
