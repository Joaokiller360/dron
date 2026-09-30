import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class ReplyContactDto {
  @ApiProperty({ example: 'Tu solicitud a JB.SKYLENS' })
  @IsString()
  @MinLength(1)
  @MaxLength(150)
  subject: string;

  @ApiProperty({ example: 'Hola María, gracias por escribirnos…' })
  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  body: string;
}
