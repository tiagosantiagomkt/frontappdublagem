FROM python:3.12-slim

WORKDIR /app

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Instala dependências essenciais
RUN apt-get update && apt-get install -y \
    curl \
    ffmpeg \
    build-essential \
    git \
    cmake \
    pkg-config \
    python3-pip \
    && curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && pip3 install yt-dlp \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Instala as dependências Python com versões específicas
RUN pip install --no-cache-dir \
    torch==2.2.0+cpu \
    torchaudio==2.2.0+cpu \
    --extra-index-url https://download.pytorch.org/whl/cpu \
    && pip install --no-cache-dir \
    numpy \
    gTTS \
    googletrans==3.1.0a0 \
    faster-whisper \
    pytube==15.0.0

# Copia os arquivos de configuração
COPY package*.json ./
COPY tsconfig.json ./
COPY next.config.js ./
COPY postcss.config.js ./
COPY tailwind.config.js ./

# Instala as dependências Node.js
RUN npm install

# Copia o resto dos arquivos
COPY . .

# Cria diretório public se não existir
RUN mkdir -p public

# Constrói a aplicação
RUN npm run build

# Copia os arquivos necessários para o modo standalone
RUN mkdir -p .next/standalone/.next/static && \
    cp -r .next/static/* .next/standalone/.next/static/ && \
    mkdir -p .next/standalone/public && \
    cp -r public/* .next/standalone/public/ || true

EXPOSE 3000

# Define variável de ambiente para o modelo Whisper
ENV PORT=3000 \
    NODE_ENV=production \
    HOSTNAME=0.0.0.0 \
    WHISPER_MODEL="base"

# Muda para o diretório standalone
WORKDIR /app/.next/standalone

CMD ["node", "server.js"] 