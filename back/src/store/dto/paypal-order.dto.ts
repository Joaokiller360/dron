import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches } from 'class-validator';

/** PayPal order id the buyer approved (or abandoned) in the PayPal window */
export class PaypalOrderDto {
  @ApiProperty({ example: '5O190127TN364715T' })
  @IsString()
  @Matches(/^[A-Z0-9]{10,40}$/, { message: 'El pedido de PayPal no es válido' })
  paypalOrderId: string;
}
