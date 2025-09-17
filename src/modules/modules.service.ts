import { Injectable } from "@nestjs/common";
import { CreateModuleDto } from "./dto/create-module.dto";
import { UpdateModuleDto } from "./dto/update-module.dto";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class ModulesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll({ externalDisciplineId }: { externalDisciplineId?: string }) {
    const modules = await this.prisma.module.findMany({
      ...(externalDisciplineId && {
        where: {
          disciplineExternalId: externalDisciplineId,
        },
      }),
      include: {
        discipline: true,
      },
    });

    return modules;
  }
}
