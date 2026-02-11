import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useFetch } from '../../hooks/useFetch';
import { getGeo } from '../../api/analytics';
import LoadingSpinner from '../shared/LoadingSpinner';

export default function GeoChart({ videoId }) {
  const { data, loading } = useFetch(() => getGeo(videoId), [videoId]);

  if (loading) return <LoadingSpinner />;
  if (!data || data.length === 0) return null;

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Top Countries</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data.slice(0, 10)} layout="vertical" margin={{ left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis type="number" tick={{ fontSize: 12 }} allowDecimals={false} />
          <YAxis type="category" dataKey="country" tick={{ fontSize: 12 }} width={40} />
          <Tooltip />
          <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} name="Clicks" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
