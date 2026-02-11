import clsx from 'clsx';

export default function StatCard({ label, value, sub, className }) {
  return (
    <div className={clsx('rounded-xl bg-white p-6 shadow-sm border border-gray-100', className)}>
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="mt-1 text-3xl font-bold text-gray-900">{value?.toLocaleString() ?? '—'}</p>
      {sub && <p className="mt-1 text-sm text-gray-400">{sub}</p>}
    </div>
  );
}
