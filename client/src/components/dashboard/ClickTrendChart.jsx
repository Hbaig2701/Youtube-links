import { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useFetch } from '../../hooks/useFetch';
import { getClicksOverTime } from '../../api/dashboard';
import { formatChartDate } from '../../utils/dates';
import LoadingSpinner from '../shared/LoadingSpinner';

const presets = ['today', '7d', '30d', '90d', 'all'];
const presetLabels = { today: 'Today', '7d': '7D', '30d': '30D', '90d': '90D', all: 'All' };

export default function ClickTrendChart() {
  const [range, setRange] = useState('30d');
  const [customMode, setCustomMode] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [appliedCustom, setAppliedCustom] = useState(null);

  const fetchArgs = appliedCustom
    ? { range: 'custom', startDate: appliedCustom.startDate, endDate: appliedCustom.endDate }
    : { range };

  const { data, loading } = useFetch(
    () => appliedCustom
      ? getClicksOverTime('custom', { startDate: appliedCustom.startDate, endDate: appliedCustom.endDate })
      : getClicksOverTime(range),
    [fetchArgs.range, fetchArgs.startDate, fetchArgs.endDate]
  );

  const selectPreset = (r) => {
    setRange(r);
    setCustomMode(false);
    setAppliedCustom(null);
  };

  const applyCustom = () => {
    if (startDate && endDate) {
      setAppliedCustom({ startDate, endDate });
      setRange('custom');
    }
  };

  const isActive = (r) => !appliedCustom && range === r;

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h3 className="text-sm font-semibold text-gray-900">Clicks Over Time</h3>
        <div className="flex gap-1 flex-wrap items-center">
          {presets.map(r => (
            <button
              key={r}
              onClick={() => selectPreset(r)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                isActive(r)
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              {presetLabels[r]}
            </button>
          ))}
          <button
            onClick={() => { setCustomMode(!customMode); setAppliedCustom(null); }}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              customMode || appliedCustom
                ? 'bg-indigo-100 text-indigo-700'
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            Custom
          </button>
        </div>
      </div>
      {customMode && (
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
            className="border border-gray-200 rounded-md px-2 py-1 text-xs" />
          <span className="text-xs text-gray-400">to</span>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
            className="border border-gray-200 rounded-md px-2 py-1 text-xs" />
          <button onClick={applyCustom} disabled={!startDate || !endDate}
            className="px-3 py-1 text-xs font-medium rounded-md bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 transition-colors">
            Apply
          </button>
        </div>
      )}
      {loading ? (
        <LoadingSpinner />
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={data || []}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              tickFormatter={(v) => formatChartDate(v)}
            />
            <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
            <Tooltip
              labelFormatter={(v) => formatChartDate(v, { weekday: 'short', month: 'short', day: 'numeric' })}
            />
            <Area type="monotone" dataKey="count" stroke="#6366f1" fill="#6366f1" fillOpacity={0.15} strokeWidth={2} name="Clicks" />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
