import {
  IsString,
  IsArray,
  IsNumber,
  IsOptional,
  ValidateNested,
  IsBoolean,
} from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";

export class CreateAlternativeDto {
  @ApiProperty({
    description: "Texto da alternativa",
    example: "Brasil foi descoberto em 1500",
  })
  @IsString()
  text: string;

  @ApiProperty({
    description: "Ordem de exibição da alternativa",
    example: 1,
    minimum: 1,
  })
  @IsNumber()
  order: number;

  @ApiProperty({
    description: "Indica se a alternativa é correta",
    example: true,
  })
  @IsBoolean()
  correct: boolean;
}

export class CreateQuestionDto {
  @ApiProperty({
    description:
      "ID externo da questão (identificador único do sistema de origem)",
    example: "HIS001",
  })
  @IsString()
  externalid: string;

  @ApiProperty({
    description: "Enunciado da questão",
    example: "Em que ano foi proclamada a Independência do Brasil?",
  })
  @IsString()
  statement: string;

  @ApiProperty({
    description: "Competência avaliada pela questão",
    example: "Compreender marcos históricos",
  })
  @IsString()
  competence: string;

  @ApiProperty({
    description: "Habilidade específica avaliada",
    example: "Identificar datas importantes da história brasileira",
  })
  @IsString()
  skill: string;

  @ApiProperty({
    description: "Área do exame (ch, cn, lc, mt)",
    example: "ch",
    enum: ["ch", "cn", "lc", "mt"],
  })
  @IsString()
  examArea: string;

  @ApiProperty({
    description: "Assunto da questão",
    example: "História do Brasil",
  })
  @IsString()
  subject: string;

  @ApiProperty({
    description: "ID da disciplina",
    example: 5,
  })
  @IsNumber()
  disciplineId: number;

  @ApiProperty({
    description: "Tópico específico da questão",
    example: "Brasil Independente",
  })
  @IsString()
  topic: string;

  @ApiProperty({
    description: "Interpretação pedagógica da questão",
    example: "Questão sobre marco fundamental da história brasileira.",
    required: false,
  })
  @IsOptional()
  @IsString()
  interpretation?: string;

  @ApiProperty({
    description: "Estratégias de resolução",
    example:
      "Conhecer cronologia da história do Brasil; Associar eventos e datas",
    required: false,
  })
  @IsOptional()
  @IsString()
  strategies?: string;

  @ApiProperty({
    description: "Descrição dos distratores (alternativas incorretas)",
    example: "Datas de outros eventos importantes da história brasileira",
    required: false,
  })
  @IsOptional()
  @IsString()
  distractors?: string;

  @ApiProperty({
    description: "Lista de alternativas da questão",
    type: [CreateAlternativeDto],
    example: [
      { text: "1822", order: 1, correct: true },
      { text: "1889", order: 2, correct: false },
      { text: "1888", order: 3, correct: false },
      { text: "1824", order: 4, correct: false },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAlternativeDto)
  alternatives: CreateAlternativeDto[];

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

  @ApiProperty({
    description: "ID do módulo (de acordo com a plataforma)",
    example: "abc123",
  })
  @IsString()
  moduleId: string;

  @ApiProperty({
    description: "ID do assunto (de acordo com a plataforma)",
    example: "abc123",
  })
  @IsString()
  subjectId: string;
}
