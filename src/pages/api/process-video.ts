import { NextApiRequest, NextApiResponse } from 'next';
import { VideoProcessor } from '@/services/videoProcessor';
import path from 'path';
import { promises as fs } from 'fs';
import os from 'os';
import { spawn } from 'child_process';

export const config = {
  api: {
    bodyParser: true,
  },
};

async function downloadVideo(videoUrl: string, outputPath: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const pythonScript = spawn('python3', [
      'services/youtubeDownloader.py',
      videoUrl,
      outputPath
    ]);

    let output = '';
    pythonScript.stdout.on('data', (data) => {
      output += data.toString();
      console.log(`Python output: ${data}`);
    });

    let errorOutput = '';
    pythonScript.stderr.on('data', (data) => {
      errorOutput += data.toString();
      console.error(`Python error: ${data}`);
    });

    pythonScript.on('close', (code) => {
      if (code === 0) {
        try {
          const result = JSON.parse(output);
          if (result.success) {
            resolve();
          } else {
            reject(new Error(result.error || 'Erro desconhecido ao baixar o vídeo'));
          }
        } catch (e) {
          reject(new Error('Erro ao processar resposta do script Python'));
        }
      } else {
        console.error('Erro completo do Python:', errorOutput);
        reject(new Error('Não foi possível baixar o vídeo. Por favor, verifique se o URL está correto e se o vídeo está disponível.'));
      }
    });
  });
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