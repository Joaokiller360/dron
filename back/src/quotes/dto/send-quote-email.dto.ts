import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class SendQuoteEmailDto {
  @ApiProperty({
    example: 'https://dron.joaobarres.dev',
    description: 'Site the dashboard runs on; the email links to <origin>/proforma/<token>',
  })
  @IsUrl({ require_tld: false, require_protocol: true, protocols: ['http', 'https'] })
  @MaxLength(200)
  origin: string;

  @ApiPropertyOptional({ description: "Recipient; defaults to the quote's client email" })
  @IsOptional()
  @IsEmail()
  @MaxLength(120)
  to?: string;

  @ApiPropertyOptional({ description: 'Personal note shown above the quote' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  message?: string;
}
