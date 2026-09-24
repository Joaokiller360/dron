import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  ValidateIf,
} from 'class-validator';

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

  @ApiPropertyOptional({ description: 'Show a products section on the landing page' })
  @IsOptional()
  @IsBoolean()
  homeSection?: boolean;

  // Store page header (also used by the landing section); empty = the site's default text
  @ApiPropertyOptional({ example: 'Tienda' })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  heroEyebrowEs?: string;

  @ApiPropertyOptional({ example: 'Store' })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  heroEyebrowEn?: string;

  @ApiPropertyOptional({ example: 'Productos JB.SKYLENS' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  heroTitleEs?: string;

  @ApiPropertyOptional({ example: 'JB.SKYLENS products' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  heroTitleEn?: string;

  @ApiPropertyOptional({ example: 'Elige tus productos y haz el pedido.' })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  heroIntroEs?: string;

  @ApiPropertyOptional({ example: 'Pick your products and place an order.' })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  heroIntroEn?: string;

  @ApiPropertyOptional({ description: 'Offer bank transfer as a payment method' })
  @IsOptional()
  @IsBoolean()
  transferEnabled?: boolean;

  @ApiPropertyOptional({ example: 'Banco Pichincha' })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  bankName?: string;

  @ApiPropertyOptional({ enum: ['AHORROS', 'CORRIENTE'] })
  @IsOptional()
  @IsIn(['AHORROS', 'CORRIENTE'])
  accountType?: 'AHORROS' | 'CORRIENTE';

  @ApiPropertyOptional({ example: '2201234567' })
  @IsOptional()
  @IsString()
  @Matches(/^[0-9-]{0,30}$/, { message: 'El número de cuenta solo lleva dígitos' })
  accountNumber?: string;

  @ApiPropertyOptional({ example: 'Joao Barres' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  accountHolder?: string;

  @ApiPropertyOptional({ example: '0801234567', description: 'Cédula (10 digits) or RUC (13)' })
  @IsOptional()
  @IsString()
  @Matches(/^(\d{10}|\d{13})?$/, {
    message: 'La cédula debe tener 10 dígitos o el RUC 13',
  })
  holderId?: string;

  @ApiPropertyOptional({
    example: 'pagos@joaobarres.dev',
    description: 'Where buyers can send the receipt',
  })
  @IsOptional()
  @ValidateIf((o: StoreSettingsDto) => !!o.transferEmail)
  @IsEmail()
  @MaxLength(120)
  transferEmail?: string;
}

export type StoreSettings = Required<StoreSettingsDto>;

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  enabled: false,
  sales: true,
  showPrices: true,
  pausedNotice: '',
  homeSection: true,
  heroEyebrowEs: '',
  heroEyebrowEn: '',
  heroTitleEs: '',
  heroTitleEn: '',
  heroIntroEs: '',
  heroIntroEn: '',
  transferEnabled: false,
  bankName: '',
  accountType: 'AHORROS',
  accountNumber: '',
  accountHolder: '',
  holderId: '',
  transferEmail: '',
};

/** Transfer is only offered once the account details are complete */
export const transferReady = (s: StoreSettings) =>
  s.transferEnabled && !!(s.bankName && s.accountNumber && s.accountHolder && s.holderId);
