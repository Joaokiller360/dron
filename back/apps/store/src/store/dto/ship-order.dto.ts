import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUrl, MaxLength, MinLength, ValidateIf } from 'class-validator';

export class ShipOrderDto {
  @ApiProperty({ example: 'Servientrega' })
  @IsString()
  @MinLength(2)
  @MaxLength(60)
  carrier: string;

  @ApiProperty({ example: '1234567890', description: 'Número de guía' })
  @IsString()
  @MinLength(3)
  @MaxLength(60)
  trackingNumber: string;

  @ApiPropertyOptional({ example: 'https://www.servientrega.com.ec/rastreo' })
  @IsOptional()
  @ValidateIf((o: ShipOrderDto) => !!o.trackingUrl)
  @IsUrl({ protocols: ['https', 'http'], require_protocol: true })
  @MaxLength(500)
  trackingUrl?: string;
}
