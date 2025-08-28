import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength, IsUUID } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({
    description: 'UUID do usuário que terá a senha alterada',
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: true
  })
  @IsUUID(4, { message: 'UUID deve ser válido' })
  @IsNotEmpty({ message: 'UUID do usuário não pode estar vazio' })
  userUuid: string;

  @ApiProperty({
    description: 'Nova senha do usuário',
    example: 'NovaSenha@123',
    minLength: 8,
    required: true
  })
  @IsString({ message: 'Senha deve ser uma string' })
  @MinLength(8, { message: 'Senha deve ter pelo menos 8 caracteres' })
  @IsNotEmpty({ message: 'Nova senha não pode estar vazia' })
  newPassword: string;
}