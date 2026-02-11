import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, ChevronDown, ChevronRight, Trash2, ExternalLink, Globe, Zap, Bookmark, Check } from 'lucide-react';
import { useFetch } from '../hooks/useFetch';
import { getVideos, createVideo, archiveVideo, getVideoLinks, createLink, deactivateLink } from '../api/videos';
import { getDomains } from '../api/domains';
import { getTemplates, createTemplate, deleteTemplate, applyTemplates } from '../api/templates';
import Modal from '../components/shared/Modal';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import EmptyState from '../components/shared/EmptyState';
import CopyUrlButton from '../components/links/CopyUrlButton';

// --- Saved Links (Templates) Manager ---
function SavedLinksSection({ templates, onRefresh }) {
  const [label, setLabel] = useState('');
  const [url, setUrl] = useState('');
  const [isBooking, setIsBooking] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!label.trim() || !url.trim()) return;
    setSubmitting(true);
    try {
      await createTemplate({ label: label.trim(), destination_url: url.trim(), is_booking_link: isBooking });
      setLabel('');
      setUrl('');
      setIsBooking(false);
      onRefresh();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    await deleteTemplate(id);
    onRefresh();
  };

  return (
    <div className="rounded-xl bg-white shadow-sm border border-gray-100 p-6">
      <h3 className="text-sm font-semibold text-gray-900 mb-1 flex items-center gap-2">
        <Bookmark size={16} /> Saved Links
      </h3>
      <p className="text-xs text-gray-400 mb-4">Save your common links once, then quickly attach them to any video.</p>

      <form onSubmit={handleAdd} className="flex flex-wrap items-end gap-3 mb-4">
        <div className="min-w-[140px]">
          <label className="block text-xs font-medium text-gray-500 mb-1">Label *</label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g., 1-1-call"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-medium text-gray-500 mb-1">Destination URL *</label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://apply.hamzaautomates.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
          <input
            type="checkbox"
            checked={isBooking}
            onChange={(e) => setIsBooking(e.target.checked)}
            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          Booking
        </label>
        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          Save Link
        </button>
      </form>

      {templates && templates.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {templates.map(t => (
            <div key={t.id} className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm group">
              <span className="font-medium text-gray-700">{t.label}</span>
              <span className="text-gray-400 text-xs truncate max-w-[180px]">{t.destination_url}</span>
              {t.is_booking_link === 1 && (
                <span className="text-xs text-green-600 font-medium">B</span>
              )}
              <button
                onClick={() => handleDelete(t.id)}
                className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-gray-400">No saved links yet. Add your common links above.</p>
      )}
    </div>
  );
}

// --- Quick Attach: checkboxes to pick templates ---
function QuickAttach({ videoId, templates, onDone }) {
  const [selected, setSelected] = useState(new Set());
  const [applying, setApplying] = useState(false);
  const [result, setResult] = useState(null);

  if (!templates || templates.length === 0) return null;

  const toggle = (id) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const selectAll = () => {
    if (selected.size === templates.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(templates.map(t => t.id)));
    }
  };

  const handleApply = async () => {
    if (selected.size === 0) return;
    setApplying(true);
    try {
      const res = await applyTemplates(videoId, [...selected]);
      setResult(res);
      setSelected(new Set());
      onDone();
    } catch (err) {
      alert(err.message);
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="bg-indigo-50/50 border border-indigo-100 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-semibold text-indigo-900 flex items-center gap-1.5">
          <Zap size={13} /> Quick Attach Saved Links
        </h4>
        <button onClick={selectAll} className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">
          {selected.size === templates.length ? 'Deselect All' : 'Select All'}
        </button>
      </div>
      <div className="flex flex-wrap gap-2 mb-3">
        {templates.map(t => (
          <button
            key={t.id}
            onClick={() => toggle(t.id)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
              selected.has(t.id)
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-gray-700 border-gray-200 hover:border-indigo-300'
            }`}
          >
            {selected.has(t.id) && <Check size={13} />}
            {t.label}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={handleApply}
          disabled={selected.size === 0 || applying}
          className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {applying ? 'Attaching...' : `Attach ${selected.size} link${selected.size !== 1 ? 's' : ''}`}
        </button>
        {result && (
          <p className="text-xs text-gray-500">
            {result.created.length} added
            {result.skipped.length > 0 && `, ${result.skipped.length} already existed`}
          </p>
        )}
      </div>
    </div>
  );
}

// --- Video Create Form ---
function VideoForm({ onCreated, domains }) {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [domainId, setDomainId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    try {
      await createVideo({
        title: title.trim(),
        slug: slug.trim() || undefined,
        youtube_url: youtubeUrl.trim() || undefined,
        domain_id: domainId ? Number(domainId) : undefined,
      });
      setTitle('');
      setSlug('');
      setYoutubeUrl('');
      setDomainId('');
      onCreated();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const defaultDomain = domains?.find(d => d.is_default === 1);
  const selectedDomain = domains?.find(d => d.id === Number(domainId)) || defaultDomain;

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-[200px]">
          <label className="block text-xs font-medium text-gray-500 mb-1">Video Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Top 10 Tax Tips for 2025"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </div>
        <div className="min-w-[140px]">
          <label className="block text-xs font-medium text-gray-500 mb-1">Short Slug</label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
            placeholder="e.g., tax-tips"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono"
          />
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-medium text-gray-500 mb-1">YouTube URL</label>
          <input
            type="url"
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            placeholder="https://youtube.com/watch?v=..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        {domains && domains.length > 0 && (
          <div className="min-w-[180px]">
            <label className="block text-xs font-medium text-gray-500 mb-1">Domain</label>
            <select
              value={domainId}
              onChange={(e) => setDomainId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
            >
              <option value="">Default{defaultDomain ? ` (${defaultDomain.domain})` : ''}</option>
              {domains.map(d => (
                <option key={d.id} value={d.id}>{d.label} — {d.domain}</option>
              ))}
            </select>
          </div>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {submitting ? 'Creating...' : 'Add Video'}
        </button>
      </div>
      {slug && (
        <p className="text-xs text-gray-400">
          Preview: <span className="font-mono text-indigo-500">{selectedDomain ? `https://${selectedDomain.domain}` : window.location.origin}/go/{slug}/link-label</span>
        </p>
      )}
    </form>
  );
}

// --- Manual Link Form ---
function LinkForm({ videoId, onCreated }) {
  const [label, setLabel] = useState('');
  const [destinationUrl, setDestinationUrl] = useState('');
  const [isBooking, setIsBooking] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!label.trim() || !destinationUrl.trim()) return;
    setSubmitting(true);
    try {
      await createLink(videoId, {
        label: label.trim(),
        destination_url: destinationUrl.trim(),
        is_booking_link: isBooking,
      });
      setLabel('');
      setDestinationUrl('');
      setIsBooking(false);
      onCreated();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3 bg-gray-50 rounded-lg p-4">
      <div className="min-w-[150px]">
        <label className="block text-xs font-medium text-gray-500 mb-1">Link Label *</label>
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="e.g., book-a-call"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
          required
        />
      </div>
      <div className="flex-1 min-w-[200px]">
        <label className="block text-xs font-medium text-gray-500 mb-1">Destination URL *</label>
        <input
          type="url"
          value={destinationUrl}
          onChange={(e) => setDestinationUrl(e.target.value)}
          placeholder="https://calendly.com/..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
          required
        />
      </div>
      <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
        <input
          type="checkbox"
          checked={isBooking}
          onChange={(e) => setIsBooking(e.target.checked)}
          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
        />
        Booking
      </label>
      <button
        type="submit"
        disabled={submitting}
        className="px-3 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors"
      >
        {submitting ? 'Adding...' : 'Add Link'}
      </button>
    </form>
  );
}

// --- Video Section (expandable) ---
function VideoSection({ video, templates, onRefresh }) {
  const [expanded, setExpanded] = useState(false);
  const [links, setLinks] = useState(null);
  const [linksLoading, setLinksLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const loadLinks = async () => {
    if (links) return;
    setLinksLoading(true);
    try {
      const data = await getVideoLinks(video.id);
      setLinks(data);
    } finally {
      setLinksLoading(false);
    }
  };

  const toggleExpand = () => {
    if (!expanded) loadLinks();
    setExpanded(!expanded);
  };

  const refreshLinks = async () => {
    setLinksLoading(true);
    try {
      const data = await getVideoLinks(video.id);
      setLinks(data);
    } finally {
      setLinksLoading(false);
    }
  };

  const handleArchive = async () => {
    await archiveVideo(video.id);
    setConfirmDelete(false);
    onRefresh();
  };

  const handleDeactivateLink = async (linkId) => {
    await deactivateLink(linkId);
    refreshLinks();
    onRefresh();
  };

  return (
    <div className="rounded-xl bg-white shadow-sm border border-gray-100 overflow-hidden">
      <div
        className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-gray-50/50 transition-colors"
        onClick={toggleExpand}
      >
        <div className="flex items-center gap-3">
          {expanded ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronRight size={16} className="text-gray-400" />}
          <div>
            <h3 className="text-sm font-semibold text-gray-900">{video.title}</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-xs text-gray-400 font-mono">/{video.slug}</p>
              {video.domain && (
                <span className="inline-flex items-center gap-1 text-xs text-indigo-500">
                  <Globe size={10} /> {video.domain}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-900">{video.total_clicks.toLocaleString()} clicks</p>
            <p className="text-xs text-gray-400">{video.link_count} links</p>
          </div>
          <Link
            to={`/videos/${video.id}`}
            onClick={(e) => e.stopPropagation()}
            className="text-indigo-600 hover:text-indigo-800"
          >
            <ExternalLink size={16} />
          </Link>
          <button
            onClick={(e) => { e.stopPropagation(); setConfirmDelete(true); }}
            className="text-gray-400 hover:text-red-600 transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-gray-100 px-6 py-4 space-y-4">
          <QuickAttach videoId={video.id} templates={templates} onDone={refreshLinks} />

          <LinkForm videoId={video.id} onCreated={refreshLinks} />

          {linksLoading ? (
            <LoadingSpinner />
          ) : links && links.length > 0 ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 font-medium text-gray-500">Label</th>
                  <th className="text-left py-2 font-medium text-gray-500">Destination</th>
                  <th className="text-right py-2 font-medium text-gray-500">Clicks</th>
                  <th className="text-right py-2 font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {links.map(link => (
                  <tr key={link.id} className="border-b border-gray-50">
                    <td className="py-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
                        {link.label}
                      </span>
                      {link.is_booking_link === 1 && (
                        <span className="ml-1.5 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">
                          Booking
                        </span>
                      )}
                    </td>
                    <td className="py-2 text-gray-500 truncate max-w-[200px]">{link.destination_url}</td>
                    <td className="text-right py-2 font-semibold">{link.total_clicks}</td>
                    <td className="text-right py-2">
                      <div className="flex items-center justify-end gap-2">
                        <CopyUrlButton slug={video.slug} label={link.label} domain={video.domain} />
                        <button
                          onClick={() => handleDeactivateLink(link.id)}
                          className="text-gray-400 hover:text-red-600 transition-colors p-1"
                          title="Deactivate link"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-sm text-gray-400 text-center py-4">No links yet. Attach saved links or add one manually above.</p>
          )}
        </div>
      )}

      <Modal open={confirmDelete} onClose={() => setConfirmDelete(false)} title="Archive Video">
        <p className="text-sm text-gray-600 mb-4">
          Are you sure you want to archive <strong>{video.title}</strong>? Its links will still redirect, but it will be hidden from the dashboard.
        </p>
        <div className="flex justify-end gap-3">
          <button onClick={() => setConfirmDelete(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">
            Cancel
          </button>
          <button onClick={handleArchive} className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700">
            Archive
          </button>
        </div>
      </Modal>
    </div>
  );
}

// --- Main Page ---
export default function LinkManager() {
  const { data: videos, loading, error, refetch } = useFetch(() => getVideos(), []);
  const { data: domains } = useFetch(() => getDomains(), []);
  const { data: templates, refetch: refetchTemplates } = useFetch(() => getTemplates(), []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Manage Links</h2>

      {domains && domains.length === 0 && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 flex items-center gap-3">
          <Globe size={16} className="text-amber-500 shrink-0" />
          <p className="text-sm text-amber-800">
            No domains configured yet. <Link to="/domains" className="font-medium underline">Add a domain</Link> to get branded URLs.
          </p>
        </div>
      )}

      <SavedLinksSection templates={templates} onRefresh={refetchTemplates} />

      <div className="rounded-xl bg-white shadow-sm border border-gray-100 p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Plus size={16} /> Add New Video
        </h3>
        <VideoForm onCreated={refetch} domains={domains} />
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <p className="text-red-500">Failed to load videos: {error.message}</p>
      ) : videos?.length === 0 ? (
        <EmptyState message="No videos yet. Create your first one above!" />
      ) : (
        <div className="space-y-3">
          {videos?.map(video => (
            <VideoSection key={video.id} video={video} templates={templates} onRefresh={refetch} />
          ))}
        </div>
      )}
    </div>
  );
}
