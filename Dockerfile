FROM node:18-alpine

WORKDIR /app

# Instala as dependências necessárias para o build e processamento de mídia
RUN apk add --no-cache \
    libc6-compat \
    ffmpeg \
    ffmpeg-dev \
    ffmpeg-libs \
    python3 \
    py3-pip \
    py3-numpy \
    py3-scipy \
    py3-setuptools \
    build-base \
    git \
    cmake \
    python3-dev \
    pkgconfig \
    linux-headers \
    rust \
    cargo

# Configura o ambiente Python
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Cria e configura um ambiente virtual Python
RUN python3 -m venv /opt/venv && \
    /opt/venv/bin/pip install --upgrade pip setuptools wheel

# Ativa o ambiente virtual e instala as dependências Python
ENV PATH="/opt/venv/bin:$PATH"

# Instala PyTorch primeiro (versão CPU-only para Alpine)
RUN pip install --no-cache-dir \
    torch==2.2.0+cpu \
    torchaudio==2.2.0+cpu \
    --extra-index-url https://download.pytorch.org/whl/cpu

# Instala as dependências Python uma por uma
RUN pip install --no-cache-dir gTTS && \
    pip install --no-cache-dir googletrans==3.1.0a0 && \
    pip install --no-cache-dir faster-whisper

# Clona e compila whisper.cpp como alternativa
RUN git clone https://github.com/ggerganov/whisper.cpp.git && \
    cd whisper.cpp && \
    make && \
    install -m 755 whisper /usr/local/bin/ && \
    cd .. && \
    rm -rf whisper.cpp

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