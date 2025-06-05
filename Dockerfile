FROM python:3.12-slim

WORKDIR /app

# Configura variáveis de ambiente para o Chrome
ENV CHROME_BIN=/usr/bin/google-chrome \
    CHROME_PATH=/usr/bin/google-chrome \
    DISPLAY=:99 \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    XDG_RUNTIME_DIR=/tmp/runtime-root \
    DBUS_SESSION_BUS_ADDRESS=/dev/null

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
    xvfb \
    dbus \
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
    # Configura diretórios necessários
    && mkdir -p /root/.config/google-chrome \
    && mkdir -p /tmp/runtime-root \
    && chmod 0700 /tmp/runtime-root \
    # Inicializa o Chrome com todas as flags necessárias
    && (Xvfb :99 -screen 0 1024x768x16 &) \
    && google-chrome \
        --no-sandbox \
        --headless \
        --disable-gpu \
        --disable-dev-shm-usage \
        --disable-software-rasterizer \
        --disable-gpu-sandbox \
        --disable-gpu-compositing \
        --no-first-run \
        --no-default-browser-check \
        --disable-background-networking \
        --disable-background-timer-throttling \
        --disable-client-side-phishing-detection \
        --disable-default-apps \
        --disable-extensions \
        --disable-sync \
        --disable-translate \
        --metrics-recording-only \
        --no-experiments \
        --remote-debugging-port=9222 \
        about:blank

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

# Define variável de ambiente para o modelo Whisper
ENV PORT=3000 \
    NODE_ENV=production \
    HOSTNAME=0.0.0.0 \
    WHISPER_MODEL="base"

# Muda para o diretório standalone
WORKDIR /app/.next/standalone

# Script de inicialização
COPY <<EOF /start.sh
#!/bin/bash
Xvfb :99 -screen 0 1024x768x16 &
exec node server.js
EOF

RUN chmod +x /start.sh

# Inicia a aplicação
CMD ["/start.sh"] 