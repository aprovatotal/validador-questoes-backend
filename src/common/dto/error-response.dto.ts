import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponseDto {
  @ApiProperty({
    description: 'Código de status HTTP',
    example: 400,
  })
  statusCode: number;

  @ApiProperty({
    description: 'Mensagem de erro',
    example: 'Dados inválidos fornecidos',
  })
  message: string;

  @ApiProperty({
    description: 'Timestamp do erro',
    example: '2024-01-15T10:30:00Z',
  })
  timestamp: string;

  @ApiProperty({
    description: 'Caminho da requisição',
    example: '/api/auth/login',
  })
  path: string;
}

export class ValidationErrorResponseDto extends ErrorResponseDto {
  @ApiProperty({
    description: 'Detalhes dos erros de validação',
    example: ['email deve ser um email válido', 'password deve ter pelo menos 8 caracteres'],
    type: [String],
  })
  details: string[];
}

export class UnauthorizedErrorResponseDto extends ErrorResponseDto {
  @ApiProperty({
    description: 'Mensagem de erro de autorização',
    example: 'Token inválido ou expirado',
  })
  message: string;
}

export class NotFoundErrorResponseDto extends ErrorResponseDto {
  @ApiProperty({
    description: 'Mensagem de recurso não encontrado',
    example: 'Usuário não encontrado',
  })
  message: string;
}

export class ConflictErrorResponseDto extends ErrorResponseDto {
  @ApiProperty({
    description: 'Mensagem de conflito',
    example: 'Email já está em uso',
  })
  message: string;
}