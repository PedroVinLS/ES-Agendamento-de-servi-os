
# Imagem 
FROM node:20-alpine

# Diretório 
WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci --omit=dev

COPY src ./src

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# Inicialização
CMD ["npm", "start"]
