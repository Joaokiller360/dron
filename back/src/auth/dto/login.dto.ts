import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'admin@joaobarres.dev' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'super-secret-password' })
  @IsString()
  @MinLength(8)
  password: string;
}
