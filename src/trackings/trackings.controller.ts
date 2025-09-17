import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Query,
  Request,
} from "@nestjs/common";
import { TrackingsService } from "./trackings.service";
import { CreateTrackingDto } from "./dto/create-tracking.dto";
import { ApiBearerAuth, ApiQuery, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { QueryTrackingsDto } from "./dto/query-trackings.dto";

@ApiTags("Rastreamento")
@Controller("trackings")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth("JWT-auth")
export class TrackingsController {
  constructor(private readonly trackingsService: TrackingsService) {}

  @Post()
  create(@Body() createTrackingDto: CreateTrackingDto) {
    return this.trackingsService.create(createTrackingDto);
  }

  @Get()
  @ApiQuery({
    name: "discipline",
    required: false,
    description: "Slug da disciplina",
  })
  @ApiQuery({ name: "page", required: false, description: "Número da página" })
  @ApiQuery({
    name: "pageSize",
    required: false,
    description: "Itens por página",
  })
  @ApiQuery({ name: "search", required: false, description: "Termo de busca" })
  findAll(@Query() query: QueryTrackingsDto) {
    return this.trackingsService.findAll(query);
  }

  @Get(":uuid")
  findOne(@Param("uuid") uuid: string) {
    return this.trackingsService.findOne(uuid);
  }
  
  @Get(":uuid/with-questions")
  findOneWithQuestions(@Param("uuid") uuid: string) {
    return this.trackingsService.findOneWithQuestions(uuid);
  }
}
