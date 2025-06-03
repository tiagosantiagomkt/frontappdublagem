import { useState } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface VideoSearchProps {
  onSubmit: (url: string) => void;
  isLoading: boolean;
}

export default function VideoSearch({ onSubmit, isLoading }: VideoSearchProps) {
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
          disabled={isLoading}
        />
        <button
          type="submit"
          className={`absolute right-2 p-2 rounded-md text-white transition-colors ${
            isLoading 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-primary hover:bg-primary-hover'
          }`}
          disabled={!url.trim() || isLoading}
        >
          {isLoading ? (
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle 
                className="opacity-25" 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="currentColor" 
                strokeWidth="4"
                fill="none"
              />
              <path 
                className="opacity-75" 
                fill="currentColor" 
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          ) : (
            <MagnifyingGlassIcon className="w-5 h-5" />
          )}
        </button>
      </div>
    </form>
  );
} 