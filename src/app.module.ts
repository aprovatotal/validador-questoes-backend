import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { QuestionsModule } from './questions/questions.module';
import { DisciplinesModule } from './disciplines/disciplines.module';
import { UsersModule } from './users/users.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { ModulesModule } from './modules/modules.module';
import { SubjectsModule } from './subjects/subjects.module';
import { TrackingsModule } from './trackings/trackings.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    QuestionsModule,
    DisciplinesModule,
    UsersModule,
    DashboardModule,
    ModulesModule,
    SubjectsModule,
    TrackingsModule,
  ],
})
export class AppModule {}