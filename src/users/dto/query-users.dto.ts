import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsPositive, Min, IsString, IsEnum, IsBoolean } from 'class-validator';
import { user_role } from '@prisma/client';

export class QueryUsersDto {
  @ApiPropertyOptional({
    description: 'Número da página',
    example: 1,
    minimum: 1
  })
  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Quantidade de itens por página',
    example: 10,
    minimum: 1,
    maximum: 100
  })
  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  @Min(1)
  pageSize?: number = 10;

  @ApiPropertyOptional({
    description: 'Termo para busca por nome ou email do usuário',
    example: 'joão'
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por perfil do usuário',
    enum: user_role,
    example: 'USER'
  })
  @IsOptional()
  @IsEnum(user_role)
  role?: user_role;

  @ApiPropertyOptional({
    description: 'Filtrar por status ativo/inativo',
    example: true
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean;
}