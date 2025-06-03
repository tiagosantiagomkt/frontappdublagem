FROM node:18-alpine

WORKDIR /app

# Instala as dependências necessárias para o build
RUN apk add --no-cache libc6-compat

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

# Inicia a aplicação
CMD ["npm", "start"] 