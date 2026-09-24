import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'admin@joaobarres.dev' })
  @IsEmail()
  @MaxLength(120)
  email: string;

  @ApiProperty({ example: 'super-secret-password' })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password: string;
}
