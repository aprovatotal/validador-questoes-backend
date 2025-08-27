import { ApiProperty } from '@nestjs/swagger';

export class DisciplineResponseDto {
  @ApiProperty({
    description: 'ID único da disciplina',
    example: 1
  })
  id: number;

  @ApiProperty({
    description: 'Slug único da disciplina',
    example: 'mathematics'
  })
  slug: string;

  @ApiProperty({
    description: 'Nome da disciplina',
    example: 'Matemática'
  })
  name: string;
}

export class PaginatedDisciplinesResponseDto {
  @ApiProperty({
    description: 'Lista de disciplinas',
    type: [DisciplineResponseDto]
  })
  data: DisciplineResponseDto[];

  @ApiProperty({
    description: 'Metadados da paginação',
    example: {
      page: 1,
      pageSize: 10,
      total: 25,
      totalPages: 3
    }
  })
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}