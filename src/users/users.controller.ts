import { 
  Controller, 
  Get, 
  Patch, 
  Query, 
  Param, 
  UseGuards,
  Request 
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth, 
  ApiQuery,
  ApiParam
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { QueryUsersDto } from './dto/query-users.dto';
import { 
  UserResponseDto, 
  PaginatedUsersResponseDto, 
  UserStatusResponseDto 
} from './dto/user-response.dto';
import { 
  UnauthorizedErrorResponseDto,
  NotFoundErrorResponseDto,
  ErrorResponseDto 
} from '../common/dto/error-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/guards/roles.guard';
import { user_role } from '@prisma/client';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(user_role.ADMIN)
@ApiBearerAuth('JWT-auth')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ 
    summary: 'Listar usuários',
    description: 'Lista usuários com informações completas, perfil e disciplinas. Apenas usuários ADMIN podem acessar esta funcionalidade.'
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
    description: 'Termo de busca por nome ou email do usuário',
    example: 'joão'
  })
  @ApiQuery({ 
    name: 'role', 
    required: false, 
    description: 'Filtrar por perfil do usuário',
    enum: user_role,
    example: 'USER'
  })
  @ApiQuery({ 
    name: 'isActive', 
    required: false, 
    description: 'Filtrar por status ativo/inativo',
    example: true
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de usuários retornada com sucesso',
    type: PaginatedUsersResponseDto,
    schema: {
      example: {
        data: [
          {
            uuid: '550e8400-e29b-41d4-a716-446655440000',
            name: 'João Silva',
            email: 'joao@email.com',
            role: 'USER',
            isActive: true,
            emailVerifiedAt: '2024-01-15T10:30:00Z',
            lastLoginAt: '2024-01-20T14:30:00Z',
            createdAt: '2024-01-10T09:00:00Z',
            updatedAt: '2024-01-20T14:30:00Z',
            disciplines: [
              {
                id: 1,
                slug: 'mathematics',
                name: 'Matemática'
              },
              {
                id: 2,
                slug: 'portuguese',
                name: 'Português'
              }
            ]
          }
        ],
        meta: {
          page: 1,
          pageSize: 10,
          total: 1,
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
  @ApiResponse({ 
    status: 403, 
    description: 'Usuário sem permissão para listar usuários',
    schema: {
      example: {
        statusCode: 403,
        message: 'Access denied. Only ADMIN can list users.',
        timestamp: '2024-01-15T10:30:00Z',
        path: '/users'
      }
    }
  })
  findAll(@Query() query: QueryUsersDto, @Request() req) {
    return this.usersService.findAll(query, req.user);
  }

  @Patch(':uuid/deactivate')
  @ApiOperation({ 
    summary: 'Inativar usuário',
    description: 'Inativa um usuário no sistema, impedindo seu login. Apenas usuários ADMIN podem executar esta ação. Não é possível inativar a própria conta.'
  })
  @ApiParam({ 
    name: 'uuid', 
    description: 'UUID do usuário a ser inativado',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Usuário inativado com sucesso',
    type: UserStatusResponseDto,
    schema: {
      example: {
        message: 'Usuário inativado com sucesso',
        userUuid: '550e8400-e29b-41d4-a716-446655440000',
        isActive: false
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
    description: 'Usuário sem permissão ou tentando inativar própria conta',
    schema: {
      example: {
        statusCode: 403,
        message: 'Cannot deactivate your own account',
        timestamp: '2024-01-15T10:30:00Z',
        path: '/users/550e8400-e29b-41d4-a716-446655440000/deactivate'
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Usuário não encontrado',
    type: NotFoundErrorResponseDto 
  })
  deactivateUser(@Param('uuid') uuid: string, @Request() req) {
    return this.usersService.deactivateUser(uuid, req.user);
  }

  @Patch(':uuid/activate')
  @ApiOperation({ 
    summary: 'Ativar usuário',
    description: 'Ativa um usuário inativo no sistema, permitindo seu login novamente. Apenas usuários ADMIN podem executar esta ação.'
  })
  @ApiParam({ 
    name: 'uuid', 
    description: 'UUID do usuário a ser ativado',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Usuário ativado com sucesso',
    type: UserStatusResponseDto,
    schema: {
      example: {
        message: 'Usuário ativado com sucesso',
        userUuid: '550e8400-e29b-41d4-a716-446655440000',
        isActive: true
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
    description: 'Usuário sem permissão para ativar usuários',
    schema: {
      example: {
        statusCode: 403,
        message: 'Access denied. Only ADMIN can activate users.',
        timestamp: '2024-01-15T10:30:00Z',
        path: '/users/550e8400-e29b-41d4-a716-446655440000/activate'
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Usuário não encontrado',
    type: NotFoundErrorResponseDto 
  })
  activateUser(@Param('uuid') uuid: string, @Request() req) {
    return this.usersService.activateUser(uuid, req.user);
  }
}