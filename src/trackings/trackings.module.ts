import { Module } from "@nestjs/common";
import { TrackingsService } from "./trackings.service";
import { TrackingsController } from "./trackings.controller";
import { PrismaModule } from "src/prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [TrackingsController],
  providers: [TrackingsService],
})
export class TrackingsModule {}
