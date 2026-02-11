import { useState, useEffect } from 'react';
import { Save, Copy, Check, Shield } from 'lucide-react';
import { useFetch } from '../hooks/useFetch';
import { getSettings, updateSettings } from '../api/settings';
import LoadingSpinner from '../components/shared/LoadingSpinner';

export default function Settings() {
  const { data: settings, loading, refetch } = useFetch(() => getSettings(), []);
  const [webhookSecret, setWebhookSecret] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (settings) {
      setWebhookSecret(settings.ghl_webhook_secret || '');
    }
  }, [settings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSettings({ ghl_webhook_secret: webhookSecret });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      refetch();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const generateSecret = () => {
    const arr = new Uint8Array(24);
    crypto.getRandomValues(arr);
    setWebhookSecret(Array.from(arr, b => b.toString(16).padStart(2, '0')).join(''));
  };

  const webhookUrl = `${window.location.origin}/api/webhooks/ghl`;

  const copyUrl = async () => {
    await navigator.clipboard.writeText(webhookSecret ? `${webhookUrl}?secret=${webhookSecret}` : webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Settings</h2>

      {/* GHL Webhook */}
      <div className="rounded-xl bg-white shadow-sm border border-gray-100 p-6 space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <Shield size={16} className="text-indigo-600" /> GoHighLevel Webhook
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            Configure GHL to send appointment webhooks to this app for conversion tracking.
          </p>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Webhook URL</label>
          <div className="flex items-center gap-2">
            <code className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-mono text-gray-700 truncate">
              {webhookUrl}
            </code>
            <button
              onClick={copyUrl}
              className="px-3 py-2 text-sm font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-1.5"
            >
              {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Webhook Secret (optional)</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={webhookSecret}
              onChange={(e) => setWebhookSecret(e.target.value)}
              placeholder="Leave blank to accept all webhooks"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono"
            />
            <button
              onClick={generateSecret}
              className="px-3 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors whitespace-nowrap"
            >
              Generate
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            If set, GHL must send this as <code className="bg-gray-100 px-1 rounded">?secret=YOUR_SECRET</code> or in the <code className="bg-gray-100 px-1 rounded">x-webhook-secret</code> header.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center gap-2"
        >
          {saved ? <Check size={14} /> : <Save size={14} />}
          {saved ? 'Saved!' : saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      {/* Setup Instructions */}
      <div className="rounded-xl bg-gray-50 border border-gray-200 p-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">GHL Setup Instructions</h3>
        <ol className="text-xs text-gray-500 space-y-2 list-decimal list-inside">
          <li>In GoHighLevel, go to <strong>Automations</strong></li>
          <li>Create a new workflow triggered by <strong>"Appointment Status"</strong> events (Created, Cancelled, No-Show, etc.)</li>
          <li>Add a <strong>"Send Webhook"</strong> action</li>
          <li>
            Set the URL to: <code className="bg-gray-200 px-1 rounded">{webhookUrl}{webhookSecret ? `?secret=${webhookSecret}` : ''}</code>
          </li>
          <li>Set method to <strong>POST</strong> and content type to <strong>application/json</strong></li>
          <li>The app will automatically match bookings to clicks using UTM parameters</li>
        </ol>
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-xs text-amber-800">
            <strong>Important:</strong> Make sure your GHL booking page preserves UTM parameters. When a viewer clicks your tracked link,
            the redirect adds UTMs to the booking URL. GHL should capture these and include them in the webhook payload for attribution to work.
          </p>
        </div>
      </div>
    </div>
  );
}
