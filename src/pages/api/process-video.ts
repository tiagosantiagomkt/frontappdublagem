import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import { VideoProcessor } from '@/services/videoProcessor';
import path from 'path';
import { promises as fs } from 'fs';
import os from 'os';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const form = formidable({
      uploadDir: os.tmpdir(),
      keepExtensions: true,
      maxFileSize: 100 * 1024 * 1024, // 100MB
    });

    const [fields, files] = await form.parse(req) as [
      formidable.Fields,
      formidable.Files
    ];

    const videoFile = files.video?.[0];
    const targetLanguage = fields.targetLanguage?.[0];

    if (!videoFile || !targetLanguage) {
      return res.status(400).json({
        error: 'Arquivo de vídeo e idioma de destino são obrigatórios',
      });
    }

    const videoProcessor = new VideoProcessor();
    const result = await videoProcessor.processVideo(
      videoFile.filepath,
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
      fs.unlink(videoFile.filepath),
      fs.unlink(result.outputPath),
    ]).catch(console.error);
  } catch (error) {
    console.error('Erro ao processar requisição:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
    });
  }
} 