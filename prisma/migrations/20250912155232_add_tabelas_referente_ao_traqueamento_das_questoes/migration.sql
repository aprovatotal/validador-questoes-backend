-- CreateEnum
CREATE TYPE "public"."LocalUsedStatus" AS ENUM ('PENDING', 'SUCCESS', 'ERROR');

-- AlterTable
ALTER TABLE "public"."question" ADD COLUMN     "module_external_id" TEXT,
ADD COLUMN     "subject_external_id" TEXT;

-- CreateTable
CREATE TABLE "public"."module" (
    "uuid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "module_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "public"."subject" (
    "uuid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subject_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "public"."used_question" (
    "uuid" TEXT NOT NULL,
    "question_uuid" TEXT NOT NULL,
    "user_uuid" TEXT NOT NULL,
    "local_used_uuid" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "used_question_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "public"."application" (
    "uuid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "webhookUrl" TEXT,
    "status" "public"."LocalUsedStatus" NOT NULL,
    "metadata" JSONB,
    "webhook_executed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "application_pkey" PRIMARY KEY ("uuid")
);

-- CreateIndex
CREATE UNIQUE INDEX "module_externalId_key" ON "public"."module"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "subject_externalId_key" ON "public"."subject"("externalId");

-- AddForeignKey
ALTER TABLE "public"."question" ADD CONSTRAINT "question_module_external_id_fkey" FOREIGN KEY ("module_external_id") REFERENCES "public"."module"("uuid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."question" ADD CONSTRAINT "question_subject_external_id_fkey" FOREIGN KEY ("subject_external_id") REFERENCES "public"."subject"("uuid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."used_question" ADD CONSTRAINT "used_question_local_used_uuid_fkey" FOREIGN KEY ("local_used_uuid") REFERENCES "public"."application"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."used_question" ADD CONSTRAINT "used_question_user_uuid_fkey" FOREIGN KEY ("user_uuid") REFERENCES "public"."app_user"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."used_question" ADD CONSTRAINT "used_question_question_uuid_fkey" FOREIGN KEY ("question_uuid") REFERENCES "public"."question"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;
