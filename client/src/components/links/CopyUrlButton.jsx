import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export default function CopyUrlButton({ slug, label, domain }) {
  const [copied, setCopied] = useState(false);
  const base = domain ? `https://${domain}` : window.location.origin;
  const url = `${base}/go/${slug}/${label}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
      title={url}
    >
      {copied ? <Check size={13} className="text-green-600" /> : <Copy size={13} />}
      {copied ? 'Copied!' : 'Copy URL'}
    </button>
  );
}
