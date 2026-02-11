import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useFetch } from '../../hooks/useFetch';
import { getDevices } from '../../api/analytics';
import LoadingSpinner from '../shared/LoadingSpinner';

const COLORS = ['#6366f1', '#06b6d4', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function DeviceChart({ videoId }) {
  const { data, loading } = useFetch(() => getDevices(videoId), [videoId]);

  if (loading) return <LoadingSpinner />;
  if (!data || data.length === 0) return null;

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Device Breakdown</h3>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie data={data} dataKey="count" nameKey="device_type" cx="50%" cy="50%" outerRadius={80} innerRadius={40} paddingAngle={3}>
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
