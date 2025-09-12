import { ApiProperty } from "@nestjs/swagger";

export class AlternativeResponseDto {
  @ApiProperty({
    description: "UUID da alternativa",
    example: "550e8400-e29b-41d4-a716-446655440000",
  })
  uuid: string;

  @ApiProperty({
    description: "Texto da alternativa",
    example: "1822",
  })
  text: string;

  @ApiProperty({
    description: "Ordem de exibição",
    example: 1,
  })
  order: number;

  @ApiProperty({
    description: "Indica se é a alternativa correta",
    example: true,
  })
  correct: boolean;
}

export class DisciplineResponseDto {
  @ApiProperty({
    description: "ID da disciplina",
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: "Slug da disciplina",
    example: "history",
  })
  slug: string;

  @ApiProperty({
    description: "Nome da disciplina",
    example: "História",
  })
  name: string;
}

export class UserBasicResponseDto {
  @ApiProperty({
    description: "UUID do usuário",
    example: "550e8400-e29b-41d4-a716-446655440000",
  })
  uuid: string;

  @ApiProperty({
    description: "Nome do usuário",
    example: "Ana Portuguesa",
  })
  name: string;

  @ApiProperty({
    description: "Role do usuário",
    example: "EDITOR",
  })
  role: string;
}

export class QuestionResponseDto {
  @ApiProperty({
    description: "UUID da questão",
    example: "550e8400-e29b-41d4-a716-446655440000",
  })
  uuid: string;

  @ApiProperty({
    description: "ID externo da questão",
    example: "HIS001",
  })
  externalid: string;

  @ApiProperty({
    description: "Enunciado da questão",
    example: "Em que ano foi proclamada a Independência do Brasil?",
  })
  statement: string;

  @ApiProperty({
    description: "Competência avaliada",
    example: "Compreender marcos históricos",
  })
  competence: string;

  @ApiProperty({
    description: "Habilidade específica",
    example: "Identificar datas importantes da história brasileira",
  })
  skill: string;

  @ApiProperty({
    description: "Área do exame",
    example: "ch",
  })
  examArea: string;

  @ApiProperty({
    description: "Assunto",
    example: "História do Brasil",
  })
  subject: string;

  @ApiProperty({
    description: "Tópico específico",
    example: "Brasil Independente",
  })
  topic: string;

  @ApiProperty({
    description: "Interpretação pedagógica",
    example: "Questão sobre marco fundamental da história brasileira.",
    nullable: true,
  })
  interpretation: string | null;

  @ApiProperty({
    description: "Estratégias de resolução",
    example:
      "Conhecer cronologia da história do Brasil; Associar eventos e datas",
    nullable: true,
  })
  strategies: string | null;

  @ApiProperty({
    description: "Descrição dos distratores",
    example: "Datas de outros eventos importantes da história brasileira",
    nullable: true,
  })
  distractors: string | null;

  @ApiProperty({
    description: "Status de aprovação",
    example: true,
  })
  approved: boolean;

  @ApiProperty({
    description: "Data de aprovação",
    example: "2024-01-15T10:30:00Z",
    nullable: true,
  })
  approvedAt: string | null;

  @ApiProperty({
    description: "Data de criação",
    example: "2024-01-15T10:00:00Z",
  })
  createdAt: string;

  @ApiProperty({
    description: "Data de atualização",
    example: "2024-01-15T10:30:00Z",
  })
  updatedAt: string;

  @ApiProperty({
    description: "Disciplina da questão",
    type: DisciplineResponseDto,
  })
  discipline: DisciplineResponseDto;

  @ApiProperty({
    description: "Usuário que aprovou a questão",
    type: UserBasicResponseDto,
    nullable: true,
  })
  approvedByUser: UserBasicResponseDto | null;

  @ApiProperty({
    description: "Alternativas da questão",
    type: [AlternativeResponseDto],
  })
  alternatives: AlternativeResponseDto[];

  @ApiProperty({
    description: "Resolução do texto",
    example: "Questão sobre marco fundamental da história brasileira.",
  })
  textResolution: string;

  @ApiProperty({
    description: "Aplicação da questão",
    example: "Questão sobre marco fundamental da história brasileira.",
  })
  application: string;
}

export class PaginatedQuestionsResponseDto {
  @ApiProperty({
    description: "Lista de questões",
    type: [QuestionResponseDto],
  })
  data: QuestionResponseDto[];

  @ApiProperty({
    description: "Informações de paginação",
    example: {
      page: 1,
      pageSize: 10,
      total: 25,
      totalPages: 3,
      hasNext: true,
      hasPrev: false,
    },
  })
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export class QuestionCreatedResponseDto {
  @ApiProperty({
    description: "Mensagem de sucesso",
    example: "Questão criada com sucesso",
  })
  message: string;

  @ApiProperty({
    description: "Dados da questão criada",
    type: QuestionResponseDto,
  })
  question: QuestionResponseDto;
}

export class QuestionApprovedResponseDto {
  @ApiProperty({
    description: "Mensagem de sucesso",
    example: "Questão aprovada com sucesso",
  })
  message: string;

  @ApiProperty({
    description: "UUID da questão aprovada",
    example: "550e8400-e29b-41d4-a716-446655440000",
  })
  questionUuid: string;

  @ApiProperty({
    description: "Data de aprovação",
    example: "2024-01-15T10:30:00Z",
  })
  approvedAt: string;

  @ApiProperty({
    description: "Usuário que aprovou",
    type: UserBasicResponseDto,
  })
  approvedBy: UserBasicResponseDto;
}
