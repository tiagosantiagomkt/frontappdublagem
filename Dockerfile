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
    gnupg \
    && curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && pip3 install yt-dlp \
    # Instala o Google Chrome
    && curl -fsSL https://dl.google.com/linux/linux_signing_key.pub | gpg --dearmor -o /usr/share/keyrings/google-chrome.gpg \
    && echo "deb [arch=amd64 signed-by=/usr/share/keyrings/google-chrome.gpg] http://dl.google.com/linux/chrome/deb/ stable main" | tee /etc/apt/sources.list.d/google-chrome.list \
    && apt-get update \
    && apt-get install -y google-chrome-stable \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* \
    # Configura o diretório do Chrome
    && mkdir -p /root/.config/google-chrome \
    && google-chrome --no-sandbox --headless --disable-gpu --remote-debugging-port=9222 --disable-dev-shm-usage about:blank

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

# Define variável de ambiente para o modelo Whisper e configurações do Chrome
ENV WHISPER_MODEL="base" \
    CHROME_BIN="/usr/bin/google-chrome" \
    PORT=3000 \
    NODE_ENV=production \
    HOSTNAME=0.0.0.0

# Muda para o diretório standalone
WORKDIR /app/.next/standalone

# Inicia a aplicação
CMD ["node", "server.js"] 