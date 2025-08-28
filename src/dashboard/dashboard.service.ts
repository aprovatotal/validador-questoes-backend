import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DashboardStatsDto, DisciplineStatsDto } from './dto/dashboard-stats.dto';
import { user_role } from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats(user: any): Promise<DashboardStatsDto> {
    let disciplineIds: bigint[] = [];
    
    if (user.role === user_role.ADMIN) {
      const allDisciplines = await this.prisma.discipline.findMany({
        select: { id: true }
      });
      disciplineIds = allDisciplines.map(d => d.id);
    } else {
      const userDisciplines = await this.prisma.userDiscipline.findMany({
        where: { userUuid: user.uuid },
        select: { disciplineId: true }
      });
      disciplineIds = userDisciplines.map(ud => ud.disciplineId);
    }

    if (disciplineIds.length === 0) {
      throw new ForbiddenException('Você não tem acesso a nenhuma disciplina');
    }

    const disciplines = await this.prisma.discipline.findMany({
      where: {
        id: { in: disciplineIds }
      },
      select: {
        id: true,
        slug: true,
        name: true,
        _count: {
          select: {
            questions: true
          }
        }
      }
    });

    const disciplineStats: DisciplineStatsDto[] = [];
    let totalQuestions = 0;
    let totalApproved = 0;
    let totalPending = 0;

    for (const discipline of disciplines) {
      const approvedCount = await this.prisma.question.count({
        where: {
          disciplineId: discipline.id,
          approved: true
        }
      });

      const pendingCount = await this.prisma.question.count({
        where: {
          disciplineId: discipline.id,
          approved: false
        }
      });

      const totalCount = approvedCount + pendingCount;

      disciplineStats.push({
        id: Number(discipline.id),
        slug: discipline.slug,
        name: discipline.name,
        totalQuestions: totalCount,
        approvedQuestions: approvedCount,
        pendingQuestions: pendingCount
      });

      totalQuestions += totalCount;
      totalApproved += approvedCount;
      totalPending += pendingCount;
    }

    return {
      totalQuestions,
      totalApproved,
      totalPending,
      disciplineStats: disciplineStats.sort((a, b) => a.name.localeCompare(b.name)),
      generatedAt: new Date()
    };
  }
}