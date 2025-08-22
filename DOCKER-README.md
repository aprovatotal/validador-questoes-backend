# 🐳 Docker Setup - Validador de Questões Backend

Este projeto inclui configuração completa do Docker para desenvolvimento e produção.

## 📋 Arquivos Docker

- `Dockerfile` - Imagem otimizada para produção (multi-stage)
- `Dockerfile.dev` - Imagem para desenvolvimento
- `docker-compose.yml` - Orquestração para produção
- `docker-compose.dev.yml` - Orquestração para desenvolvimento
- `.dockerignore` - Arquivos ignorados no build

## 🚀 Execução Rápida

### Produção
```bash
# Subir todos os serviços em produção
docker-compose up -d

# Ver logs
docker-compose logs -f app

# Parar serviços
docker-compose down
```

### Desenvolvimento
```bash
# Subir todos os serviços em desenvolvimento
docker-compose -f docker-compose.dev.yml up -d

# Ver logs em tempo real
docker-compose -f docker-compose.dev.yml logs -f app

# Parar serviços
docker-compose -f docker-compose.dev.yml down
```

## 🏗️ Build da Aplicação

### Build para Produção
```bash
# Build da imagem
docker build -t validador-questoes-backend .

# Executar container
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://user:pass@host:5432/db" \
  -e JWT_SECRET="your-secret" \
  validador-questoes-backend
```

### Build para Desenvolvimento
```bash
# Build da imagem de desenvolvimento
docker build -f Dockerfile.dev -t validador-questoes-backend:dev .

# Executar em modo desenvolvimento
docker run -p 3000:3000 -p 9229:9229 \
  -v $(pwd):/app \
  -v /app/node_modules \
  validador-questoes-backend:dev
```

## 🔧 Configuração

### Variáveis de Ambiente

#### Produção
```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/validador_questoes
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

#### Desenvolvimento
```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/validador_questoes_dev
JWT_SECRET=dev-jwt-secret
JWT_REFRESH_SECRET=dev-refresh-secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

### Criando arquivo .env
```bash
# Copiar template
cp .env.example .env

# Editar variáveis
nano .env
```

## 📊 Serviços Incluídos

### Produção (docker-compose.yml)
- **app**: Aplicação NestJS (porta 3000)
- **postgres**: PostgreSQL 15 (porta 5432)
- **redis**: Redis 7 para cache (porta 6379)

### Desenvolvimento (docker-compose.dev.yml)
- **app**: Aplicação NestJS com hot-reload (porta 3000)
- **postgres**: PostgreSQL 15 (porta 5432)
- **redis**: Redis 7 (porta 6379)
- **adminer**: Interface web para PostgreSQL (porta 8080)

## 🗄️ Gerenciamento do Banco

### Migrações Prisma
```bash
# Dentro do container da aplicação
docker-compose exec app npx prisma migrate deploy

# Gerar cliente Prisma
docker-compose exec app npx prisma generate

# Executar seed
docker-compose exec app npm run db:seed
```

### Acessar PostgreSQL
```bash
# Via docker-compose
docker-compose exec postgres psql -U postgres -d validador_questoes

# Via adminer (desenvolvimento)
# Acesse http://localhost:8080
# Server: postgres
# Username: postgres
# Password: postgres
# Database: validador_questoes_dev
```

## 🔍 Monitoramento e Debug

### Logs
```bash
# Logs de todos os serviços
docker-compose logs -f

# Logs apenas da aplicação
docker-compose logs -f app

# Logs do banco
docker-compose logs -f postgres
```

### Health Checks
```bash
# Status dos containers
docker-compose ps

# Health check manual da aplicação
curl http://localhost:3000/health
```

### Debug (Desenvolvimento)
```bash
# A porta 9229 está exposta para debug
# Configure seu editor para conectar em localhost:9229
```

## 📈 Otimizações de Produção

### Imagem Docker
- **Multi-stage build**: Reduz tamanho final da imagem
- **Alpine Linux**: Base mais leve e segura
- **Usuário não-root**: Maior segurança
- **Health checks**: Monitoring automático
- **Cache de dependências**: Builds mais rápidos

### Performance
- **Node.js 20**: Versão LTS mais recente
- **Prisma**: ORM otimizado
- **Redis**: Cache para sessions/dados
- **PostgreSQL**: Banco robusto e escalável

## 🔒 Segurança

### Práticas Implementadas
- Usuário não-root no container
- Secrets via variáveis de ambiente
- Health checks para monitoramento
- Rede isolada para containers
- Volumes persistentes para dados

### Configuração de Produção
```bash
# Gerar secrets seguros
openssl rand -base64 32  # JWT_SECRET
openssl rand -base64 32  # JWT_REFRESH_SECRET

# Configurar firewall (exemplo)
ufw allow 3000  # Aplicação
ufw allow 5432  # PostgreSQL (apenas se necessário)
```

## 🚢 Deploy em Nuvem

### Docker Hub
```bash
# Tag da imagem
docker tag validador-questoes-backend username/validador-questoes-backend:latest

# Push para registro
docker push username/validador-questoes-backend:latest
```

### Cloud Providers

#### AWS ECS/Fargate
```json
{
  "family": "validador-questoes",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "containerDefinitions": [
    {
      "name": "app",
      "image": "username/validador-questoes-backend:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ]
    }
  ]
}
```

#### Google Cloud Run
```bash
# Deploy direto do código
gcloud run deploy validador-questoes \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

#### Azure Container Instances
```bash
# Deploy do container
az container create \
  --resource-group myResourceGroup \
  --name validador-questoes \
  --image username/validador-questoes-backend:latest \
  --ports 3000 \
  --environment-variables NODE_ENV=production
```

## 🛠️ Comandos Úteis

```bash
# Rebuild sem cache
docker-compose build --no-cache

# Remover volumes (CUIDADO: apaga dados)
docker-compose down -v

# Cleanup completo
docker system prune -a

# Logs específicos
docker-compose logs --tail=100 app

# Executar comandos no container
docker-compose exec app npm run lint
docker-compose exec app npm test

# Backup do banco
docker-compose exec postgres pg_dump -U postgres validador_questoes > backup.sql

# Restore do banco
docker-compose exec -T postgres psql -U postgres validador_questoes < backup.sql
```

## 📚 Recursos Adicionais

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [NestJS Docker Guide](https://docs.nestjs.com/)
- [PostgreSQL Docker Hub](https://hub.docker.com/_/postgres)
- [Redis Docker Hub](https://hub.docker.com/_/redis)