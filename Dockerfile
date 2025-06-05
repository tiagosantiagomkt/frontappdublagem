FROM python:3.12-slim

WORKDIR /app

# Instala o Node.js e outras dependências necessárias
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

# Configura o ambiente Python
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Instala as dependências Python
RUN pip install --no-cache-dir \
    torch==2.2.0+cpu \
    torchaudio==2.2.0+cpu \
    --extra-index-url https://download.pytorch.org/whl/cpu

# Instala as outras dependências Python
RUN pip install --no-cache-dir \
    numpy \
    gTTS \
    googletrans==3.1.0a0 \
    faster-whisper

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

# Constrói a aplicação
RUN npm run build

EXPOSE 3000

# Define variável de ambiente para o modelo Whisper
ENV WHISPER_MODEL="base"

# Inicia a aplicação
CMD ["npm", "start"] 