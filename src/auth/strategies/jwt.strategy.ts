import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_ACCESS_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.prisma.appUser.findUnique({
      where: { uuid: payload.sub },
      include: { userDisciplines: { include: { discipline: true } } },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException();
    }

    return {
      uuid: user.uuid,
      email: user.email,
      name: user.name,
      role: user.role,
      disciplines: user.userDisciplines.map(ud => ud.discipline),
    };
  }
}