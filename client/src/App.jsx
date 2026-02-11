import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './pages/Dashboard';
import VideoDetail from './pages/VideoDetail';
import LinkManager from './pages/LinkManager';
import Domains from './pages/Domains';
import Settings from './pages/Settings';

export default function App() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/videos/:id" element={<VideoDetail />} />
            <Route path="/manage" element={<LinkManager />} />
            <Route path="/domains" element={<Domains />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}
