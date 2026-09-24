import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

/** Site-wide switches for the promotions module (stored in site_settings) */
export class PromotionSettingsDto {
  @ApiPropertyOptional({ description: 'Master switch: off hides bar, section and badges' })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @ApiPropertyOptional({ description: 'Top announcement bar on the landing' })
  @IsOptional()
  @IsBoolean()
  bar?: boolean;

  @ApiPropertyOptional({ description: 'Offers section on the landing' })
  @IsOptional()
  @IsBoolean()
  section?: boolean;

  @ApiPropertyOptional({ description: 'Badges on matching service cards' })
  @IsOptional()
  @IsBoolean()
  badges?: boolean;

  @ApiPropertyOptional({ description: 'Promotion discounts apply to store prices' })
  @IsOptional()
  @IsBoolean()
  store?: boolean;
}

export type PromotionSettings = Required<PromotionSettingsDto>;

export const DEFAULT_PROMOTION_SETTINGS: PromotionSettings = {
  enabled: true,
  bar: true,
  section: true,
  badges: true,
  store: true,
};
