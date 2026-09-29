import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({ example: 'current-password' })
  @IsString()
  @MaxLength(128)
  currentPassword: string;

  @ApiProperty({
    example: 'a-long-new-passphrase-2026',
    description: '12+ chars, letters and digits',
  })
  @IsString()
  @MinLength(12, { message: 'La contraseña nueva debe tener al menos 12 caracteres' })
  @MaxLength(128, { message: 'La contraseña nueva admite hasta 128 caracteres' })
  @Matches(/\p{L}/u, { message: 'La contraseña nueva debe tener al menos una letra' })
  @Matches(/\d/, { message: 'La contraseña nueva debe tener al menos un número' })
  newPassword: string;
}
