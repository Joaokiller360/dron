import { ApiProperty } from '@nestjs/swagger';
import { ContactStatus } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class UpdateContactStatusDto {
  @ApiProperty({ enum: ContactStatus, example: ContactStatus.READ })
  @IsEnum(ContactStatus)
  status: ContactStatus;
}
