import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsPositive, Min, IsString } from 'class-validator';

export class QueryDisciplinesDto {
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
    description: 'Termo para busca por nome da disciplina',
    example: 'matemática'
  })
  @IsOptional()
  @IsString()
  search?: string;
}