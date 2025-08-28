import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth 
} from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { DashboardStatsDto } from './dto/dashboard-stats.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UnauthorizedErrorResponseDto } from '../common/dto/error-response.dto';

@ApiTags('dashboard')
@Controller('dashboard')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @ApiOperation({ 
    summary: 'Obter estatísticas do dashboard',
    description: 'Retorna estatísticas de questões baseadas nas permissões de disciplina do usuário. Inclui totais gerais e detalhamento por disciplina.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Estatísticas retornadas com sucesso',
    type: DashboardStatsDto,
    schema: {
      example: {
        totalQuestions: 450,
        totalApproved: 300,
        totalPending: 150,
        disciplineStats: [
          {
            id: 1,
            slug: 'mathematics',
            name: 'Matemática',
            totalQuestions: 150,
            approvedQuestions: 100,
            pendingQuestions: 50
          },
          {
            id: 2,
            slug: 'portuguese',
            name: 'Português',
            totalQuestions: 120,
            approvedQuestions: 80,
            pendingQuestions: 40
          },
          {
            id: 3,
            slug: 'physics',
            name: 'Física',
            totalQuestions: 90,
            approvedQuestions: 60,
            pendingQuestions: 30
          },
          {
            id: 4,
            slug: 'chemistry',
            name: 'Química',
            totalQuestions: 90,
            approvedQuestions: 60,
            pendingQuestions: 30
          }
        ],
        generatedAt: '2024-01-15T10:30:00Z'
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
    description: 'Usuário sem acesso a nenhuma disciplina',
    schema: {
      example: {
        statusCode: 403,
        message: 'Você não tem acesso a nenhuma disciplina',
        timestamp: '2024-01-15T10:30:00Z'
      }
    }
  })
  getStats(@Request() req) {
    return this.dashboardService.getStats(req.user);
  }
}