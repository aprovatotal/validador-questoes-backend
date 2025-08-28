import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { QueryQuestionsDto } from './dto/query-questions.dto';
import { user_role } from '@prisma/client';

export interface AuthUser {
  uuid: string;
  email: string;
  name: string;
  role: user_role;
  disciplines: Array<{ id: bigint; slug: string; name: string }>;
}

@Injectable()
export class QuestionsService {
  constructor(private prisma: PrismaService) {}

  async create(createQuestionDto: CreateQuestionDto, user: AuthUser) {
    const { alternatives, disciplineId, ...questionData } = createQuestionDto;

    if (!this.userHasAccessToDiscipline(user, BigInt(disciplineId))) {
      throw new ForbiddenException('Access denied to this discipline');
    }


    const question = await this.prisma.question.create({
      data: {
        ...questionData,
        disciplineId: BigInt(disciplineId),
        alternatives: {
          create: alternatives,
        },
      },
      include: {
        alternatives: true,
        discipline: true,
        approvedBy: true,
      },
    });

    return {
      ...question,
      createdAt: question.createdAt ? question.createdAt.toISOString() : null,
      updatedAt: question.updatedAt ? question.updatedAt.toISOString() : null,
      approvedAt: question.approvedAt ? question.approvedAt.toISOString() : null,
      migratedAt: question.migratedAt ? question.migratedAt.toISOString() : null,
      alternatives: question.alternatives ? question.alternatives.map(alt => ({
        ...alt,
        createdAt: alt.createdAt ? alt.createdAt.toISOString() : null,
        updatedAt: alt.updatedAt ? alt.updatedAt.toISOString() : null,
      })) : [],
    };
  }

