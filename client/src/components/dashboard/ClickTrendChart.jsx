import { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useFetch } from '../../hooks/useFetch';
import { getClicksOverTime } from '../../api/dashboard';
import LoadingSpinner from '../shared/LoadingSpinner';

const ranges = ['7d', '30d', '90d', 'all'];

export default function ClickTrendChart() {
  const [range, setRange] = useState('30d');
  const { data, loading } = useFetch(() => getClicksOverTime(range), [range]);

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900">Clicks Over Time</h3>
        <div className="flex gap-1">
          {ranges.map(r => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                range === r
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              {r === 'all' ? 'All' : r.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
      {loading ? (
        <LoadingSpinner />
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={data || []}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              tickFormatter={(v) => {
                const d = new Date(v + 'T00:00:00');
                return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              }}
            />
            <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
            <Tooltip
              labelFormatter={(v) => {
                const d = new Date(v + 'T00:00:00');
                return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
              }}
            />
            <Area type="monotone" dataKey="count" stroke="#6366f1" fill="#6366f1" fillOpacity={0.15} strokeWidth={2} name="Clicks" />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
