import { useState } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface VideoSearchProps {
  onSubmit: (url: string) => void;
}

export default function VideoSearch({ onSubmit }: VideoSearchProps) {
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onSubmit(url.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative flex items-center">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Cole o link do vídeo aqui"
          className="w-full px-4 py-3 pr-12 rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-text-primary placeholder:text-text-secondary"
          required
        />
        <button
          type="submit"
          className="absolute right-2 p-2 rounded-md bg-primary text-white hover:bg-primary-hover transition-colors"
          disabled={!url.trim()}
        >
          <MagnifyingGlassIcon className="w-5 h-5" />
        </button>
      </div>
    </form>
  );
} 