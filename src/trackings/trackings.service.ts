import { BadRequestException, HttpStatus, Injectable } from "@nestjs/common";
import { CreateTrackingDto } from "./dto/create-tracking.dto";
import { PrismaService } from "src/prisma/prisma.service";
import { AuthUser } from "src/questions/questions.service";
import { QueryTrackingsDto } from "./dto/query-trackings.dto";

@Injectable()
export class TrackingsService {
  constructor(private readonly prisma: PrismaService) {}
  async create(createTrackingDto: CreateTrackingDto) {
    try {
      const { name, webhookUrl, status, metadata } = createTrackingDto;

      const tracking = await this.prisma.localUsed.create({
        data: {
          name,
          status,
          webhookUrl,
          metadata,
        },
      });
      return HttpStatus.CREATED;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async findAll(query: QueryTrackingsDto) {
    try {
      const { page, pageSize, search } = query;
      const skip = (page - 1) * pageSize;

      const trackings = await this.prisma.localUsed.findMany({
        where: {
          ...(search && {
            name: { contains: search },
          }),
        },
        skip,
        take: pageSize,
        orderBy: { createdAt: "desc" },
      });

      const serializedTrackings = trackings.map((tracking) => ({
        ...tracking,
        createdAt: tracking.createdAt.toISOString(),
        updatedAt: tracking.updatedAt.toISOString(),
        webhookExecutedAt: tracking.webhookExecutedAt?.toISOString() || null,
      }));

      return {
        data: serializedTrackings,
        page,
        pageSize,
        total: trackings.length,
      };
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async findOne(uuid: string) {
    try {
      const tracking = await this.prisma.localUsed.findUnique({
        where: { uuid },
      });
      return tracking;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async findOneWithQuestions(uuid: string) {
    try {
      const tracking = await this.prisma.localUsed.findUnique({
        where: { uuid },
        include: {
          usedQuestion: {
            include: {
              question: {
                include: {
                  moduleExternal: true,
                  subjectExternal: true,
                  discipline: true,
                },
              },
            },
          },
        },
      });

      if (!tracking) {
        throw new BadRequestException("Tracking not found");
      }

      return {
        ...tracking,
        createdAt: tracking.createdAt.toISOString(),
        updatedAt: tracking.updatedAt.toISOString(),
        webhookExecutedAt: tracking.webhookExecutedAt?.toISOString() || null,
        usedQuestion: tracking.usedQuestion.map((uq) => ({
          ...uq,
          createdAt: uq.createdAt.toISOString(),
          updatedAt: uq.updatedAt.toISOString(),
          question: uq.question
            ? {
                ...uq.question,
                createdAt: uq.question.createdAt.toISOString(),
                updatedAt: uq.question.updatedAt.toISOString(),
              }
            : null,
        })),
      };
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}
