import { useState } from 'react';
import { Trash2, Star, Globe } from 'lucide-react';
import { useFetch } from '../hooks/useFetch';
import { getDomains, createDomain, updateDomain, deleteDomain } from '../api/domains';
import LoadingSpinner from '../components/shared/LoadingSpinner';

export default function Domains() {
  const { data: domains, loading, refetch } = useFetch(() => getDomains(), []);
  const [domain, setDomain] = useState('');
  const [label, setLabel] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!domain.trim() || !label.trim()) return;
    setSubmitting(true);
    try {
      await createDomain({ domain: domain.trim(), label: label.trim() });
      setDomain('');
      setLabel('');
      refetch();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSetDefault = async (id) => {
    await updateDomain(id, { is_default: true });
    refetch();
  };

  const handleDelete = async (id) => {
    if (!confirm('Remove this domain? Videos using it will fall back to the default domain.')) return;
    await deleteDomain(id);
    refetch();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Domains</h2>
        <p className="text-sm text-gray-500 mt-1">
          Add the domains you'll use for redirect links. Each video can use a different domain.
        </p>
      </div>

      <div className="rounded-xl bg-white shadow-sm border border-gray-100 p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Add Domain</h3>
        <form onSubmit={handleAdd} className="flex flex-wrap items-end gap-3">
          <div className="min-w-[250px]">
            <label className="block text-xs font-medium text-gray-500 mb-1">Domain *</label>
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="e.g., go.hamzaautomates.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono"
              required
            />
          </div>
          <div className="min-w-[180px]">
            <label className="block text-xs font-medium text-gray-500 mb-1">Label *</label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g., Main Business"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {submitting ? 'Adding...' : 'Add Domain'}
          </button>
        </form>
        <p className="text-xs text-gray-400 mt-3">
          Enter just the domain (no https://). Point a DNS CNAME record to wherever you deploy this app.
        </p>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : domains?.length === 0 ? (
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-6 text-center">
          <Globe className="mx-auto text-amber-500 mb-2" size={24} />
          <p className="text-sm text-amber-800 font-medium">No domains configured</p>
          <p className="text-xs text-amber-600 mt-1">Add a domain above. For local testing, you can add <code className="bg-amber-100 px-1 rounded">localhost:5173</code></p>
        </div>
      ) : (
        <div className="space-y-3">
          {domains?.map((d) => (
            <div key={d.id} className="rounded-xl bg-white shadow-sm border border-gray-100 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
                  <Globe size={18} className="text-indigo-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-gray-900 font-mono">{d.domain}</p>
                    {d.is_default && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700 border border-yellow-200">
                        <Star size={10} className="mr-1" /> Default
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400">{d.label}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {d.is_default !== 1 && (
                  <button
                    onClick={() => handleSetDefault(d.id)}
                    className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Set as Default
                  </button>
                )}
                <button
                  onClick={() => handleDelete(d.id)}
                  className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-xl bg-gray-50 border border-gray-200 p-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">How it works</h3>
        <ul className="text-xs text-gray-500 space-y-1.5">
          <li>1. Add your domains here (e.g., <code className="bg-gray-200 px-1 rounded">go.hamzaautomates.com</code>)</li>
          <li>2. Point each domain's DNS CNAME to your deployment URL</li>
          <li>3. When creating a video, pick which domain to use for its links</li>
          <li>4. The "Copy URL" button will use the correct domain automatically</li>
        </ul>
      </div>
    </div>
  );
}
