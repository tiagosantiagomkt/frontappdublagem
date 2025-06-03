import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { videoUrl } = body;

    if (!videoUrl) {
      return NextResponse.json(
        { error: 'URL do vídeo é obrigatória' },
        { status: 400 }
      );
    }

    const response = await axios.post(
      'https://n8n.naze.com.br/webhook/812ee1f7-23af-4179-b76d-dbc2367d4580',
      { videoUrl },
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        timeout: 30000, // Aumentando o timeout para 30 segundos
      }
    );

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Erro no servidor:', error);
    return NextResponse.json(
      { error: 'Erro ao processar o vídeo' },
      { status: 500 }
    );
  }
} 