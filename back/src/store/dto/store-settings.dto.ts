import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsEmail,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

/** A delivery zone the buyer picks at checkout, with its own price */
export class ShippingZoneDto {
  @ApiPropertyOptional({ description: 'Assigned by the API when missing' })
  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9-]{1,40}$/, { message: 'El identificador de la zona no es válido' })
  id?: string;

  @ApiPropertyOptional({ example: 'Esmeraldas (ciudad)' })
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  name: string;

  @ApiPropertyOptional({ example: 300, description: 'Shipping price in cents (0 = free)' })
  @IsInt()
  @Min(0)
  @Max(100000)
  priceCents: number;

  @ApiPropertyOptional({
    example: 5000,
    description: 'Orders from this subtotal ship free; null = never',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10000000)
  freeFromCents?: number | null;

  @ApiPropertyOptional({ example: '24 a 48 horas' })
  @IsOptional()
  @IsString()
  @MaxLength(60)
  deliveryTime?: string;
}

export type ShippingZone = Required<Omit<ShippingZoneDto, 'freeFromCents'>> & {
  freeFromCents: number | null;
};

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

  @ApiPropertyOptional({
    type: [ShippingZoneDto],
    description: 'Delivery zones; empty = orders carry no shipping cost',
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(30)
  @ValidateNested({ each: true })
  @Type(() => ShippingZoneDto)
  shippingZones?: ShippingZoneDto[];

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

export type StoreSettings = Required<Omit<StoreSettingsDto, 'shippingZones'>> & {
  shippingZones: ShippingZone[];
};

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
  shippingZones: [],
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

/** What a zone charges for an order of `subtotalCents` (free above its threshold) */
export const shippingFor = (zone: ShippingZone, subtotalCents: number) =>
  zone.freeFromCents != null && subtotalCents >= zone.freeFromCents ? 0 : zone.priceCents;
