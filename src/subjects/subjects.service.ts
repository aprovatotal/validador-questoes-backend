import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class SubjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll({ externalModuleId }: { externalModuleId?: string }) {
    const subjects = await this.prisma.subject.findMany({
      ...(externalModuleId && {
        where: {
          moduleExternalId: externalModuleId,
        },
      }),
    });
    return subjects;
  }
}
