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
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/current-user.decorator';
import type { AuthUser } from '../common/auth-user';
import { ApplicationsService } from './applications.service';
import {
  ApplicationPriority,
  ApplicationStatus,
} from './application.entity';

class CreateApplicationDto {
  @IsUUID()
  companyId!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title!: string;

  @IsOptional()
  @IsEnum(ApplicationStatus)
  status?: ApplicationStatus;

  @IsOptional()
  @IsEnum(ApplicationPriority)
  priority?: ApplicationPriority;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  salaryMin?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  salaryMax?: number;

  @IsOptional()
  @IsString()
  @MaxLength(8)
  currency?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  location?: string;

  @IsOptional()
  @IsBoolean()
  remote?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  jobUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  source?: string;

  @IsOptional()
  @IsDateString()
  appliedAt?: string;

  @IsOptional()
  @IsDateString()
  followUpAt?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10000)
  description?: string;
}

class UpdateApplicationDto {
  @IsOptional()
  @IsUUID()
  companyId?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsEnum(ApplicationStatus)
  status?: ApplicationStatus;

  @IsOptional()
  @IsEnum(ApplicationPriority)
  priority?: ApplicationPriority;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  salaryMin?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  salaryMax?: number | null;

  @IsOptional()
  @IsString()
  @MaxLength(8)
  currency?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  location?: string;

  @IsOptional()
  @IsBoolean()
  remote?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  jobUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  source?: string;

  @IsOptional()
  @IsDateString()
  appliedAt?: string | null;

  @IsOptional()
  @IsDateString()
  followUpAt?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(10000)
  description?: string;
}

class StatusDto {
  @IsEnum(ApplicationStatus)
  status!: ApplicationStatus;
}

@Controller('applications')
@UseGuards(JwtAuthGuard)
export class ApplicationsController {
  constructor(private readonly applications: ApplicationsService) {}

  @Get()
  list(
    @CurrentUser() user: AuthUser,
    @Query('status') status?: ApplicationStatus,
    @Query('priority') priority?: ApplicationPriority,
    @Query('companyId') companyId?: string,
    @Query('q') q?: string,
  ) {
    return this.applications.list(user.id, { status, priority, companyId, q });
  }

  @Get(':id')
  get(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.applications.get(user.id, id);
  }

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateApplicationDto) {
    return this.applications.create(user.id, {
      ...dto,
      appliedAt: dto.appliedAt ? new Date(dto.appliedAt) : undefined,
      followUpAt: dto.followUpAt ? new Date(dto.followUpAt) : undefined,
    });
  }

  @Patch(':id')
  update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateApplicationDto,
  ) {
    const payload: Record<string, unknown> = { ...dto };
    if (dto.appliedAt !== undefined) {
      payload.appliedAt = dto.appliedAt ? new Date(dto.appliedAt) : null;
    }
    if (dto.followUpAt !== undefined) {
      payload.followUpAt = dto.followUpAt ? new Date(dto.followUpAt) : null;
    }
    return this.applications.update(user.id, id, payload as never);
  }

  @Patch(':id/status')
  updateStatus(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: StatusDto,
  ) {
    return this.applications.updateStatus(user.id, id, dto.status);
  }

  @Delete(':id')
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.applications.remove(user.id, id);
  }
}
