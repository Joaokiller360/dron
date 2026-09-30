import { Body, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { IsIn, IsISO8601, IsOptional, IsString, Matches, MaxLength } from 'class-validator';
import { InternalController } from '@app/common/internal/internal.guard';
import type { ChangeEvent } from '@app/common/events/change-publisher';
import { EventsService } from './events.service';

const ACTIONS: ChangeEvent['action'][] = ['create', 'update', 'delete', 'reorder'];

export class ChangeEventDto {
  @IsString()
  @MaxLength(60)
  @Matches(/^[a-z0-9-]+$/)
  resource: string;

  @IsIn(ACTIONS)
  action: ChangeEvent['action'];

  @IsOptional()
  @IsISO8601()
  at?: string;
}

/** Content and store announce their writes here; browsers get them over SSE */
@InternalController('events')
export class EventsInternalController {
  constructor(private readonly events: EventsService) {}

  @Post()
  @HttpCode(HttpStatus.NO_CONTENT)
  publish(@Body() dto: ChangeEventDto) {
    this.events.emit(dto.resource, dto.action, dto.at);
  }
}
