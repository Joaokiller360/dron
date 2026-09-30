import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsUrl } from 'class-validator';

export const LINK_PLATFORMS = ['instagram', 'whatsapp', 'website', 'facebook', 'tiktok'] as const;
export type LinkPlatform = (typeof LINK_PLATFORMS)[number];

export class LinkDto {
  @ApiProperty({ enum: LINK_PLATFORMS, example: 'instagram' })
  @IsIn(LINK_PLATFORMS)
  platform: LinkPlatform;

  @ApiProperty({ example: 'https://instagram.com/joao_barres' })
  @IsUrl()
  url: string;
}
