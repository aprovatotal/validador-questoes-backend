# Multi-stage build para otimizar imagem de produção
FROM node:20-alpine AS base

# Instalar dependências necessárias para compilação nativa
RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

# Copiar arquivos de configuração de pacotes
COPY package*.json ./
COPY prisma ./prisma/

# Stage de dependências
FROM base AS deps
RUN npm ci --only=production && npm cache clean --force

# Stage de build
FROM base AS builder
RUN npm ci
COPY . .

# Gerar cliente Prisma
RUN npx prisma generate

# Build da aplicação
RUN npm run build

# Stage de produção
FROM node:20-alpine AS runner

# Criar usuário não-root para segurança
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

WORKDIR /app

# Instalar apenas openssl (necessário para Prisma)
RUN apk add --no-cache openssl

# Copiar node_modules da stage deps
COPY --from=deps --chown=nestjs:nodejs /app/node_modules ./node_modules

# Copiar aplicação compilada
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/prisma ./prisma

# Copiar package.json para scripts npm
COPY --chown=nestjs:nodejs package*.json ./

# Criar diretório para logs (se necessário)
RUN mkdir -p /app/logs && chown nestjs:nodejs /app/logs

# Mudar para usuário não-root
USER nestjs

# Expor porta da aplicação
EXPOSE 3000

# Variáveis de ambiente para produção
ENV NODE_ENV=production
ENV PORT=3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node --eval "require('http').get('http://localhost:3000/health', (res) => process.exit(res.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

# Comando de inicialização
CMD ["npm", "run", "start:prod"]