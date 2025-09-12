import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  Query, 
  UseGuards,
  Request 
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth, 
  ApiParam, 
  ApiQuery, 
  ApiBody 
} from '@nestjs/swagger';
import { QuestionsService } from './questions.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { QueryQuestionsDto } from './dto/query-questions.dto';
import { 
  QuestionResponseDto, 
  PaginatedQuestionsResponseDto, 
  QuestionCreatedResponseDto, 
  QuestionApprovedResponseDto 
} from './dto/question-response.dto';
import { 
  ErrorResponseDto, 
  ValidationErrorResponseDto, 
  UnauthorizedErrorResponseDto, 
  NotFoundErrorResponseDto 
} from '../common/dto/error-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/guards/roles.guard';
import { user_role } from '@prisma/client';

@ApiTags('questions')
@Controller('questions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Post()
  @ApiOperation({ 
    summary: 'Criar nova questão',
    description: 'Cria uma nova questão no sistema com suas alternativas. Requer autenticação JWT.'
  })
  @ApiBody({ 
    type: CreateQuestionDto,
    description: 'Dados da questão a ser criada',
    examples: {
      historia: {
        summary: 'Questão de História',
        description: 'Exemplo de questão de história do Brasil',
        value: {
          externalid: 'HIS002',
          statement: 'Quem foi o primeiro presidente do Brasil?',
          competence: 'Compreender períodos históricos',
          skill: 'Identificar personagens históricos importantes',
          examArea: 'ch',
          subject: 'História do Brasil',
          disciplineId: 5,
          topic: 'República Velha',
          interpretation: 'Questão sobre o início da República no Brasil.',
          strategies: 'Conhecer cronologia política brasileira; Associar personagens e períodos',
          distractors: 'Outros presidentes e líderes políticos brasileiros',
          alternatives: [
            { text: 'Deodoro da Fonseca', order: 1, correct: true },
            { text: 'Getúlio Vargas', order: 2, correct: false },
            { text: 'Juscelino Kubitschek', order: 3, correct: false },
            { text: 'Floriano Peixoto', order: 4, correct: false }
          ]
        }
      },
      matematica: {
        summary: 'Questão de Matemática',
        description: 'Exemplo de questão de matemática básica',
        value: {
          externalid: 'MAT003',
          statement: 'Qual é o resultado de 25 × 4?',
          competence: 'Resolver problemas numéricos',
          skill: 'Operações básicas com multiplicação',
          examArea: 'mt',
          subject: 'Aritmética',
          disciplineId: 1,
          topic: 'Multiplicação',
          alternatives: [
            { text: '100', order: 1, correct: true },
            { text: '90', order: 2, correct: false },
            { text: '110', order: 3, correct: false },
            { text: '95', order: 4, correct: false }
          ]
        }
      }
    }
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Questão criada com sucesso',
    type: QuestionCreatedResponseDto,
    schema: {
      example: {
        message: 'Questão criada com sucesso',
        question: {
          uuid: '550e8400-e29b-41d4-a716-446655440000',
          externalid: 'HIS002',
          statement: 'Quem foi o primeiro presidente do Brasil?',
          competence: 'Compreender períodos históricos',
          skill: 'Identificar personagens históricos importantes',
          examArea: 'ch',
          subject: 'História do Brasil',
          topic: 'República Velha',
          interpretation: 'Questão sobre o início da República no Brasil.',
          strategies: 'Conhecer cronologia política brasileira',
          distractors: 'Outros presidentes e líderes políticos brasileiros',
          approved: false,
          approvedAt: null,
          createdAt: '2024-01-15T10:30:00Z',
          updatedAt: '2024-01-15T10:30:00Z',
          discipline: {
            id: 5,
            slug: 'history',
            name: 'História'
          },
          approvedByUser: null,
          alternatives: [
            {
              uuid: '550e8400-e29b-41d4-a716-446655440001',
              text: 'Deodoro da Fonseca',
              order: 1,
              correct: true
            }
          ]
        }
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Dados inválidos',
    type: ValidationErrorResponseDto 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Token inválido ou ausente',
    type: UnauthorizedErrorResponseDto 
  })
  create(@Body() createQuestionDto: CreateQuestionDto, @Request() req) {
    return this.questionsService.create(createQuestionDto, req.user);
  }

  @Get()
  @ApiOperation({ 
    summary: 'Listar questões',
    description: 'Lista questões com paginação e filtros. O usuário só vê questões das disciplinas que tem acesso.'
  })
  @ApiQuery({ name: 'discipline', required: false, description: 'Slug da disciplina' })
  @ApiQuery({ name: 'page', required: false, description: 'Número da página' })
  @ApiQuery({ name: 'pageSize', required: false, description: 'Itens por página' })
  @ApiQuery({ name: 'search', required: false, description: 'Termo de busca' })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de questões retornada com sucesso',
    type: PaginatedQuestionsResponseDto,
    schema: {
      example: {
        data: [
          {
            uuid: '550e8400-e29b-41d4-a716-446655440000',
            externalid: 'HIS001',
            statement: 'Em que ano foi proclamada a Independência do Brasil?',
            competence: 'Compreender marcos históricos',
            skill: 'Identificar datas importantes da história brasileira',
            examArea: 'ch',
            subject: 'História do Brasil',
            topic: 'Brasil Independente',
            approved: true,
            approvedAt: '2024-01-15T10:30:00Z',
            createdAt: '2024-01-15T10:00:00Z',
            updatedAt: '2024-01-15T10:30:00Z',
            discipline: {
              id: 5,
              slug: 'history',
              name: 'História'
            },
            alternatives: []
          }
        ],
        pagination: {
          page: 1,
          pageSize: 10,
          total: 25,
          totalPages: 3,
          hasNext: true,
          hasPrev: false
        }
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Token inválido ou ausente',
    type: UnauthorizedErrorResponseDto 
  })
  findAll(@Query() query: QueryQuestionsDto, @Request() req) {
    return this.questionsService.findAll(query, req.user);
  }

  @Get('approved')
  @ApiOperation({ 
    summary: 'Listar questões aprovadas',
    description: 'Lista apenas questões aprovadas com paginação e filtros. O usuário só vê questões das disciplinas que tem acesso.'
  })
  @ApiQuery({ name: 'discipline', required: false, description: 'Slug da disciplina' })
  @ApiQuery({ name: 'page', required: false, description: 'Número da página' })
  @ApiQuery({ name: 'pageSize', required: false, description: 'Itens por página' })
  @ApiQuery({ name: 'search', required: false, description: 'Termo de busca' })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de questões aprovadas retornada com sucesso',
    type: PaginatedQuestionsResponseDto,
    schema: {
      example: {
        data: [
          {
            uuid: '550e8400-e29b-41d4-a716-446655440000',
            externalid: 'HIS001',
            statement: 'Em que ano foi proclamada a Independência do Brasil?',
            competence: 'Compreender marcos históricos',
            skill: 'Identificar datas importantes da história brasileira',
            examArea: 'ch',
            subject: 'História do Brasil',
            topic: 'Brasil Independente',
            approved: true,
            approvedAt: '2024-01-15T10:30:00Z',
            createdAt: '2024-01-15T10:00:00Z',
            updatedAt: '2024-01-15T10:30:00Z',
            discipline: {
              id: 5,
              slug: 'history',
              name: 'História'
            },
            approvedByUser: {
              name: 'Ana Revisora',
              email: 'ana.revisora@email.com'
            },
            alternatives: []
          }
        ],
        pagination: {
          page: 1,
          pageSize: 10,
          total: 15,
          totalPages: 2,
          hasNext: true,
          hasPrev: false
        }
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Token inválido ou ausente',
    type: UnauthorizedErrorResponseDto 
  })
  findApproved(@Query() query: QueryQuestionsDto, @Request() req) {
    return this.questionsService.findApproved(query, req.user);
  }

  @Get(':uuid')
  @ApiOperation({ 
    summary: 'Buscar questão por UUID',
    description: 'Retorna uma questão específica com todas as suas informações e alternativas.'
  })
  @ApiParam({ 
    name: 'uuid', 
    description: 'UUID da questão',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Questão encontrada',
    type: QuestionResponseDto,
    schema: {
      example: {
        uuid: '550e8400-e29b-41d4-a716-446655440000',
        externalid: 'HIS001',
        statement: 'Em que ano foi proclamada a Independência do Brasil?',
        competence: 'Compreender marcos históricos',
        skill: 'Identificar datas importantes da história brasileira',
        examArea: 'ch',
        subject: 'História do Brasil',
        topic: 'Brasil Independente',
        interpretation: 'Questão sobre marco fundamental da história brasileira.',
        strategies: 'Conhecer cronologia da história do Brasil; Associar eventos e datas',
        distractors: 'Datas de outros eventos importantes da história brasileira',
        approved: true,
        approvedAt: '2024-01-15T10:30:00Z',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:30:00Z',
        textResolution: 'Questão sobre marco fundamental da história brasileira.',
        application: 'Questão sobre marco fundamental da história brasileira.',
        discipline: {
          id: 5,
          slug: 'history',
          name: 'História'
        },
        approvedByUser: {
          uuid: '550e8400-e29b-41d4-a716-446655440001',
          name: 'Ana Portuguesa',
          role: 'EDITOR'
        },
        alternatives: [
          {
            uuid: '550e8400-e29b-41d4-a716-446655440002',
            text: '1822',
            order: 1,
            correct: true
          },
          {
            uuid: '550e8400-e29b-41d4-a716-446655440003',
            text: '1889',
            order: 2,
            correct: false
          }
        ]
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Questão não encontrada',
    type: NotFoundErrorResponseDto 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Token inválido ou ausente',
    type: UnauthorizedErrorResponseDto 
  })
  findOne(@Param('uuid') uuid: string, @Request() req) {
    return this.questionsService.findOne(uuid, req.user);
  }

  @Patch(':uuid')
  @ApiOperation({ 
    summary: 'Atualizar questão',
    description: 'Atualiza os dados de uma questão existente. Apenas o criador da questão ou usuários com permissões superiores podem editar.'
  })
  @ApiParam({ 
    name: 'uuid', 
    description: 'UUID da questão a ser atualizada',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @ApiBody({ 
    type: UpdateQuestionDto,
    description: 'Dados a serem atualizados (todos os campos são opcionais)',
    examples: {
      atualizar_enunciado: {
        summary: 'Atualizar enunciado',
        description: 'Exemplo de atualização apenas do enunciado',
        value: {
          statement: 'Em que ano foi proclamada a Independência do Brasil por Dom Pedro I?'
        }
      },
      atualizar_completo: {
        summary: 'Atualização completa',
        description: 'Exemplo de atualização de vários campos',
        value: {
          statement: 'Em que ano foi proclamada a Independência do Brasil por Dom Pedro I?',
          interpretation: 'Questão reformulada sobre marco fundamental da história brasileira.',
          strategies: 'Conhecer cronologia da história do Brasil; Identificar personagens históricos; Associar eventos e datas'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Questão atualizada com sucesso',
    type: QuestionResponseDto 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Dados inválidos',
    type: ValidationErrorResponseDto 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Token inválido ou ausente',
    type: UnauthorizedErrorResponseDto 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Questão não encontrada',
    type: NotFoundErrorResponseDto 
  })
  update(
    @Param('uuid') uuid: string, 
    @Body() updateQuestionDto: UpdateQuestionDto,
    @Request() req
  ) {
    return this.questionsService.update(uuid, updateQuestionDto, req.user);
  }

  @Patch(':uuid/approve')
  @UseGuards(RolesGuard)
  @Roles(user_role.REVIEWER, user_role.EDITOR, user_role.ADMIN)
  @ApiOperation({ 
    summary: 'Aprovar questão',
    description: 'Aprova uma questão para uso no sistema. Apenas usuários com papel REVIEWER, EDITOR ou ADMIN podem aprovar questões.'
  })
  @ApiParam({ 
    name: 'uuid', 
    description: 'UUID da questão a ser aprovada',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Questão aprovada com sucesso',
    type: QuestionApprovedResponseDto,
    schema: {
      example: {
        message: 'Questão aprovada com sucesso',
        questionUuid: '550e8400-e29b-41d4-a716-446655440000',
        approvedAt: '2024-01-15T10:30:00Z',
        approvedBy: {
          uuid: '550e8400-e29b-41d4-a716-446655440001',
          name: 'Carlos Matemático',
          role: 'REVIEWER'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Token inválido ou ausente',
    type: UnauthorizedErrorResponseDto 
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Usuário sem permissão para aprovar questões',
    schema: {
      example: {
        statusCode: 403,
        message: 'Acesso negado. Apenas REVIEWER, EDITOR ou ADMIN podem aprovar questões.',
        timestamp: '2024-01-15T10:30:00Z',
        path: '/questions/550e8400-e29b-41d4-a716-446655440000/approve'
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Questão não encontrada',
    type: NotFoundErrorResponseDto 
  })
  approve(@Param('uuid') uuid: string, @Request() req) {
    return this.questionsService.approve(uuid, req.user);
  }

  @Delete(':uuid')
  @ApiOperation({ 
    summary: 'Excluir questão',
    description: 'Remove uma questão do sistema. Apenas o criador da questão ou usuários com permissões superiores podem excluir.'
  })
  @ApiParam({ 
    name: 'uuid', 
    description: 'UUID da questão a ser excluída',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Questão excluída com sucesso',
    schema: {
      example: {
        message: 'Questão excluída com sucesso',
        questionUuid: '550e8400-e29b-41d4-a716-446655440000'
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Token inválido ou ausente',
    type: UnauthorizedErrorResponseDto 
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Usuário sem permissão para excluir esta questão',
    schema: {
      example: {
        statusCode: 403,
        message: 'Acesso negado. Você não tem permissão para excluir esta questão.',
        timestamp: '2024-01-15T10:30:00Z',
        path: '/questions/550e8400-e29b-41d4-a716-446655440000'
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Questão não encontrada',
    type: NotFoundErrorResponseDto 
  })
  remove(@Param('uuid') uuid: string, @Request() req) {
    return this.questionsService.remove(uuid, req.user);
  }
}