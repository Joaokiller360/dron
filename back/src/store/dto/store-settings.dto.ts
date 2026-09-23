import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

/** Site-wide switches for the store (stored in site_settings under "store") */
export class StoreSettingsDto {
  @ApiPropertyOptional({ description: 'Master switch: off hides the store page and its menu link' })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @ApiPropertyOptional({
    description: 'Accept orders: off keeps the catalog visible but disables buying',
  })
  @IsOptional()
  @IsBoolean()
  sales?: boolean;

  @ApiPropertyOptional({ description: 'Show prices on the catalog' })
  @IsOptional()
  @IsBoolean()
  showPrices?: boolean;

  @ApiPropertyOptional({
    example: 'Volvemos a vender el lunes.',
    description: 'Notice shown on the store while sales are paused',
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  pausedNotice?: string;
}

export type StoreSettings = Required<StoreSettingsDto>;

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  enabled: false,
  sales: true,
  showPrices: true,
  pausedNotice: '',
};
