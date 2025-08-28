import { ApiProperty } from '@nestjs/swagger';

export class DisciplineStatsDto {
  @ApiProperty({ 
    example: 1,
    description: 'ID da disciplina' 
  })
  id: number;

  @ApiProperty({ 
    example: 'mathematics',
    description: 'Slug da disciplina' 
  })
  slug: string;

  @ApiProperty({ 
    example: 'Matemática',
    description: 'Nome da disciplina' 
  })
  name: string;

  @ApiProperty({ 
    example: 150,
    description: 'Total de questões da disciplina' 
  })
  totalQuestions: number;

  @ApiProperty({ 
    example: 100,
    description: 'Total de questões aprovadas' 
  })
  approvedQuestions: number;

  @ApiProperty({ 
    example: 50,
    description: 'Total de questões pendentes de aprovação' 
  })
  pendingQuestions: number;
}

export class DashboardStatsDto {
  @ApiProperty({ 
    example: 450,
    description: 'Total de questões em todas as disciplinas permitidas' 
  })
  totalQuestions: number;

  @ApiProperty({ 
    example: 300,
    description: 'Total de questões aprovadas em todas as disciplinas permitidas' 
  })
  totalApproved: number;

  @ApiProperty({ 
    example: 150,
    description: 'Total de questões pendentes em todas as disciplinas permitidas' 
  })
  totalPending: number;

  @ApiProperty({ 
    type: [DisciplineStatsDto],
    description: 'Estatísticas por disciplina que o usuário tem acesso'
  })
  disciplineStats: DisciplineStatsDto[];

  @ApiProperty({ 
    example: '2024-01-15T10:30:00Z',
    description: 'Data/hora da geração das estatísticas' 
  })
  generatedAt: Date;
}