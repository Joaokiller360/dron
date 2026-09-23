import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { PHONE_PATTERN } from '../../common/text-patterns';

/** Public contact channels shown across the site (stored in site_settings) */
export class ContactInfoDto {
  @ApiPropertyOptional({ example: '+593 98 666 0737', description: 'Mobile / WhatsApp number' })
  @IsOptional()
  @IsString()
  @MinLength(7)
  @MaxLength(20)
  @Matches(PHONE_PATTERN, { message: 'phone contains invalid characters' })
  phone?: string;

  @ApiPropertyOptional({ example: 'contacto@joaobarres.dev' })
  @IsOptional()
  @IsEmail()
  @MaxLength(120)
  email?: string;
}

export type ContactInfo = Required<ContactInfoDto>;

export const DEFAULT_CONTACT_INFO: ContactInfo = {
  phone: '+593 98 666 0737',
  email: 'contacto@joaobarres.dev',
};
