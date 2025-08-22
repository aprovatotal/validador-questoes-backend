import { ApiProperty } from '@nestjs/swagger';

export class AuthResponseDto {
  @ApiProperty({
    description: 'Token de acesso JWT',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
  })
  accessToken: string;

  @ApiProperty({
    description: 'Token de atualização',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
  })
  refreshToken: string;

  @ApiProperty({
    description: 'Tipo do token',
    example: 'Bearer',
  })
  tokenType: string;

  @ApiProperty({
    description: 'Tempo de expiração em segundos',
    example: 3600,
  })
  expiresIn: number;
}

export class UserProfileDto {
  @ApiProperty({
    description: 'UUID único do usuário',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  uuid: string;

  @ApiProperty({
    description: 'Nome do usuário',
    example: 'João Silva',
  })
  name: string;

  @ApiProperty({
    description: 'Email do usuário',
    example: 'joao.silva@email.com',
  })
  email: string;

  @ApiProperty({
    description: 'Role do usuário no sistema',
    example: 'USER',
    enum: ['USER', 'EDITOR', 'REVIEWER', 'ADMIN'],
  })
  role: string;

  @ApiProperty({
    description: 'Data de criação da conta',
    example: '2024-01-15T10:30:00Z',
  })
  createdAt: string;
}

export class RegisterResponseDto extends AuthResponseDto {
  @ApiProperty({
    description: 'Perfil do usuário criado',
    type: UserProfileDto,
  })
  user: UserProfileDto;
}

export class LoginResponseDto extends AuthResponseDto {
  @ApiProperty({
    description: 'Perfil do usuário logado',
    type: UserProfileDto,
  })
  user: UserProfileDto;
}