import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QueryDisciplinesDto } from './dto/query-disciplines.dto';
import { user_role } from '@prisma/client';

export interface AuthUser {
  uuid: string;
  email: string;
  name: string;
  role: user_role;
  disciplines: Array<{ id: bigint; slug: string; name: string }>;
}

@Injectable()
export class DisciplinesService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryDisciplinesDto, user: AuthUser) {
    const { page = 1, pageSize = 10, search } = query;
    const skip = (page - 1) * pageSize;

    let whereClause: any = {};

    if (user.role !== 'ADMIN') {
      const userDisciplineIds = user.disciplines.map(d => d.id);
      whereClause.id = { in: userDisciplineIds };
    }

    if (search) {
      whereClause.name = {
        contains: search,
        mode: 'insensitive' as const
      };
    }

    const [disciplines, total] = await Promise.all([
      this.prisma.discipline.findMany({
        where: whereClause,
        skip,
        take: pageSize,
        orderBy: { name: 'asc' },
      }),
      this.prisma.discipline.count({ where: whereClause }),
    ]);

    return {
      data: disciplines.map(discipline => ({
        id: Number(discipline.id),
        slug: discipline.slug,
        name: discipline.name,
      })),
      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }
}