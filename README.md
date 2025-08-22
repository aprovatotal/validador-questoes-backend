# Validador de Questões - Backend

Backend API para validação de questões educacionais usando NestJS, Prisma e Supabase PostgreSQL.

## Funcionalidades

- ✅ Autenticação JWT (access/refresh tokens)
- ✅ Controle de acesso baseado em papéis (ADMIN, EDITOR, REVIEWER, USER)
- ✅ Controle de acesso por disciplinas
- ✅ CRUD completo de questões com alternativas
- ✅ Sistema de aprovação de questões
- ✅ Validação de dados com class-validator

## Tecnologias

- **Framework**: NestJS
- **Database**: PostgreSQL (Supabase)
- **ORM**: Prisma
- **Auth**: JWT + argon2 para hash de senhas
- **Validação**: class-validator/class-transformer

## Configuração

### 1. Environment Variables

Copie `.env.example` para `.env` e configure:

```env
DATABASE_URL="postgresql://<user>:<pass>@<host>:6543/postgres?sslmode=require"
JWT_ACCESS_SECRET=your_jwt_access_secret_here
JWT_REFRESH_SECRET=your_jwt_refresh_secret_here
JWT_ACCESS_TTL=900
JWT_REFRESH_TTL=2592000
PORT=3000
```

### 2. Database Setup

```bash
# Execute as migrações
npx prisma migrate deploy

# Ou aplique o SQL diretamente no Supabase
# Use o arquivo: prisma/migrations/001_initial/migration.sql
```

### 3. Install & Run

```bash
npm install
npm run start:dev
```

## API Endpoints

### Authentication

- `POST /auth/register` - Registrar usuário
- `POST /auth/login` - Login
- `POST /auth/refresh` - Renovar tokens

### Questions (Protegidas)

- `GET /questions` - Listar questões (filtradas por disciplinas do usuário)
- `GET /questions/:uuid` - Detalhe da questão
- `POST /questions` - Criar questão
- `PATCH /questions/:uuid` - Editar questão
- `PATCH /questions/:uuid/approve` - Aprovar questão (REVIEWER+)
- `DELETE /questions/:uuid` - Excluir questão

### Query Parameters para Questions

- `discipline`: slug da disciplina (ex: "mathematics")
- `page`: número da página (default: 1)
- `pageSize`: itens por página (default: 10)
- `search`: busca em statement, topic, subject

## Estrutura do Banco

### Principais Tabelas

- `app_user`: Usuários com papéis
- `discipline`: Disciplinas (matemática, português, etc.)
- `user_discipline`: Relação N:N usuário ↔ disciplinas
- `question`: Questões com metadados
- `alternative`: Alternativas das questões

### Regras de Negócio

1. **Exatamente 1 alternativa correta** por questão (constraint + trigger)
2. **Acesso por disciplina**: usuário só vê questões das suas disciplinas
3. **Aprovação**: apenas REVIEWER, EDITOR ou ADMIN podem aprovar
4. **Triggers**: updated_at automático

## Exemplo de Uso

### 1. Registrar usuário

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao@email.com", 
    "password": "12345678",
    "disciplineIds": [1, 2]
  }'
```

### 2. Listar questões

```bash
curl -X GET "http://localhost:3000/questions?discipline=mathematics&page=1" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 3. Criar questão

```bash
curl -X POST http://localhost:3000/questions \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "externalid": "MAT001",
    "statement": "Qual é 2 + 2?",
    "competence": "Operações básicas",
    "skill": "Adição",
    "examArea": "mt",
    "subject": "Aritmética",
    "disciplineId": 1,
    "topic": "Números naturais",
    "alternatives": [
      {"text": "3", "order": 1, "correct": false},
      {"text": "4", "order": 2, "correct": true},
      {"text": "5", "order": 3, "correct": false}
    ]
  }'
```

## Scripts Disponíveis

```bash
npm run start:dev    # Desenvolvimento
npm run build        # Build para produção
npm run start:prod   # Produção
```