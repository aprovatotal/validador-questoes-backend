import { IsEmail, IsString, MinLength, IsArray, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    description: 'Nome completo do usuário',
    example: 'João Silva',
    minLength: 2,
  })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({
    description: 'Email único do usuário',
    example: 'joao.silva@email.com',
    format: 'email',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Senha do usuário',
    example: 'MinhaSenh@123',
    minLength: 8,
    format: 'password',
  })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({
    description: 'IDs das disciplinas que o usuário pode acessar',
    example: [1, 2, 3],
    required: false,
    type: [Number],
  })
  @IsArray()
  @IsOptional()
  disciplineIds?: number[];
}