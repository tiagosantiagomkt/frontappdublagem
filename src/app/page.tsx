'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [processedVideo, setProcessedVideo] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [targetLanguage, setTargetLanguage] = useState('pt');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fileInputRef.current?.files?.[0]) {
      setMessage('Por favor, selecione um vídeo para processar');
      return;
    }

    const file = fileInputRef.current.files[0];
    const formData = new FormData();
    formData.append('video', file);
    formData.append('targetLanguage', targetLanguage);

    try {
      setIsLoading(true);
      setMessage('');
      setProcessedVideo(null);
      
      console.log('Enviando vídeo para processamento...');
      
      const response = await fetch('/api/process-video', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao processar o vídeo');
      }

      // Criar URL do blob para o vídeo processado
      const videoBlob = await response.blob();
      const videoUrl = URL.createObjectURL(videoBlob);
      setProcessedVideo(videoUrl);
      setMessage('Vídeo processado com sucesso!');
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Erro ao processar vídeo:', error);
      setMessage(error instanceof Error ? error.message : 'Erro ao processar o vídeo');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-text-primary text-center mb-4">
          App de Dublagem
        </h1>
        <p className="text-text-secondary text-center mb-12">
          Selecione um vídeo para começar a dublagem
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col space-y-4">
            <label htmlFor="video" className="text-text-primary font-medium">
              Selecione o vídeo:
            </label>
            <input
              type="file"
              id="video"
              ref={fileInputRef}
              accept="video/*"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              disabled={isLoading}
            />
          </div>

          <div className="flex flex-col space-y-4">
            <label htmlFor="language" className="text-text-primary font-medium">
              Idioma de destino:
            </label>
            <select
              id="language"
              value={targetLanguage}
              onChange={(e) => setTargetLanguage(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              disabled={isLoading}
            >
              <option value="pt">Português</option>
              <option value="en">Inglês</option>
              <option value="es">Espanhol</option>
              <option value="fr">Francês</option>
              <option value="de">Alemão</option>
              <option value="it">Italiano</option>
              <option value="ja">Japonês</option>
              <option value="ko">Coreano</option>
              <option value="zh">Chinês</option>
            </select>
          </div>

          <button
            type="submit"
            className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-colors ${
              isLoading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-primary hover:bg-primary-hover'
            }`}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
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
                Processando...
              </div>
            ) : (
              'Processar Vídeo'
            )}
          </button>
        </form>
        
        {message && (
          <div 
            className={`mt-4 p-4 rounded-lg text-center ${
              message.includes('sucesso')
                ? 'bg-green-100 text-green-700' 
                : 'bg-red-100 text-red-700'
            }`}
          >
            {message}
          </div>
        )}

        {processedVideo && (
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h2 className="text-xl font-semibold text-text-primary mb-4">
              Vídeo Processado
            </h2>
            <div className="aspect-video rounded-lg overflow-hidden bg-black">
              <video 
                src={processedVideo} 
                controls 
                className="w-full h-full"
              >
                Seu navegador não suporta a tag de vídeo.
              </video>
            </div>
            <a
              href={processedVideo}
              download="video_dublado.mp4"
              className="mt-4 inline-block py-2 px-4 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
            >
              Baixar Vídeo
            </a>
          </div>
        )}

        <footer className="mt-16 text-center text-sm text-text-secondary">
          <p>
            Ao usar este serviço, você concorda com nossos{' '}
            <Link href="/termos" className="text-primary hover:text-primary-hover underline">
              Termos de Uso e Licença
            </Link>
          </p>
          <p className="mt-2">
            © 2025 – Naze Tecnologia Ltda • CNPJ: 58.204.061/0001-50
          </p>
        </footer>
      </div>
    </main>
  );
} 