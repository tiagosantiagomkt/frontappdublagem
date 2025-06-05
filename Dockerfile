FROM node:18-alpine

WORKDIR /app

# Instala as dependências necessárias para o build e processamento de mídia
RUN apk add --no-cache \
    libc6-compat \
    ffmpeg \
    python3 \
    py3-pip \
    build-base \
    git \
    cmake \
    python3-dev

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
RUN pip install --no-cache-dir \
    openai-whisper \
    googletrans==3.1.0a0 \
    gTTS

# Clona e compila whisper.cpp
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