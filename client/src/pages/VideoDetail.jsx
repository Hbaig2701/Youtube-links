import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { ArrowLeft, ExternalLink, CalendarCheck, Clock } from 'lucide-react';
import { useFetch } from '../hooks/useFetch';
import { getVideo, getVideoLinks } from '../api/videos';
import { getVideoBookings } from '../api/bookings';
import StatCard from '../components/shared/StatCard';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import CopyUrlButton from '../components/links/CopyUrlButton';
import ClickTimeline from '../components/analytics/ClickTimeline';
import DeviceChart from '../components/analytics/DeviceChart';
import GeoChart from '../components/analytics/GeoChart';
import { safeParseDate } from '../utils/dates';

function formatTime(seconds) {
  if (!seconds) return '—';
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
  return `${Math.round(seconds / 3600)}h`;
}

const statusColors = {
  confirmed: 'bg-blue-50 text-blue-700',
  completed: 'bg-green-50 text-green-700',
  cancelled: 'bg-red-50 text-red-700',
  'no-show': 'bg-yellow-50 text-yellow-700',
};

export default function VideoDetail() {
  const { id } = useParams();
  const [selectedLinkId, setSelectedLinkId] = useState(null);
  const { data: video, loading: videoLoading } = useFetch(() => getVideo(id), [id]);
  const { data: links, loading: linksLoading } = useFetch(() => getVideoLinks(id), [id]);
  const { data: bookings, loading: bookingsLoading } = useFetch(() => getVideoBookings(id), [id]);

  if (videoLoading) return <LoadingSpinner />;
  if (!video) return <p className="text-red-500">Video not found</p>;

  const totalBookings = bookings?.filter(b => b.status !== 'cancelled').length || 0;
  const bookingClicks = links?.filter(l => l.is_booking_link === 1).reduce((sum, l) => sum + l.total_clicks, 0) || 0;
  const conversionRate = bookingClicks > 0 ? Math.round((totalBookings / bookingClicks) * 1000) / 10 : 0;

  return (
    <div className="space-y-6">
      <div>
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-3">
          <ArrowLeft size={14} /> Back to Dashboard
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-gray-900">{video.title}</h2>
              {video.source_type === 'community' && (
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-purple-50 text-purple-700">Community</span>
              )}
              {video.source_type === 'linktree' && (
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-green-50 text-green-700">Linktree</span>
              )}
            </div>
            <p className="text-sm text-gray-400 mt-1">/{video.slug}</p>
          </div>
          {video.source_type === 'youtube' && video.youtube_url && (
            <a
              href={video.youtube_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
            >
              YouTube <ExternalLink size={14} />
            </a>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Clicks" value={video.total_clicks} />
        <StatCard label="Bookings" value={totalBookings} />
        <StatCard label="Conversion" value={conversionRate > 0 ? `${conversionRate}%` : '—'} />
        <StatCard label="Active Links" value={video.link_count} />
      </div>

      {/* Links table */}
      <div className="rounded-xl bg-white shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900">Links</h3>
        </div>
        {linksLoading ? (
          <LoadingSpinner />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left px-6 py-3 font-medium text-gray-500">Label</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">Destination</th>
                  <th className="text-right px-6 py-3 font-medium text-gray-500">Clicks</th>
                  <th className="text-right px-6 py-3 font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {links?.map((link) => (
                  <tr key={link.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-6 py-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
                        {link.label}
                      </span>
                      {link.is_booking_link === 1 && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">
                          Booking
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-3 text-gray-500 truncate max-w-xs">{link.destination_url}</td>
                    <td className="text-right px-6 py-3 font-semibold text-gray-900">{link.total_clicks.toLocaleString()}</td>
                    <td className="text-right px-6 py-3">
                      <CopyUrlButton slug={video.slug} label={link.label} domain={video.domain} />
                    </td>
                  </tr>
                ))}
                {links?.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-400">No links yet</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ClickTimeline videoId={id} linkId={selectedLinkId} links={links} onLinkChange={setSelectedLinkId} />

      {/* Bookings table */}
      <div className="rounded-xl bg-white shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <CalendarCheck size={16} className="text-green-600" /> Bookings
          </h3>
        </div>
        {bookingsLoading ? (
          <LoadingSpinner />
        ) : bookings && bookings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left px-6 py-3 font-medium text-gray-500">Contact</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">Link</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">Status</th>
                  <th className="text-right px-6 py-3 font-medium text-gray-500">Time to Book</th>
                  <th className="text-right px-6 py-3 font-medium text-gray-500">Booked</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-6 py-3">
                      <p className="font-medium text-gray-900">{b.contact_name}</p>
                      {b.contact_email && <p className="text-xs text-gray-400">{b.contact_email}</p>}
                    </td>
                    <td className="px-6 py-3">
                      {b.link_label ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
                          {b.link_label}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">Unattributed</span>
                      )}
                    </td>
                    <td className="px-6 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[b.status] || 'bg-gray-50 text-gray-600'}`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="text-right px-6 py-3 text-gray-600">
                      {b.time_to_book_seconds ? (
                        <span className="flex items-center justify-end gap-1">
                          <Clock size={12} /> {formatTime(b.time_to_book_seconds)}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="text-right px-6 py-3 text-gray-500 text-xs">
                      {(() => {
                        const d = safeParseDate(b.booked_at);
                        return d ? d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : '—';
                      })()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-8 text-center text-gray-400">
            <p>No bookings yet</p>
            <p className="text-xs mt-1">Bookings will appear here when viewers book through your GHL booking links</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DeviceChart videoId={id} />
        <GeoChart videoId={id} />
      </div>
    </div>
  );
}
