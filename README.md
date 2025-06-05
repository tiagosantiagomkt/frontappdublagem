# App de Dublagem de Vídeos

Uma aplicação moderna para dublagem de vídeos, construída com Next.js e TypeScript.

## Características

- Interface moderna e minimalista
- Processamento de vídeos por URL (YouTube e outros sites suportados)
- Processamento local de áudio e vídeo
- Suporte a múltiplos idiomas
- Design responsivo
- Processamento de áudio para dublagem

## Tecnologias Utilizadas

- Next.js 14
- TypeScript
- Tailwind CSS
- FFmpeg para processamento de vídeo
- yt-dlp para download de vídeos
- Whisper para transcrição de áudio
- Google Translate para tradução
- gTTS para síntese de voz
- Docker

## Requisitos do Sistema

- Node.js 18 ou superior
- Python 3.8 ou superior
- FFmpeg
- Git
- yt-dlp

## Como Executar Localmente

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/app-dublagem.git
cd app-dublagem
```

2. Instale as dependências do sistema (Ubuntu/Debian):
```bash
sudo apt-get update
sudo apt-get install -y ffmpeg python3 python3-pip build-essential git cmake
pip3 install yt-dlp
```

3. Instale as dependências Python:
```bash
pip3 install faster-whisper googletrans==3.1.0a0 gTTS
```

4. Instale as dependências Node.js:
```bash
npm install
```

5. Execute o servidor de desenvolvimento:
```bash
npm run dev
```

6. Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

## Deploy com Docker

1. Construa a imagem:
```bash
docker build -t app-dublagem .
```

2. Execute o container:
```bash
docker run -p 3000:3000 app-dublagem
```

## Deploy no Coolify

1. Faça fork deste repositório
2. Conecte sua conta Coolify ao GitHub
3. Crie um novo serviço no Coolify e selecione o repositório
4. Coolify detectará automaticamente o Dockerfile e fará o deploy

## Variáveis de Ambiente

- `WHISPER_MODEL`: Modelo do Whisper a ser usado (padrão: "base")

## Licença

MIT 