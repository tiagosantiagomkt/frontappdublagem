import { NextApiRequest, NextApiResponse } from 'next';
import { VideoProcessor } from '@/services/videoProcessor';
import path from 'path';
import { promises as fs } from 'fs';
import os from 'os';
import ytdl from 'ytdl-core';

export const config = {
  api: {
    bodyParser: true,
  },
};

async function downloadVideo(videoUrl: string, outputPath: string): Promise<void> {
  try {
    // Verifica se a URL é válida
    if (!ytdl.validateURL(videoUrl)) {
      throw new Error('URL do YouTube inválida');
    }

    // Obtém informações do vídeo
    const info = await ytdl.getInfo(videoUrl);
    
    // Pega o formato com melhor qualidade que inclui vídeo e áudio
    const format = ytdl.chooseFormat(info.formats, { 
      quality: 'highest',
      filter: 'audioandvideo'
    });

    if (!format) {
      throw new Error('Não foi possível encontrar um formato adequado para download');
    }

    // Faz o download do vídeo
    return new Promise((resolve, reject) => {
      const stream = ytdl.downloadFromInfo(info, { format });
      const writeStream = fs.createWriteStream(outputPath);

      stream.pipe(writeStream);

      writeStream.on('finish', () => {
        resolve();
      });

      writeStream.on('error', (error) => {
        reject(error);
      });

      stream.on('error', (error) => {
        reject(error);
      });
    });
  } catch (error) {
    throw new Error(`Erro ao baixar vídeo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { videoUrl, targetLanguage } = req.body;

    if (!videoUrl || !targetLanguage) {
      return res.status(400).json({
        error: 'URL do vídeo e idioma de destino são obrigatórios',
      });
    }

    // Criar diretório temporário
    const tempDir = path.join(os.tmpdir(), 'video-processing');
    await fs.mkdir(tempDir, { recursive: true });

    // Download do vídeo
    const videoPath = path.join(tempDir, `${Date.now()}.mp4`);
    await downloadVideo(videoUrl, videoPath);

    const videoProcessor = new VideoProcessor();
    const result = await videoProcessor.processVideo(
      videoPath,
      targetLanguage
    );

    if (!result.success || !result.outputPath) {
      return res.status(500).json({
        error: result.error || 'Erro ao processar o vídeo',
      });
    }

    // Lê o arquivo processado
    const processedVideo = await fs.readFile(result.outputPath);

    // Define os headers para download
    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="video_dublado.mp4"`
    );

    // Envia o vídeo processado
    res.send(processedVideo);

    // Limpa os arquivos temporários
    await Promise.all([
      fs.unlink(videoPath),
      fs.unlink(result.outputPath),
    ]).catch(console.error);
  } catch (error) {
    console.error('Erro ao processar requisição:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Erro interno do servidor',
    });
  }
} 