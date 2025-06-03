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
    cmake

# Instala bibliotecas Python necessárias
RUN pip3 install --no-cache-dir \
    openai-whisper \
    googletrans==3.1.0a0 \
    gTTS

# Clona e compila whisper.cpp
RUN git clone https://github.com/ggerganov/whisper.cpp.git && \
    cd whisper.cpp && \
    make

# Copia os arquivos de configuração
COPY package*.json ./
COPY tsconfig.json ./
COPY next.config.js ./
COPY postcss.config.js ./
COPY tailwind.config.js ./

# Instala as dependências
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