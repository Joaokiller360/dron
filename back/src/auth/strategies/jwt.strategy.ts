import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service';

interface JwtPayload {
  sub: string;
  email: string;
  /** Issued at, in seconds */
  iat?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly usersService: UsersService,
    config: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      algorithms: ['HS256'],
      // Same source as the signing side (auth.module); required at boot by env.validation
      secretOrKey: config.getOrThrow<string>('jwt.secret'),
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException();
    }
    // Issued before the last password change: that session was signed out
    // (1 s of slack, since iat is rounded down to the second)
    if (
      user.passwordChangedAt &&
      (payload.iat ?? 0) * 1000 < user.passwordChangedAt.getTime() - 1000
    ) {
      throw new UnauthorizedException();
    }
    return { id: user.id, email: user.email, name: user.name };
  }
}