  async findAll(query: QueryQuestionsDto, user: AuthUser) {
    const { discipline, page = 1, pageSize = 10, search } = query;
    const skip = (page - 1) * pageSize;

    let whereClause: any = {};

    if (user.role === 'ADMIN') {
      if (discipline) {
        const targetDiscipline = await this.prisma.discipline.findUnique({
          where: { slug: discipline }
        });
        if (!targetDiscipline) {
          throw new NotFoundException('Discipline not found');
        }
        whereClause.disciplineId = targetDiscipline.id;
      }
    } else {
      let disciplineIds = user.disciplines.map(d => d.id);

      if (discipline) {
        const targetDiscipline = user.disciplines.find(d => d.slug === discipline);
        if (!targetDiscipline) {
          throw new ForbiddenException('Access denied to this discipline');
        }
        disciplineIds = [targetDiscipline.id];
      }

      whereClause.disciplineId = { in: disciplineIds };
    }

    const where = {
      ...whereClause,
      ...(search && {
        OR: [
          { statement: { contains: search, mode: 'insensitive' as const } },
          { topic: { contains: search, mode: 'insensitive' as const } },
          { subject: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [questions, total] = await Promise.all([
      this.prisma.question.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          alternatives: true,
          discipline: true,
          approvedBy: { select: { name: true, email: true } },
        },
      }),
      this.prisma.question.count({ where }),
    ]);

    // Garantir que os campos de data sejam incluídos e convertidos para string ISO
    const questionsWithDates = questions.map(q => ({
      ...q,
      createdAt: q.createdAt ? q.createdAt.toISOString() : null,
      updatedAt: q.updatedAt ? q.updatedAt.toISOString() : null,
      approvedAt: q.approvedAt ? q.approvedAt.toISOString() : null,
      migratedAt: q.migratedAt ? q.migratedAt.toISOString() : null,
      alternatives: q.alternatives ? q.alternatives.map(alt => ({
        ...alt,
        createdAt: alt.createdAt ? alt.createdAt.toISOString() : null,
        updatedAt: alt.updatedAt ? alt.updatedAt.toISOString() : null,
      })) : [],
    }));

    return {
      data: questionsWithDates,
      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async findApproved(query: QueryQuestionsDto, user: AuthUser) {
    const { discipline, page = 1, pageSize = 10, search } = query;
    const skip = (page - 1) * pageSize;

    let whereClause: any = {};

    if (user.role === 'ADMIN') {
      if (discipline) {
        const targetDiscipline = await this.prisma.discipline.findUnique({
          where: { slug: discipline }
        });
        if (!targetDiscipline) {
          throw new NotFoundException('Discipline not found');
        }
        whereClause.disciplineId = targetDiscipline.id;
      }
    } else {
      let disciplineIds = user.disciplines.map(d => d.id);

      if (discipline) {
        const targetDiscipline = user.disciplines.find(d => d.slug === discipline);
        if (!targetDiscipline) {
          throw new ForbiddenException('Access denied to this discipline');
        }
        disciplineIds = [targetDiscipline.id];
      }

      whereClause.disciplineId = { in: disciplineIds };
    }

    const where = {
      ...whereClause,
      approved: true, // Filtro para questões aprovadas
      ...(search && {
        OR: [
          { statement: { contains: search, mode: 'insensitive' as const } },
          { topic: { contains: search, mode: 'insensitive' as const } },
          { subject: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [questions, total] = await Promise.all([
      this.prisma.question.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { approvedAt: 'desc' }, // Ordenar por data de aprovação
        include: {
          alternatives: true,
          discipline: true,
          approvedBy: { select: { name: true, email: true } },
        },
      }),
      this.prisma.question.count({ where }),
    ]);

    const questionsWithDates = questions.map(q => ({
      ...q,
      createdAt: q.createdAt ? q.createdAt.toISOString() : null,
      updatedAt: q.updatedAt ? q.updatedAt.toISOString() : null,
      approvedAt: q.approvedAt ? q.approvedAt.toISOString() : null,
      migratedAt: q.migratedAt ? q.migratedAt.toISOString() : null,
      alternatives: q.alternatives ? q.alternatives.map(alt => ({
        ...alt,
        createdAt: alt.createdAt ? alt.createdAt.toISOString() : null,
        updatedAt: alt.updatedAt ? alt.updatedAt.toISOString() : null,
      })) : [],
    }));

    return {
      data: questionsWithDates,
      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async findOne(uuid: string, user: AuthUser) {
    const question = await this.prisma.question.findUnique({
      where: { uuid },
      include: {
        alternatives: { orderBy: { order: 'asc' } },
        discipline: true,
        approvedBy: { select: { name: true, email: true } },
      },
    });

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    if (user.role !== 'ADMIN' && !this.userHasAccessToDiscipline(user, question.disciplineId)) {
      throw new ForbiddenException('Access denied to this discipline');
    }

    return {
      ...question,
      createdAt: question.createdAt ? question.createdAt.toISOString() : null,
      updatedAt: question.updatedAt ? question.updatedAt.toISOString() : null,
      approvedAt: question.approvedAt ? question.approvedAt.toISOString() : null,
      migratedAt: question.migratedAt ? question.migratedAt.toISOString() : null,
      alternatives: question.alternatives ? question.alternatives.map(alt => ({
        ...alt,
        createdAt: alt.createdAt ? alt.createdAt.toISOString() : null,
        updatedAt: alt.updatedAt ? alt.updatedAt.toISOString() : null,
      })) : [],
    };
  }

  async update(uuid: string, updateQuestionDto: UpdateQuestionDto, user: AuthUser) {
    const question = await this.findOne(uuid, user);

    const { alternatives, disciplineId, ...questionData } = updateQuestionDto as any;

    if (disciplineId && !this.userHasAccessToDiscipline(user, BigInt(disciplineId))) {
      throw new ForbiddenException('Access denied to this discipline');
    }


    return this.prisma.$transaction(async (tx) => {
      if (alternatives) {
        await tx.alternative.deleteMany({
          where: { questionUuid: uuid },
        });
      }

      const updated = await tx.question.update({
        where: { uuid },
        data: {
          ...questionData,
          ...(disciplineId && { disciplineId: BigInt(disciplineId) }),
          ...(alternatives && {
            alternatives: {
              create: alternatives,
            },
          }),
        },
        include: {
          alternatives: { orderBy: { order: 'asc' } },
          discipline: true,
          approvedBy: { select: { name: true, email: true } },
        },
      });

      return {
        ...updated,
        createdAt: updated.createdAt ? updated.createdAt.toISOString() : null,
        updatedAt: updated.updatedAt ? updated.updatedAt.toISOString() : null,
        approvedAt: updated.approvedAt ? updated.approvedAt.toISOString() : null,
        migratedAt: updated.migratedAt ? updated.migratedAt.toISOString() : null,
        alternatives: updated.alternatives ? updated.alternatives.map(alt => ({
          ...alt,
          createdAt: alt.createdAt ? alt.createdAt.toISOString() : null,
          updatedAt: alt.updatedAt ? alt.updatedAt.toISOString() : null,
        })) : [],
      };
    });
  }

  async approve(uuid: string, user: AuthUser) {
    if (!['REVIEWER', 'EDITOR', 'ADMIN'].includes(user.role)) {
      throw new ForbiddenException('Insufficient permissions to approve questions');
    }

    const question = await this.findOne(uuid, user);

    const approved = await this.prisma.question.update({
      where: { uuid },
      data: {
        approved: true,
        approvedAt: new Date(),
        approvedByUserUuid: user.uuid,
      },
      include: {
        alternatives: { orderBy: { order: 'asc' } },
        discipline: true,
        approvedBy: { select: { name: true, email: true } },
      },
    });

    return {
      ...approved,
      createdAt: approved.createdAt ? approved.createdAt.toISOString() : null,
      updatedAt: approved.updatedAt ? approved.updatedAt.toISOString() : null,
      approvedAt: approved.approvedAt ? approved.approvedAt.toISOString() : null,
      migratedAt: approved.migratedAt ? approved.migratedAt.toISOString() : null,
      alternatives: approved.alternatives ? approved.alternatives.map(alt => ({
        ...alt,
        createdAt: alt.createdAt ? alt.createdAt.toISOString() : null,
        updatedAt: alt.updatedAt ? alt.updatedAt.toISOString() : null,
      })) : [],
    };
  }

  async remove(uuid: string, user: AuthUser) {
    const question = await this.findOne(uuid, user);

    return this.prisma.question.delete({
      where: { uuid },
    });
  }

  private userHasAccessToDiscipline(user: AuthUser, disciplineId: bigint): boolean {
    if (user.role === 'ADMIN') {
      return true;
    }
    return user.disciplines.some(d => d.id === disciplineId);
  }
}