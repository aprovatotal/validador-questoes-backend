# 🔧 Configuração Completa do Supabase com Prisma

## 📋 Passo a Passo para Resolver o Problema

### 1. 🏠 Acesse o Dashboard do Supabase
1. Vá para [supabase.com](https://supabase.com)
2. Faça login e acesse seu projeto
3. Verifique se o projeto está **ATIVO** (não pausado)

### 2. 📊 Obter Informações Corretas de Conexão
No seu projeto, vá em **Settings → Database** e anote:

- **Project Reference ID**: `wlixrzkfwglhqbayxife`
- **Region**: (exemplo: `us-east-1`, `eu-west-1`, etc.)
- **Host**: `db.wlixrzkfwglhqbayxife.supabase.co`

### 3. 💾 Criar Usuário Prisma (SQL Editor)
1. No dashboard, vá em **SQL Editor**
2. Clique em **New Query**
3. Cole e execute este código:

```sql
-- Criar usuário personalizado para Prisma
CREATE USER "prisma" WITH PASSWORD 'Prisma123!ValidadorQuestoes' BYPASSRLS CREATEDB;

-- Dar privilégios necessários
GRANT "prisma" TO "postgres";
GRANT USAGE ON SCHEMA public TO prisma;
GRANT CREATE ON SCHEMA public TO prisma;
GRANT ALL ON ALL TABLES IN SCHEMA public TO prisma;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO prisma;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO prisma;

-- Privilégios para futuras tabelas
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO prisma;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON ROUTINES TO prisma;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO prisma;

-- Verificar se foi criado
SELECT usename FROM pg_user WHERE usename = 'prisma';
```

4. Você deve ver o resultado: `prisma` na lista de usuários

### 4. 🔍 Obter String de Conexão Correta
No dashboard, vá em **Settings → Database** → **Connection String**

Você verá algo como:
```
postgresql://postgres.wlixrzkfwglhqbayxife:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres
```

**IMPORTANTE**: Anote a região correta (ex: `aws-0-us-east-1`, `aws-0-eu-west-1`)

### 5. ⚙️ Configurar .env Corretamente

```env
# Substitua [REGION] pela região correta do seu projeto
# Session mode para migrations (porta 5432)
DATABASE_URL="postgresql://prisma.wlixrzkfwglhqbayxife:Prisma123!ValidadorQuestoes@[REGION].pooler.supabase.com:5432/postgres"

# Transaction mode para aplicação serverless (porta 6543)
SUPABASE_TRANSACTION_URL="postgresql://prisma.wlixrzkfwglhqbayxife:Prisma123!ValidadorQuestoes@[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"

# Direct URL para migrations
DIRECT_URL="postgresql://prisma.wlixrzkfwglhqbayxife:Prisma123!ValidadorQuestoes@[REGION].pooler.supabase.com:5432/postgres"
```

### 6. 🧪 Testar Conexão

```bash
# Testar conexão básica
npx prisma db push --skip-generate

# Se funcionar, aplicar migrations
npx prisma migrate deploy

# Gerar cliente
npx prisma generate

# Executar seed
npm run db:seed
```

## 🌍 Regiões Comuns do Supabase

- **US East (Virginia)**: `aws-0-us-east-1`
- **US West (Oregon)**: `aws-0-us-west-1`
- **EU West (Ireland)**: `aws-0-eu-west-1`
- **EU Central (Frankfurt)**: `aws-0-eu-central-1`
- **Asia Pacific (Sydney)**: `aws-0-ap-southeast-2`
- **Asia Pacific (Singapore)**: `aws-0-ap-southeast-1`

## 🚨 Problemas Comuns e Soluções

### ❌ "Tenant or user not found"
- **Causa**: Usuário `prisma` não foi criado ou região incorreta
- **Solução**: Execute o SQL do passo 3 e verifique a região

### ❌ "Can't reach database server"
- **Causa**: Projeto pausado ou firewall
- **Solução**: Reative o projeto no dashboard

### ❌ "Authentication failed"
- **Causa**: Senha incorreta
- **Solução**: Verifique a senha no SQL: `ALTER USER "prisma" WITH PASSWORD 'NovaSenha';`

## 🔄 Configuração Alternativa (Se ainda não funcionar)

Se o pooling não funcionar, use conexão direta:

```env
# Conexão direta (sem pooling)
DATABASE_URL="postgresql://prisma.wlixrzkfwglhqbayxife:Prisma123!ValidadorQuestoes@db.wlixrzkfwglhqbayxife.supabase.co:5432/postgres?sslmode=require"
DIRECT_URL="postgresql://prisma.wlixrzkfwglhqbayxife:Prisma123!ValidadorQuestoes@db.wlixrzkfwglhqbayxife.supabase.co:5432/postgres?sslmode=require"
```

## ✅ Verificação Final

Depois de configurar, teste com:

```bash
npx prisma db push
npx prisma generate
npm run db:seed
```

Se tudo funcionar, você verá:
```
✅ Schema applied successfully
✅ Generated Prisma Client
🌱 Database seeding completed!
```

## 🆘 Se Nada Funcionar

Use PostgreSQL local temporariamente:

```env
DATABASE_URL="postgresql://mateus:mateus@localhost:5432/validador-provas"
DIRECT_URL="postgresql://mateus:mateus@localhost:5432/validador-provas"
```

E depois migre para Supabase quando resolver a conectividade.