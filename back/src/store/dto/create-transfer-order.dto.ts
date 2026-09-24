import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { PLACE_PATTERN } from '../../common/text-patterns';
import { CreateOrderDto } from './create-order.dto';

/** Checkout paid by bank transfer: the buyer reports where from and the transfer code */
export class CreateTransferOrderDto extends CreateOrderDto {
  @ApiProperty({ example: 'Banco Guayaquil', description: 'Bank the buyer transferred from' })
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  @Matches(PLACE_PATTERN, { message: 'El banco tiene caracteres no permitidos' })
  transferBank: string;

  @ApiProperty({ example: '123456789', description: 'Transfer code / receipt number' })
  @IsString()
  @MinLength(4)
  @MaxLength(40)
  @Matches(/^[A-Za-z0-9-]+$/, {
    message: 'El código de la transferencia solo admite letras, números y guiones',
  })
  transferReference: string;
}
