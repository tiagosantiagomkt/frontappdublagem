import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import os from 'os';

interface ProcessingResult {
  success: boolean;
  outputPath?: string;
  error?: string;
}

export class VideoProcessor {
  private tempDir: string;

  constructor() {
    this.tempDir = path.join(os.tmpdir(), 'video-processing');
    this.ensureTempDir();
  }

  private async ensureTempDir() {
    try {
      await fs.mkdir(this.tempDir, { recursive: true });
    } catch (error) {
      console.error('Erro ao criar diretório temporário:', error);
    }
  }

  private async executeCommand(command: string, args: string[]): Promise<string> {
    return new Promise((resolve, reject) => {
      const process = spawn(command, args);
      let output = '';
      let error = '';

      process.stdout.on('data', (data) => {
        output += data.toString();
      });

      process.stderr.on('data', (data) => {
        error += data.toString();
      });

      process.on('close', (code) => {
        if (code === 0) {
          resolve(output);
        } else {
          reject(new Error(`Command failed with code ${code}: ${error}`));
        }
      });
    });
  }

  async extractAudio(videoPath: string): Promise<string> {
    const audioPath = path.join(this.tempDir, `${uuidv4()}.wav`);
    await this.executeCommand('ffmpeg', [
      '-i', videoPath,
      '-vn',
      '-acodec', 'pcm_s16le',
      '-ar', '16000',
      '-ac', '1',
      audioPath
    ]);
    return audioPath;
  }

  async transcribeAudio(audioPath: string): Promise<string> {
    const outputPath = path.join(this.tempDir, `${uuidv4()}.txt`);
    
    // Usando Python com faster-whisper
    const pythonScript = `
from faster_whisper import WhisperModel
import sys

model_size = "${process.env.WHISPER_MODEL || 'base'}"
model = WhisperModel(model_size, device="cpu", compute_type="int8")

segments, info = model.transcribe("${audioPath}", beam_size=1)

with open("${outputPath}", "w", encoding="utf-8") as f:
    for segment in segments:
        f.write(segment.text + "\\n")
    `;
    
    const tempScriptPath = path.join(this.tempDir, `${uuidv4()}.py`);
    await fs.writeFile(tempScriptPath, pythonScript);
    await this.executeCommand('python3', [tempScriptPath]);
    await fs.unlink(tempScriptPath);
    
    return outputPath;
  }

  async generateDubbedAudio(translatedText: string, targetLanguage: string): Promise<string> {
    const outputPath = path.join(this.tempDir, `${uuidv4()}.mp3`);
    // Usando Python para gTTS
    const pythonScript = `
import sys
from gtts import gTTS
text = '''${translatedText}'''
tts = gTTS(text=text, lang='${targetLanguage}')
tts.save('${outputPath}')
    `;
    
    const tempScriptPath = path.join(this.tempDir, `${uuidv4()}.py`);
    await fs.writeFile(tempScriptPath, pythonScript);
    await this.executeCommand('python3', [tempScriptPath]);
    await fs.unlink(tempScriptPath);
    
    return outputPath;
  }

  async mergeAudioWithVideo(videoPath: string, audioPath: string): Promise<string> {
    const outputPath = path.join(this.tempDir, `${uuidv4()}.mp4`);
    await this.executeCommand('ffmpeg', [
      '-i', videoPath,
      '-i', audioPath,
      '-c:v', 'copy',
      '-map', '0:v:0',
      '-map', '1:a:0',
      outputPath
    ]);
    return outputPath;
  }

  async processVideo(
    videoPath: string,
    targetLanguage: string
  ): Promise<ProcessingResult> {
    try {
      // 1. Extrair áudio do vídeo
      const audioPath = await this.extractAudio(videoPath);

      // 2. Transcrever áudio
      const transcriptionPath = await this.transcribeAudio(audioPath);
      const transcription = await fs.readFile(transcriptionPath, 'utf-8');

      // 3. Traduzir texto (usando Python e googletrans)
      const translationScript = `
from googletrans import Translator
translator = Translator()
text = '''${transcription}'''
result = translator.translate(text, dest='${targetLanguage}')
print(result.text)
      `;
      
      const tempScriptPath = path.join(this.tempDir, `${uuidv4()}.py`);
      await fs.writeFile(tempScriptPath, translationScript);
      const translatedText = await this.executeCommand('python3', [tempScriptPath]);
      await fs.unlink(tempScriptPath);

      // 4. Gerar áudio dublado
      const dubbedAudioPath = await this.generateDubbedAudio(translatedText, targetLanguage);

      // 5. Mesclar áudio dublado com vídeo original
      const finalVideoPath = await this.mergeAudioWithVideo(videoPath, dubbedAudioPath);

      // 6. Limpar arquivos temporários
      await Promise.all([
        fs.unlink(audioPath),
        fs.unlink(transcriptionPath),
        fs.unlink(dubbedAudioPath)
      ]).catch(console.error);

      return {
        success: true,
        outputPath: finalVideoPath
      };
    } catch (error) {
      console.error('Erro no processamento do vídeo:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }
} 