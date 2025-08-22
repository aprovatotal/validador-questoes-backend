-- Criar usuário personalizado para Prisma no Supabase
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. Criar usuário customizado
CREATE USER "prisma" WITH PASSWORD 'Prisma123!ValidadorQuestoes' BYPASSRLS CREATEDB;

-- 2. Estender privilégios do prisma para postgres (necessário para ver mudanças no Dashboard)
GRANT "prisma" TO "postgres";

-- 3. Dar permissões necessárias sobre schemas relevantes (public)
GRANT USAGE ON SCHEMA public TO prisma;
GRANT CREATE ON SCHEMA public TO prisma;
GRANT ALL ON ALL TABLES IN SCHEMA public TO prisma;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO prisma;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO prisma;

-- 4. Alterar privilégios padrão para futuras tabelas
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO prisma;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON ROUTINES TO prisma;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO prisma;

-- Verificar se o usuário foi criado corretamente
SELECT usename FROM pg_user WHERE usename = 'prisma';