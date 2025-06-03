'use client';

import VideoSearch from '@/components/VideoSearch';
import { useState } from 'react';
import axios, { AxiosError } from 'axios';

export default function Home() {
  const [videoUrl, setVideoUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (url: string) => {
    try {
      setIsLoading(true);
      setMessage('');
      
      const response = await axios.post(
        'https://n8n.naze.com.br/webhook/812ee1f7-23af-4179-b76d-dbc2367d4580',
        { videoUrl: url },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          timeout: 10000, // 10 segundos de timeout
        }
      );

      console.log('Resposta do servidor:', response.data);
      setMessage('Link enviado com sucesso!');
      setVideoUrl('');
    } catch (error) {
      console.error('Detalhes do erro:', {
        error,
        isAxiosError: axios.isAxiosError(error),
        status: axios.isAxiosError(error) ? (error as AxiosError).response?.status : null,
        message: axios.isAxiosError(error) ? (error as AxiosError).message : String(error)
      });

      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          setMessage('Tempo limite excedido. Tente novamente.');
        } else if (error.response?.status === 429) {
          setMessage('Muitas requisições. Aguarde um momento e tente novamente.');
        } else if (error.response?.status === 403) {
          setMessage('Acesso não autorizado. Verifique as permissões.');
        } else if (error.response?.status === 404) {
          setMessage('Endpoint não encontrado. Verifique a URL.');
        } else if (!error.response) {
          setMessage('Erro de conexão. Verifique sua internet.');
        } else {
          setMessage(`Erro ao enviar o link (${error.response.status}). Tente novamente.`);
        }
      } else {
        setMessage('Erro inesperado. Tente novamente.');
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
              message.includes('sucesso') 
                ? 'bg-green-100 text-green-700' 
                : 'bg-red-100 text-red-700'
            }`}
          >
            {message}
          </div>
        )}
      </div>
    </main>
  );
} 