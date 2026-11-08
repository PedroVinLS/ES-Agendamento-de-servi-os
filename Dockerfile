
# Imagem base Node.js
FROM node:20-alpine

# Diretório da aplicação
WORKDIR /app

# Copia os arquivos de dependências
COPY package.json package-lock.json ./

# Instala apenas dependências de produção
RUN npm ci --omit=dev

# Copia o código da API
COPY src ./src

# Configuração de produção
ENV NODE_ENV=production
ENV PORT=3000

# Porta da API
EXPOSE 3000

# Inicialização
CMD ["npm", "start"]
