import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { ModulesService } from "./modules.service";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { ApiBearerAuth } from "@nestjs/swagger";

@UseGuards(JwtAuthGuard)
@ApiBearerAuth("JWT-auth")
@Controller("modules")
export class ModulesController {
  constructor(private readonly modulesService: ModulesService) {}

  @Get()
  findAll(@Query("externalDisciplineId") externalDisciplineId?: string) {
    return this.modulesService.findAll({ externalDisciplineId });
  }
}
