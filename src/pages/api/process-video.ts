import { NextApiRequest, NextApiResponse } from 'next';
import { VideoProcessor } from '@/services/videoProcessor';
import path from 'path';
import * as fs from 'fs';
import * as fsPromises from 'fs/promises';
import os from 'os';
import { spawn } from 'child_process';
import ytdl from 'ytdl-core';

export const config = {
  api: {
    bodyParser: true,
  },
};

async function downloadVideo(videoUrl: string, outputPath: string): Promise<void> {
  try {
    if (!ytdl.validateURL(videoUrl)) {
      throw new Error('URL do YouTube inválida');
    }

    return await new Promise((resolve, reject) => {
      const args = [
        videoUrl,
        '--merge-output-format', 'mp4',
        '-f', 'bestvideo[ext=mp4]+bestaudio/best',
        '--no-part',
        '--no-playlist',
        '--quiet',
        '--cookies-from-browser', 'chrome',
        '-o', outputPath,
      ];

      const ytdlp = spawn('yt-dlp', args);

      ytdlp.stderr.on('data', (data) => {
        console.error(data.toString());
      });

      ytdlp.on('error', (err) => {
        reject(err);
      });

      ytdlp.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`yt-dlp exited with code ${code}`));
        }
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