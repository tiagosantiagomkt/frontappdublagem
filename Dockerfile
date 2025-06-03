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

# Cria e ativa um ambiente virtual Python
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Atualiza pip e instala as bibliotecas Python no ambiente virtual
RUN pip3 install --upgrade pip && \
    pip3 install --no-cache-dir \
    openai-whisper \
    googletrans==3.1.0a0 \
    gTTS

# Clona e compila whisper.cpp
RUN git clone https://github.com/ggerganov/whisper.cpp.git && \
    cd whisper.cpp && \
    make && \
    cp whisper /usr/local/bin/ && \
    cd .. && \
    rm -rf whisper.cpp

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