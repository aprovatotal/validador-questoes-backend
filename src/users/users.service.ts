import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QueryUsersDto } from './dto/query-users.dto';
import { user_role } from '@prisma/client';

export interface AuthUser {
  uuid: string;
  email: string;
  name: string;
  role: user_role;
  disciplines: Array<{ id: bigint; slug: string; name: string }>;
}

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryUsersDto, user: AuthUser) {
    if (user.role !== 'ADMIN') {
      throw new ForbiddenException('Access denied. Only ADMIN can list users');
    }

    const { page = 1, pageSize = 10, search, role, isActive } = query;
    const skip = (page - 1) * pageSize;

    let whereClause: any = {};

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' as const } },
        { email: { contains: search, mode: 'insensitive' as const } },
      ];
    }

    if (role) {
      whereClause.role = role;
    }

    if (typeof isActive === 'boolean') {
      whereClause.isActive = isActive;
    }

    const [users, total] = await Promise.all([
      this.prisma.appUser.findMany({
        where: whereClause,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          userDisciplines: {
            include: {
              discipline: true
            }
          }
        },
      }),
      this.prisma.appUser.count({ where: whereClause }),
    ]);

    return {
      data: users.map(user => ({
        uuid: user.uuid,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        emailVerifiedAt: user.emailVerifiedAt,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        disciplines: user.userDisciplines.map(ud => ({
          id: Number(ud.discipline.id),
          slug: ud.discipline.slug,
          name: ud.discipline.name,
        })),
      })),
      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async deactivateUser(userUuid: string, currentUser: AuthUser) {
    if (currentUser.role !== 'ADMIN') {
      throw new ForbiddenException('Access denied. Only ADMIN can deactivate users');
    }

    if (currentUser.uuid === userUuid) {
      throw new ForbiddenException('Cannot deactivate your own account');
    }

    const user = await this.prisma.appUser.findUnique({
      where: { uuid: userUuid },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.isActive) {
      throw new ForbiddenException('User is already inactive');
    }

    const updatedUser = await this.prisma.appUser.update({
      where: { uuid: userUuid },
      data: { isActive: false },
    });

    return {
      message: 'Usuário inativado com sucesso',
      userUuid: updatedUser.uuid,
      isActive: updatedUser.isActive,
    };
  }

  async activateUser(userUuid: string, currentUser: AuthUser) {
    if (currentUser.role !== 'ADMIN') {
      throw new ForbiddenException('Access denied. Only ADMIN can activate users');
    }

    const user = await this.prisma.appUser.findUnique({
      where: { uuid: userUuid },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.isActive) {
      throw new ForbiddenException('User is already active');
    }

    const updatedUser = await this.prisma.appUser.update({
      where: { uuid: userUuid },
      data: { isActive: true },
    });

    return {
      message: 'Usuário ativado com sucesso',
      userUuid: updatedUser.uuid,
      isActive: updatedUser.isActive,
    };
  }
}