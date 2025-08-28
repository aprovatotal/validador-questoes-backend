import { Controller, Post, Body, UseGuards, Request, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { RegisterResponseDto, LoginResponseDto, AuthResponseDto } from './dto/auth-response.dto';
import { 
  ErrorResponseDto, 
  ValidationErrorResponseDto, 
  ConflictErrorResponseDto,
  UnauthorizedErrorResponseDto,
  NotFoundErrorResponseDto
} from '../common/dto/error-response.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard, Roles } from './guards/roles.guard';
import { user_role } from '@prisma/client';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(user_role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Registrar novo usuário (Admin)',
    description: 'Cria uma nova conta de usuário no sistema. Apenas usuários ADMIN podem registrar novos usuários. O email deve ser único e a senha deve ter pelo menos 8 caracteres.'
  })
  @ApiBody({ 
    type: RegisterDto,
    description: 'Dados para registro do usuário',
    examples: {
      usuario_comum: {
        summary: 'Usuário comum',
        description: 'Exemplo de registro de usuário comum',
        value: {
          name: 'Maria Silva',
          email: 'maria.silva@email.com',
          password: 'MinhaSenh@123',
          disciplineIds: [1, 2]
        }
      },
      editor: {
        summary: 'Editor',
        description: 'Exemplo de registro de editor',
        value: {
          name: 'Carlos Editor',
          email: 'carlos.editor@email.com',
          password: 'EditorSenh@123',
          disciplineIds: [1, 2, 3]
        }
      }
    }
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Usuário registrado com sucesso',
    type: RegisterResponseDto,
    schema: {
      example: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        tokenType: 'Bearer',
        expiresIn: 3600,
        user: {
          uuid: '550e8400-e29b-41d4-a716-446655440000',
          name: 'Maria Silva',
          email: 'maria.silva@email.com',
          role: 'USER',
          createdAt: '2024-01-15T10:30:00Z'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Dados inválidos',
    type: ValidationErrorResponseDto,
    schema: {
      example: {
        statusCode: 400,
        message: 'Dados de entrada inválidos',
        details: [
          'email deve ser um email válido',
          'password deve ter pelo menos 8 caracteres'
        ],
        timestamp: '2024-01-15T10:30:00Z',
        path: '/auth/register'
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
    description: 'Usuário sem permissão de administrador',
    schema: {
      example: {
        statusCode: 403,
        message: 'Access denied. Only ADMIN can register users.',
        timestamp: '2024-01-15T10:30:00Z',
        path: '/auth/register'
      }
    }
  })
  @ApiResponse({ 
    status: 409, 
    description: 'Email já está em uso',
    type: ConflictErrorResponseDto,
    schema: {
      example: {
        statusCode: 409,
        message: 'Email já está em uso',
        timestamp: '2024-01-15T10:30:00Z',
        path: '/auth/register'
      }
    }
  })
  async register(@Body() registerDto: RegisterDto, @Request() req) {
    return this.authService.register(registerDto, req.user);
  }

  @Post('login')
  @ApiOperation({ 
    summary: 'Fazer login',
    description: 'Autentica usuário no sistema usando email e senha, retornando tokens de acesso e refresh.'
  })
  @ApiBody({ 
    type: LoginDto,
    description: 'Credenciais de login',
    examples: {
      admin: {
        summary: 'Administrador',
        description: 'Login como administrador',
        value: {
          email: 'admin@validador.com',
          password: 'admin123'
        }
      },
      reviewer: {
        summary: 'Revisor',
        description: 'Login como revisor',
        value: {
          email: 'carlos@validador.com',
          password: 'carlos123'
        }
      },
      user: {
        summary: 'Usuário comum',
        description: 'Login como usuário comum',
        value: {
          email: 'joao@validador.com',
          password: 'joao123'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Login realizado com sucesso',
    type: LoginResponseDto,
    schema: {
      example: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        tokenType: 'Bearer',
        expiresIn: 3600,
        user: {
          uuid: '550e8400-e29b-41d4-a716-446655440000',
          name: 'Admin Sistema',
          email: 'admin@validador.com',
          role: 'ADMIN',
          createdAt: '2024-01-15T10:30:00Z'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Dados inválidos',
    type: ValidationErrorResponseDto,
    schema: {
      example: {
        statusCode: 400,
        message: 'Dados de entrada inválidos',
        details: ['email deve ser um email válido'],
        timestamp: '2024-01-15T10:30:00Z',
        path: '/auth/login'
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Credenciais inválidas',
    type: UnauthorizedErrorResponseDto,
    schema: {
      example: {
        statusCode: 401,
        message: 'Email ou senha inválidos',
        timestamp: '2024-01-15T10:30:00Z',
        path: '/auth/login'
      }
    }
  })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  @ApiOperation({ 
    summary: 'Renovar token de acesso',
    description: 'Renova o token de acesso usando um refresh token válido. Retorna novos tokens de acesso e refresh.'
  })
  @ApiBody({ 
    type: RefreshDto,
    description: 'Token de refresh para renovação',
    examples: {
      refresh: {
        summary: 'Renovar token',
        description: 'Exemplo de renovação de token',
        value: {
          refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Token renovado com sucesso',
    type: AuthResponseDto,
    schema: {
      example: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        tokenType: 'Bearer',
        expiresIn: 3600
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Token inválido',
    type: ValidationErrorResponseDto,
    schema: {
      example: {
        statusCode: 400,
        message: 'Dados de entrada inválidos',
        details: ['refreshToken não deve estar vazio'],
        timestamp: '2024-01-15T10:30:00Z',
        path: '/auth/refresh'
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Refresh token inválido ou expirado',
    type: UnauthorizedErrorResponseDto,
    schema: {
      example: {
        statusCode: 401,
        message: 'Refresh token inválido ou expirado',
        timestamp: '2024-01-15T10:30:00Z',
        path: '/auth/refresh'
      }
    }
  })
  async refresh(@Body() refreshDto: RefreshDto) {
    return this.authService.refresh(refreshDto.refreshToken);
  }

  @Patch('admin/change-password')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(user_role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Alterar senha de usuário (Admin)',
    description: 'Permite que um administrador altere a senha de qualquer usuário do sistema. Apenas usuários com perfil ADMIN podem usar esta funcionalidade.'
  })
  @ApiBody({ 
    type: ChangePasswordDto,
    description: 'Dados para alteração de senha',
    examples: {
      change_password: {
        summary: 'Alterar senha de usuário',
        description: 'Exemplo de alteração de senha por admin',
        value: {
          userUuid: '550e8400-e29b-41d4-a716-446655440000',
          newPassword: 'NovaSenha@123'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Senha alterada com sucesso',
    schema: {
      example: {
        message: 'Senha alterada com sucesso',
        userUuid: '550e8400-e29b-41d4-a716-446655440000'
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Dados inválidos',
    type: ValidationErrorResponseDto,
    schema: {
      example: {
        statusCode: 400,
        message: 'Dados de entrada inválidos',
        details: [
          'UUID deve ser válido',
          'Senha deve ter pelo menos 8 caracteres'
        ],
        timestamp: '2024-01-15T10:30:00Z',
        path: '/auth/admin/change-password'
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
    description: 'Usuário sem permissão de administrador',
    schema: {
      example: {
        statusCode: 403,
        message: 'Access denied. Only ADMIN can change user passwords.',
        timestamp: '2024-01-15T10:30:00Z',
        path: '/auth/admin/change-password'
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Usuário não encontrado',
    type: NotFoundErrorResponseDto,
    schema: {
      example: {
        statusCode: 404,
        message: 'Usuário não encontrado',
        timestamp: '2024-01-15T10:30:00Z',
        path: '/auth/admin/change-password'
      }
    }
  })
  async adminChangePassword(@Body() changePasswordDto: ChangePasswordDto, @Request() req) {
    return this.authService.adminChangePassword(changePasswordDto, req.user);
  }
}