import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { QuestionsService } from './questions.service';
import { QuestionsController } from './questions.controller';

@Module({
  imports: [PrismaModule],
  controllers: [QuestionsController],
  providers: [QuestionsService],
})
export class QuestionsModule {}