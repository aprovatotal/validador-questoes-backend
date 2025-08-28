import { Injectable, BadRequestException, UnauthorizedException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { user_role } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto, adminUser: any) {
    if (adminUser.role !== user_role.ADMIN) {
      throw new ForbiddenException('Access denied. Only ADMIN can register users.');
    }

    const { name, email, password, disciplineIds = [] } = registerDto;

    const existingUser = await this.prisma.appUser.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      throw new BadRequestException('Email already registered');
    }

    const passwordHash = await argon2.hash(password);

    const user = await this.prisma.appUser.create({
      data: {
        name,
        email: email.toLowerCase(),
        passwordHash,
        userDisciplines: {
          create: disciplineIds.map(disciplineId => ({
            disciplineId: BigInt(disciplineId),
          })),
        },
      },
      include: {
        userDisciplines: {
          include: { discipline: true },
        },
      },
    });

    const tokens = await this.generateTokens(user.uuid, user.email, user.role);

    await this.prisma.appUser.update({
      where: { uuid: user.uuid },
      data: { lastLoginAt: new Date() },
    });

    return {
      user: {
        uuid: user.uuid,
        name: user.name,
        email: user.email,
        role: user.role,
        disciplines: user.userDisciplines.map(ud => ud.discipline),
      },
      ...tokens,
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.prisma.appUser.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        userDisciplines: {
          include: { discipline: true },
        },
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await argon2.verify(user.passwordHash, password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateTokens(user.uuid, user.email, user.role);

    await this.prisma.appUser.update({
      where: { uuid: user.uuid },
      data: { lastLoginAt: new Date() },
    });

    return {
      user: {
        uuid: user.uuid,
        name: user.name,
        email: user.email,
        role: user.role,
        disciplines: user.userDisciplines.map(ud => ud.discipline),
      },
      ...tokens,
    };
  }

  async refresh(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      const user = await this.prisma.appUser.findUnique({
        where: { uuid: payload.sub },
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      return this.generateTokens(user.uuid, user.email, user.role);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async adminChangePassword(changePasswordDto: ChangePasswordDto, adminUser: any) {
    if (adminUser.role !== user_role.ADMIN) {
      throw new ForbiddenException('Access denied. Only ADMIN can change user passwords.');
    }

    const { userUuid, newPassword } = changePasswordDto;

    const targetUser = await this.prisma.appUser.findUnique({
      where: { uuid: userUuid },
    });

    if (!targetUser) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const newPasswordHash = await argon2.hash(newPassword);

    await this.prisma.appUser.update({
      where: { uuid: userUuid },
      data: { 
        passwordHash: newPasswordHash,
        updatedAt: new Date()
      },
    });

    return {
      message: 'Senha alterada com sucesso',
      userUuid: userUuid
    };
  }

  private async generateTokens(uuid: string, email: string, role: string) {
    const payload = { sub: uuid, email, role };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
        expiresIn: `${this.configService.get<number>('JWT_ACCESS_TTL')}s`,
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: `${this.configService.get<number>('JWT_REFRESH_TTL')}s`,
      }),
    ]);

    return { accessToken, refreshToken };
  }
}