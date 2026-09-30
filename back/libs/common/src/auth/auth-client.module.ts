import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { RemoteJwtStrategy } from './remote-jwt.strategy';

/** Lets JwtAuthGuard work in services that don't own the admin users */
@Module({
  imports: [PassportModule],
  providers: [RemoteJwtStrategy],
})
export class AuthClientModule {}
