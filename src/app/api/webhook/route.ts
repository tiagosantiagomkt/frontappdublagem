import { NextResponse } from 'next/server';
import axios from 'axios';

const N8N_WEBHOOK_URL = 'https://n8n.naze.com.br/webhook/812ee1f7-23af-4179-b76d-dbc2367d4580';

export async function POST(request: Request) {
  console.log('Recebendo requisição na API...');
  
  try {
    const body = await request.json();
    const { videoUrl } = body;

    console.log('URL do vídeo recebida:', videoUrl);

    if (!videoUrl) {
      console.log('URL do vídeo não fornecida');
      return NextResponse.json(
        { error: 'URL do vídeo é obrigatória' },
        { status: 400 }
      );
    }

    console.log('Enviando requisição para o n8n...');
    
    const response = await axios.post(
      N8N_WEBHOOK_URL,
      { videoUrl },
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'NextJS-App',
        },
        timeout: 30000,
      }
    );

    console.log('Resposta do n8n:', response.data);

    return NextResponse.json({
      success: true,
      message: 'Vídeo enviado para processamento',
      ...response.data
    });
  } catch (error) {
    console.error('Erro detalhado:', {
      error,
      isAxiosError: axios.isAxiosError(error),
      response: axios.isAxiosError(error) ? error.response?.data : null,
      status: axios.isAxiosError(error) ? error.response?.status : null,
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    });

    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        return NextResponse.json(
          { error: 'Tempo limite excedido ao conectar com o servidor' },
          { status: 504 }
        );
      }
      if (!error.response) {
        return NextResponse.json(
          { error: 'Não foi possível conectar ao servidor n8n' },
          { status: 503 }
        );
      }
      return NextResponse.json(
        { 
          error: 'Erro na comunicação com o servidor n8n',
          details: error.response.data
        },
        { status: error.response.status }
      );
    }

    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// Adicionando OPTIONS para lidar com CORS
export async function OPTIONS(request: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
} 