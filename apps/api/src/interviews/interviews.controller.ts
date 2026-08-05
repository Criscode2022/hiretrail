import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/current-user.decorator';
import type { AuthUser } from '../common/auth-user';
import { InterviewsService } from './interviews.service';
import { InterviewOutcome, InterviewType } from './interview.entity';

class CreateInterviewDto {
  @IsUUID()
  applicationId!: string;

  @IsOptional()
  @IsEnum(InterviewType)
  type?: InterviewType;

  @IsDateString()
  scheduledAt!: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  location?: string;

  @IsOptional()
  @IsEnum(InterviewOutcome)
  outcome?: InterviewOutcome;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  notes?: string;
}

class UpdateInterviewDto {
  @IsOptional()
  @IsEnum(InterviewType)
  type?: InterviewType;

  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  location?: string;

  @IsOptional()
  @IsEnum(InterviewOutcome)
  outcome?: InterviewOutcome;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  notes?: string;
}

@Controller('interviews')
@UseGuards(JwtAuthGuard)
export class InterviewsController {
  constructor(private readonly interviews: InterviewsService) {}

  @Get()
  list(
    @CurrentUser() user: AuthUser,
    @Query('applicationId') applicationId?: string,
    @Query('upcoming') upcoming?: string,
  ) {
    return this.interviews.list(
      user.id,
      applicationId,
      upcoming === 'true' || upcoming === '1',
    );
  }

  @Get(':id')
  get(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.interviews.get(user.id, id);
  }

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateInterviewDto) {
    return this.interviews.create(user.id, {
      ...dto,
      scheduledAt: new Date(dto.scheduledAt),
    });
  }

  @Patch(':id')
  update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateInterviewDto,
  ) {
    const payload: Record<string, unknown> = { ...dto };
    if (dto.scheduledAt) payload.scheduledAt = new Date(dto.scheduledAt);
    return this.interviews.update(user.id, id, payload as never);
  }

  @Delete(':id')
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.interviews.remove(user.id, id);
  }
}
