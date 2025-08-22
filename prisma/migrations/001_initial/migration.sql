-- CreateExtension
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- CreateEnum
CREATE TYPE "user_role" AS ENUM ('ADMIN', 'EDITOR', 'REVIEWER', 'USER');

-- CreateTable
CREATE TABLE "app_user" (
    "uuid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "user_role" NOT NULL DEFAULT 'USER',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "email_verified_at" TIMESTAMP(3),
    "last_login_at" TIMESTAMP(3),
    "password_version" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "app_user_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "discipline" (
    "id" BIGSERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "discipline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_discipline" (
    "user_uuid" TEXT NOT NULL,
    "discipline_id" BIGINT NOT NULL,

    CONSTRAINT "user_discipline_pkey" PRIMARY KEY ("user_uuid","discipline_id")
);

-- CreateTable
CREATE TABLE "question" (
    "uuid" TEXT NOT NULL,
    "externalid" TEXT NOT NULL,
    "statement" TEXT NOT NULL,
    "competence" TEXT NOT NULL,
    "skill" TEXT NOT NULL,
    "exam_area" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "discipline_id" BIGINT NOT NULL,
    "topic" TEXT NOT NULL,
    "interpretation" TEXT,
    "strategies" TEXT,
    "distractors" TEXT,
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "approved_at" TIMESTAMP(3),
    "migrated" BOOLEAN NOT NULL DEFAULT false,
    "migrated_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "approved_by_user_uuid" TEXT,

    CONSTRAINT "question_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "alternative" (
    "id" BIGSERIAL NOT NULL,
    "question_uuid" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "correct" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "alternative_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "app_user_email_key" ON "app_user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "discipline_slug_key" ON "discipline"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "question_externalid_key" ON "question"("externalid");

-- CreateIndex
CREATE INDEX "idx_question_discipline" ON "question"("discipline_id");

-- CreateIndex
CREATE INDEX "idx_question_approved" ON "question"("approved", "discipline_id");

-- CreateIndex
CREATE UNIQUE INDEX "alternative_question_uuid_order_key" ON "alternative"("question_uuid", "order");

-- CreateIndex - Unique correct alternative per question
CREATE UNIQUE INDEX "alternative_one_true_per_question" ON "alternative"("question_uuid") WHERE "correct" = true;

-- AddForeignKey
ALTER TABLE "user_discipline" ADD CONSTRAINT "user_discipline_user_uuid_fkey" FOREIGN KEY ("user_uuid") REFERENCES "app_user"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_discipline" ADD CONSTRAINT "user_discipline_discipline_id_fkey" FOREIGN KEY ("discipline_id") REFERENCES "discipline"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question" ADD CONSTRAINT "question_approved_by_user_uuid_fkey" FOREIGN KEY ("approved_by_user_uuid") REFERENCES "app_user"("uuid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question" ADD CONSTRAINT "question_discipline_id_fkey" FOREIGN KEY ("discipline_id") REFERENCES "discipline"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alternative" ADD CONSTRAINT "alternative_question_uuid_fkey" FOREIGN KEY ("question_uuid") REFERENCES "question"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- Function for updated_at trigger
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN 
  NEW.updated_at := now(); 
  RETURN NEW; 
END$$;

-- Triggers for updated_at
CREATE TRIGGER trg_question_updated_at
  BEFORE UPDATE ON "question"
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

CREATE TRIGGER trg_alternative_updated_at
  BEFORE UPDATE ON "alternative"
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

-- Function to enforce exactly one correct alternative
CREATE OR REPLACE FUNCTION enforce_exactly_one_correct()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE 
  q_uuid text; 
  correct_count int;
BEGIN
  q_uuid := COALESCE(NEW.question_uuid, OLD.question_uuid);
  SELECT COUNT(*) INTO correct_count
  FROM "alternative"
  WHERE question_uuid = q_uuid AND correct = true;

  IF correct_count = 0 THEN
    RAISE EXCEPTION 'A questão % deve ter exatamente uma alternativa correta', q_uuid;
  END IF;
  RETURN COALESCE(NEW, OLD);
END$$;

-- Constraint trigger for exactly one correct alternative
CREATE CONSTRAINT TRIGGER trg_exactly_one_correct
  AFTER INSERT OR UPDATE OR DELETE ON "alternative"
  DEFERRABLE INITIALLY DEFERRED
  FOR EACH ROW EXECUTE PROCEDURE enforce_exactly_one_correct();

-- Insert initial disciplines
INSERT INTO "discipline" (slug, name) VALUES
  ('mathematics','Matemática'),
  ('portuguese','Português'),
  ('biology','Biologia'),
  ('geography','Geografia')
ON CONFLICT (slug) DO NOTHING;