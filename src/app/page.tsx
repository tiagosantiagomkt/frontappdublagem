'use client';

import VideoSearch from '@/components/VideoSearch';
import { useState } from 'react';

export default function Home() {
  const [videoUrl, setVideoUrl] = useState('');

  const handleSubmit = async (url: string) => {
    // TODO: Implementar lógica de processamento do vídeo
    console.log('Processando vídeo:', url);
  };

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-text-primary text-center mb-4">
          App de Dublagem
        </h1>
        <p className="text-text-secondary text-center mb-12">
          Cole o link do seu vídeo abaixo para começar a dublagem
        </p>
        
        <VideoSearch onSubmit={handleSubmit} />
      </div>
    </main>
  );
} 