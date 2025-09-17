import { ApiProperty } from "@nestjs/swagger";
import { LocalUsedStatus } from "@prisma/client";
import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateTrackingDto {
  @ApiProperty({
    description: "Nome da api que será utilizada",
    example: "api-de-teste",
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: "URL do webhook que será utilizado",
    example: "https://webhook.site/123e4567-e89b-12d3-a456-426614174000",
  })
  @IsString()
  @IsOptional()
  webhookUrl?: string;

  @ApiProperty({
    description: "Status do rastreamento",
    example: LocalUsedStatus.SUCCESS,
    enum: LocalUsedStatus,
  })
  @IsEnum(LocalUsedStatus)
  @IsNotEmpty()
  status: LocalUsedStatus;

  @ApiProperty({
    description: "Metadados do rastreamento",
    example: {
      key: "value",
    },
  })
  @IsOptional()
  metadata?: Record<string, any>;
}
