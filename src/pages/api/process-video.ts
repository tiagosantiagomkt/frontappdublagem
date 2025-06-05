import { NextApiRequest, NextApiResponse } from 'next';
import { VideoProcessor } from '@/services/videoProcessor';
import path from 'path';
import * as fs from 'fs';
import * as fsPromises from 'fs/promises';
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

    // Configurações personalizadas para o ytdl
    const options = {
      quality: 'highestvideo',
      filter: (format: ytdl.videoFormat) => format.container === 'mp4',
      requestOptions: {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
          'Accept-Language': 'en-US,en;q=0.9',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Sec-Fetch-User': '?1',
          'Upgrade-Insecure-Requests': '1',
          'Cookie': ''
        }
      }
    };

    // Obtém informações do vídeo com as opções personalizadas
    const info = await ytdl.getInfo(videoUrl, options);
    
    // Encontra o melhor formato disponível
    const format = ytdl.chooseFormat(info.formats, { 
      quality: 'highest',
      filter: 'audioandvideo'
    });

    if (!format) {
      throw new Error('Não foi possível encontrar um formato adequado para download');
    }

    // Faz o download do vídeo
    return new Promise<void>((resolve, reject) => {
      const stream = ytdl.downloadFromInfo(info, { 
        ...options,
        format
      });

      const writeStream = fs.createWriteStream(outputPath);

      let startTime = Date.now();
      let downloadedBytes = 0;

      stream.on('data', (chunk) => {
        downloadedBytes += chunk.length;
        const elapsedTime = (Date.now() - startTime) / 1000;
        const downloadSpeed = (downloadedBytes / (1024 * 1024) / elapsedTime).toFixed(2);
        console.log(`Download em progresso: ${downloadSpeed} MB/s`);
      });

      stream.pipe(writeStream);

      writeStream.on('finish', () => {
        console.log('Download concluído com sucesso');
        resolve();
      });

      writeStream.on('error', (error) => {
        console.error('Erro no writeStream:', error);
        reject(error);
      });

      stream.on('error', (error) => {
        console.error('Erro no stream:', error);
        reject(error);
      });
    });
  } catch (error) {
    console.error('Erro detalhado:', error);
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
    await fsPromises.mkdir(tempDir, { recursive: true });

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
    const processedVideo = await fsPromises.readFile(result.outputPath);

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
      fsPromises.unlink(videoPath),
      fsPromises.unlink(result.outputPath),
    ]).catch(console.error);
  } catch (error) {
    console.error('Erro ao processar requisição:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Erro interno do servidor',
    });
  }
} 