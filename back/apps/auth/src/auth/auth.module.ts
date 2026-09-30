import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RefreshTokensService } from './refresh-tokens.service';
import { UsersModule } from '../users/users.module';
import { JWT_ALGORITHM, jwtPrivateKey, jwtPublicKey } from '@app/common/auth/jwt-keys';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const privateKey = config.getOrThrow<string>('jwt.privateKey');
        return {
          privateKey: jwtPrivateKey(privateKey),
          publicKey: jwtPublicKey({ privateKey }),
          signOptions: { algorithm: JWT_ALGORITHM, expiresIn: config.get<number>('jwt.expiresIn') },
          verifyOptions: { algorithms: [JWT_ALGORITHM] },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, RefreshTokensService, JwtStrategy],
})
export class AuthModule {}
