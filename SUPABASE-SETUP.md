# 🚀 Configuração do Supabase

## Problema Identificado

A configuração do Supabase está apresentando erros de conectividade. Aqui estão as soluções recomendadas:

## ✅ Soluções para Testar

### 1. Verificar Credenciais no Supabase Dashboard

Acesse seu projeto no Supabase e vá em **Settings > Database**:

- **Host**: `db.wlixrzkfwglhqbayxife.supabase.co`
- **Database**: `postgres`
- **Port**: `5432`
- **User**: `postgres.wlixrzkfwglhqbayxife`
- **Password**: `CqMmVzmxSIzAMKGr`

### 2. Configurações Recomendadas para .env

#### Opção A: Conexão Direta (Recomendado para desenvolvimento)
```env
# Conexão direta sem pooling
DATABASE_URL="postgresql://postgres.wlixrzkfwglhqbayxife:CqMmVzmxSIzAMKGr@db.wlixrzkfwglhqbayxife.supabase.co:5432/postgres?sslmode=require"
DIRECT_URL="postgresql://postgres.wlixrzkfwglhqbayxife:CqMmVzmxSIzAMKGr@db.wlixrzkfwglhqbayxife.supabase.co:5432/postgres?sslmode=require"
```

#### Opção B: Com Connection Pooling
```env
# Transaction mode para aplicação
DATABASE_URL="postgresql://postgres.wlixrzkfwglhqbayxife:CqMmVzmxSIzAMKGr@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
# Session mode para migrations
DIRECT_URL="postgresql://postgres.wlixrzkfwglhqbayxife:CqMmVzmxSIzAMKGr@aws-0-us-east-1.pooler.supabase.com:5432/postgres"
```

### 3. Comandos para Testar

```bash
# 1. Testar conexão básica
npx prisma db push --skip-generate

# 2. Se funcionar, aplicar migrations
npx prisma migrate deploy

# 3. Gerar cliente Prisma
npx prisma generate

# 4. Executar seed
npm run db:seed
```

## 🔍 Diagnóstico de Problemas

### Verificar se é problema de rede/firewall
```bash
# Testar conectividade básica
curl -v telnet://db.wlixrzkfwglhqbayxife.supabase.co:5432

# Verificar DNS
nslookup db.wlixrzkfwglhqbayxife.supabase.co
```

### Verificar se é problema de região
Algumas regiões do Supabase usam URLs diferentes:
- `aws-0-us-east-1.pooler.supabase.com` (US East)
- `aws-0-us-west-1.pooler.supabase.com` (US West)
- `aws-0-eu-west-1.pooler.supabase.com` (EU West)

## 📋 Checklist de Solução

1. ✅ Verificar credenciais no Dashboard do Supabase
2. ⏳ Testar conexão direta (sem pooling)
3. ⏳ Verificar se a região do pooler está correta
4. ⏳ Testar com diferentes configurações SSL
5. ⏳ Aplicar migrations se a conexão funcionar

## 🚨 Possíveis Causas do Erro

- **Credenciais incorretas**: Verificar password e host
- **Região incorreta**: Tentar diferentes poolers
- **Firewall**: Alguns ambientes bloqueiam portas 5432/6543
- **SSL**: Supabase requer SSL em produção
- **Project pausado**: Projetos gratuitos podem pausar por inatividade

## 🔧 Configuração Alternativa (Local)

Se o Supabase continuar com problemas, você pode usar PostgreSQL local:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/validador_questoes"
DIRECT_URL="postgresql://username:password@localhost:5432/validador_questoes"
```

## 🎯 Próximos Passos

1. Tente a **Opção A** primeiro (conexão direta)
2. Se não funcionar, verifique as credenciais no Supabase Dashboard
3. Tente diferentes regiões de pooler
4. Como último recurso, use PostgreSQL local