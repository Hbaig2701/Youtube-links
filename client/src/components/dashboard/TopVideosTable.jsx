import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';

export default function TopVideosTable({ videos }) {
  if (!videos || videos.length === 0) return null;

  return (
    <div className="rounded-xl bg-white shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-900">Top Performing Videos</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="text-left px-6 py-3 font-medium text-gray-500">Video</th>
              <th className="text-right px-4 py-3 font-medium text-gray-500">Clicks</th>
              <th className="text-right px-4 py-3 font-medium text-gray-500">Bookings</th>
              <th className="text-right px-4 py-3 font-medium text-gray-500">Conv.</th>
              <th className="text-right px-6 py-3 font-medium text-gray-500"></th>
            </tr>
          </thead>
          <tbody>
            {videos.map((v) => (
              <tr key={v.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-3">
                  <Link to={`/videos/${v.id}`} className="font-medium text-gray-900 hover:text-indigo-600">
                    {v.title}
                  </Link>
                  <p className="text-xs text-gray-400 mt-0.5">{v.slug}</p>
                </td>
                <td className="text-right px-4 py-3 font-semibold text-gray-900">{v.total_clicks.toLocaleString()}</td>
                <td className="text-right px-4 py-3">
                  <span className={`font-semibold ${v.total_bookings > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                    {v.total_bookings}
                  </span>
                </td>
                <td className="text-right px-4 py-3 text-gray-600">
                  {v.conversion_rate > 0 ? `${v.conversion_rate}%` : '—'}
                </td>
                <td className="text-right px-6 py-3">
                  <Link to={`/videos/${v.id}`} className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 text-xs font-medium">
                    View <ExternalLink size={12} />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
