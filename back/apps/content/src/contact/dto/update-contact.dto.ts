import { ApiProperty } from '@nestjs/swagger';
import { ContactStatus } from '@jbskylens/prisma-content';
import { IsEnum } from 'class-validator';

export class UpdateContactStatusDto {
  @ApiProperty({ enum: ContactStatus, example: ContactStatus.READ })
  @IsEnum(ContactStatus)
  status: ContactStatus;
}
