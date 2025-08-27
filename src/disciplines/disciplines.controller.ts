import { 
  Controller, 
  Get, 
  Query, 
  UseGuards,
  Request 
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth, 
  ApiQuery
} from '@nestjs/swagger';
import { DisciplinesService } from './disciplines.service';
import { QueryDisciplinesDto } from './dto/query-disciplines.dto';
import { 
  DisciplineResponseDto, 
  PaginatedDisciplinesResponseDto 
} from './dto/discipline-response.dto';
import { 
  UnauthorizedErrorResponseDto 
} from '../common/dto/error-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('disciplines')
@Controller('disciplines')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class DisciplinesController {
  constructor(private readonly disciplinesService: DisciplinesService) {}

  @Get()
  @ApiOperation({ 
    summary: 'Listar disciplinas',
    description: 'Lista disciplinas com paginação e filtros. Usuários ADMIN veem todas as disciplinas, outros usuários veem apenas as disciplinas associadas a eles.'
  })
  @ApiQuery({ 
    name: 'page', 
    required: false, 
    description: 'Número da página',
    example: 1
  })
  @ApiQuery({ 
    name: 'pageSize', 
    required: false, 
    description: 'Itens por página (máximo 100)',
    example: 10
  })
  @ApiQuery({ 
    name: 'search', 
    required: false, 
    description: 'Termo de busca por nome da disciplina',
    example: 'matemática'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de disciplinas retornada com sucesso',
    type: PaginatedDisciplinesResponseDto,
    schema: {
      example: {
        data: [
          {
            id: 1,
            slug: 'mathematics',
            name: 'Matemática'
          },
          {
            id: 2,
            slug: 'portuguese',
            name: 'Português'
          },
          {
            id: 5,
            slug: 'history',
            name: 'História'
          }
        ],
        meta: {
          page: 1,
          pageSize: 10,
          total: 3,
          totalPages: 1
        }
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Token inválido ou ausente',
    type: UnauthorizedErrorResponseDto 
  })
  findAll(@Query() query: QueryDisciplinesDto, @Request() req) {
    return this.disciplinesService.findAll(query, req.user);
  }
}