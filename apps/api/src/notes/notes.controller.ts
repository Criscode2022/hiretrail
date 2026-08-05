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
import { IsString, IsUUID, MaxLength, MinLength } from 'class-validator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/current-user.decorator';
import type { AuthUser } from '../common/auth-user';
import { NotesService } from './notes.service';

class CreateNoteDto {
  @IsUUID()
  applicationId!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(10000)
  body!: string;
}

class UpdateNoteDto {
  @IsString()
  @MinLength(1)
  @MaxLength(10000)
  body!: string;
}

@Controller('notes')
@UseGuards(JwtAuthGuard)
export class NotesController {
  constructor(private readonly notes: NotesService) {}

  @Get()
  list(
    @CurrentUser() user: AuthUser,
    @Query('applicationId') applicationId: string,
  ) {
    return this.notes.list(user.id, applicationId);
  }

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateNoteDto) {
    return this.notes.create(user.id, dto.applicationId, dto.body);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateNoteDto,
  ) {
    return this.notes.update(user.id, id, dto.body);
  }

  @Delete(':id')
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.notes.remove(user.id, id);
  }
}
