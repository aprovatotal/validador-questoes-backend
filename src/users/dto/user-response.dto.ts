import { ApiProperty } from '@nestjs/swagger';
import { user_role } from '@prisma/client';

export class UserDisciplineDto {
  @ApiProperty({
    description: 'ID da disciplina',
    example: 1
  })
  id: number;

  @ApiProperty({
    description: 'Slug da disciplina',
    example: 'mathematics'
  })
  slug: string;

  @ApiProperty({
    description: 'Nome da disciplina',
    example: 'Matemática'
  })
  name: string;
}

export class UserResponseDto {
  @ApiProperty({
    description: 'UUID único do usuário',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  uuid: string;

  @ApiProperty({
    description: 'Nome do usuário',
    example: 'João Silva'
  })
  name: string;

  @ApiProperty({
    description: 'Email do usuário',
    example: 'joao@email.com'
  })
  email: string;

  @ApiProperty({
    description: 'Perfil do usuário',
    enum: user_role,
    example: 'USER'
  })
  role: user_role;

  @ApiProperty({
    description: 'Status ativo/inativo do usuário',
    example: true
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Data de verificação do email',
    example: '2024-01-15T10:30:00Z',
    nullable: true
  })
  emailVerifiedAt: Date | null;

  @ApiProperty({
    description: 'Data do último login',
    example: '2024-01-20T14:30:00Z',
    nullable: true
  })
  lastLoginAt: Date | null;

  @ApiProperty({
    description: 'Data de criação da conta',
    example: '2024-01-10T09:00:00Z'
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Data da última atualização',
    example: '2024-01-20T14:30:00Z'
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'Lista de disciplinas que o usuário tem acesso',
    type: [UserDisciplineDto]
  })
  disciplines: UserDisciplineDto[];
}

export class PaginatedUsersResponseDto {
  @ApiProperty({
    description: 'Lista de usuários',
    type: [UserResponseDto]
  })
  data: UserResponseDto[];

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

export class UserStatusResponseDto {
  @ApiProperty({
    description: 'Mensagem de confirmação',
    example: 'Usuário inativado com sucesso'
  })
  message: string;

  @ApiProperty({
    description: 'UUID do usuário afetado',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  userUuid: string;

  @ApiProperty({
    description: 'Novo status do usuário',
    example: false
  })
  isActive: boolean;
}