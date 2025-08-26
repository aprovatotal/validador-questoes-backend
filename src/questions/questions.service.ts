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


    return this.prisma.question.create({
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
  }

  async findAll(query: QueryQuestionsDto, user: AuthUser) {
    const { discipline, page = 1, pageSize = 10, search } = query;
    const skip = (page - 1) * pageSize;

    let disciplineIds = user.disciplines.map(d => d.id);

    if (discipline) {
      const targetDiscipline = user.disciplines.find(d => d.slug === discipline);
      if (!targetDiscipline) {
        throw new ForbiddenException('Access denied to this discipline');
      }
      disciplineIds = [targetDiscipline.id];
    }

    const where = {
      disciplineId: { in: disciplineIds },
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

    return {
      data: questions,
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

    if (!this.userHasAccessToDiscipline(user, question.disciplineId)) {
      throw new ForbiddenException('Access denied to this discipline');
    }

    return question;
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

      return tx.question.update({
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
    });
  }

  async approve(uuid: string, user: AuthUser) {
    if (!['REVIEWER', 'EDITOR', 'ADMIN'].includes(user.role)) {
      throw new ForbiddenException('Insufficient permissions to approve questions');
    }

    const question = await this.findOne(uuid, user);

    return this.prisma.question.update({
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
  }

  async remove(uuid: string, user: AuthUser) {
    const question = await this.findOne(uuid, user);

    return this.prisma.question.delete({
      where: { uuid },
    });
  }

  private userHasAccessToDiscipline(user: AuthUser, disciplineId: bigint): boolean {
    return user.disciplines.some(d => d.id === disciplineId);
  }
}