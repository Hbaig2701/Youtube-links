import { Monitor, Smartphone, Tablet, Globe } from 'lucide-react';

const deviceIcons = {
  desktop: Monitor,
  mobile: Smartphone,
  tablet: Tablet,
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr + 'Z').getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function RecentActivity({ activity }) {
  if (!activity || activity.length === 0) return null;

  return (
    <div className="rounded-xl bg-white shadow-sm border border-gray-100">
      <div className="px-6 py-4 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-900">Recent Activity</h3>
      </div>
      <div className="divide-y divide-gray-50">
        {activity.map((click) => {
          const DeviceIcon = deviceIcons[click.device_type] || Monitor;
          return (
            <div key={click.id} className="px-6 py-3 flex items-center gap-4">
              <DeviceIcon size={16} className="text-gray-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 truncate">
                  <span className="font-medium">{click.video_title}</span>
                  <span className="text-gray-400 mx-1.5">/</span>
                  <span className="text-indigo-600">{click.label}</span>
                </p>
                <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-400">
                  <span>{click.browser}</span>
                  {click.country && (
                    <>
                      <span className="inline-block w-0.5 h-0.5 rounded-full bg-gray-300" />
                      <span className="flex items-center gap-0.5"><Globe size={10} /> {click.country}</span>
                    </>
                  )}
                </div>
              </div>
              <span className="text-xs text-gray-400 shrink-0">{timeAgo(click.clicked_at)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
