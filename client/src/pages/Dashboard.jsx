import { useFetch } from '../hooks/useFetch';
import { getSummary } from '../api/dashboard';
import SummaryCards from '../components/dashboard/SummaryCards';
import ClickTrendChart from '../components/dashboard/ClickTrendChart';
import TopVideosTable from '../components/dashboard/TopVideosTable';
import RecentActivity from '../components/dashboard/RecentActivity';
import RecentBookings from '../components/dashboard/RecentBookings';
import LoadingSpinner from '../components/shared/LoadingSpinner';

export default function Dashboard() {
  const { data, loading, error } = useFetch(() => getSummary(), []);

  if (loading) return <LoadingSpinner />;
  if (error) return <p className="text-red-500">Failed to load dashboard: {error.message}</p>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>

      <SummaryCards
        clicks={data?.clicks}
        bookings={data?.bookings}
        conversion={data?.conversion}
        avgTimeToBook={data?.avgTimeToBook}
      />

      <ClickTrendChart />

      <TopVideosTable videos={data?.topVideos} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentBookings bookings={data?.recentBookings} />
        <RecentActivity activity={data?.recentActivity} />
      </div>
    </div>
  );
}
