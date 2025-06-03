# App de Dublagem de Vídeos

Uma aplicação moderna para dublagem de vídeos, construída com Next.js e TypeScript.

## Características

- Interface moderna e minimalista
- Suporte para links de vídeo
- Design responsivo
- Processamento de áudio para dublagem

## Tecnologias Utilizadas

- Next.js 14
- TypeScript
- Tailwind CSS
- Docker

## Como Executar Localmente

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/app-dublagem.git
cd app-dublagem
```

2. Instale as dependências:
```bash
npm install
```

3. Execute o servidor de desenvolvimento:
```bash
npm run dev
```

4. Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

## Deploy com Docker

1. Construa a imagem:
```bash
docker build -t app-dublagem .
```

2. Execute o container:
```bash
docker run -p 3000:3000 app-dublagem
```

## Deploy na Railway

1. Faça fork deste repositório
2. Conecte sua conta Railway ao GitHub
3. Crie um novo projeto na Railway e selecione o repositório
4. Railway detectará automaticamente o Dockerfile e fará o deploy

## Licença

MIT 