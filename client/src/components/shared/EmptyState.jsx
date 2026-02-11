export default function EmptyState({ message = 'No data yet', children }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-gray-500">
      <p className="text-lg">{message}</p>
      {children}
    </div>
  );
}
