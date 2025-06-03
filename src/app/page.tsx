'use client';

import VideoSearch from '@/components/VideoSearch';
import { useState } from 'react';
import axios, { AxiosError } from 'axios';

export default function Home() {
  const [videoUrl, setVideoUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [processedVideo, setProcessedVideo] = useState<string | null>(null);

  const handleSubmit = async (url: string) => {
    try {
      setIsLoading(true);
      setMessage('');
      setProcessedVideo(null);
      
      console.log('Enviando URL para processamento:', url);
      
      const response = await axios.post('/api/webhook', 
        { videoUrl: url },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 35000, // 35 segundos
        }
      );

      console.log('Resposta do servidor:', response.data);
      
      if (response.data.success) {
        if (response.data.videoUrl) {
          setProcessedVideo(response.data.videoUrl);
          setMessage('Vídeo processado com sucesso!');
        } else {
          setMessage(response.data.message || 'Vídeo enviado! Aguardando processamento...');
        }
        setVideoUrl('');
      } else {
        throw new Error('Resposta do servidor indica falha');
      }
    } catch (error) {
      console.error('Detalhes do erro:', {
        error,
        isAxiosError: axios.isAxiosError(error),
        status: axios.isAxiosError(error) ? (error as AxiosError).response?.status : null,
        data: axios.isAxiosError(error) ? (error as AxiosError).response?.data : null,
        message: axios.isAxiosError(error) ? (error as AxiosError).message : String(error)
      });

      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error || error.message;
        
        if (error.code === 'ECONNABORTED') {
          setMessage('O processamento está demorando mais que o esperado. Por favor, tente novamente.');
        } else if (error.response?.status === 429) {
          setMessage('Muitas requisições. Aguarde um momento e tente novamente.');
        } else if (error.response?.status === 400) {
          setMessage(errorMessage || 'URL inválida. Verifique o link e tente novamente.');
        } else if (error.response?.status === 503 || error.response?.status === 504) {
          setMessage(errorMessage || 'Servidor temporariamente indisponível. Tente novamente em alguns minutos.');
        } else if (!error.response) {
          setMessage('Erro de conexão com o servidor. Verifique sua internet e tente novamente.');
        } else {
          setMessage(errorMessage || 'Erro ao processar o vídeo. Tente novamente mais tarde.');
        }
      } else {
        setMessage('Erro inesperado. Por favor, tente novamente.');
      }
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
          Cole o link do seu vídeo abaixo para começar a dublagem
        </p>
        
        <VideoSearch onSubmit={handleSubmit} isLoading={isLoading} />
        
        {message && (
          <div 
            className={`mt-4 p-4 rounded-lg text-center ${
              message.includes('sucesso') || message.includes('Aguardando')
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
          </div>
        )}
      </div>
    </main>
  );
} 