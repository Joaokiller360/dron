import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RefreshTokensService } from './refresh-tokens.service';

// Compared against when the email is unknown, so both failures take as long
const DUMMY_HASH = bcrypt.hashSync('timing-equalizer-not-a-password', 12);

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly refreshTokens: RefreshTokensService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    const passwordMatches = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);
    if (!user || !passwordMatches) {
      throw new UnauthorizedException('Correo o contraseña incorrectos');
    }

    return this.session(user);
  }

  /**
   * Checks the current password, stores the new one and signs out every other
   * session (their tokens predate the change). Returns a fresh session for this one.
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.usersService.findById(userId);
    if (!user) throw new UnauthorizedException();
    if (!(await bcrypt.compare(currentPassword, user.passwordHash))) {
      throw new BadRequestException('La contraseña actual no es correcta');
    }
    if (currentPassword === newPassword) {
      throw new BadRequestException('La contraseña nueva debe ser distinta de la actual');
    }
    const handle = user.email.split('@')[0].toLowerCase();
    if (handle.length >= 4 && newPassword.toLowerCase().includes(handle)) {
      throw new BadRequestException('La contraseña nueva no debe contener tu correo');
    }
    const updated = await this.usersService.setPassword(
      user.id,
      await bcrypt.hash(newPassword, 12),
    );
    await this.refreshTokens.revokeAll(user.id);
    return this.session(updated);
  }

  /** Renews the short-lived access token with the (rotated) refresh token */
  async refresh(refreshToken: string) {
    const { userId, token, expiresAt } = await this.refreshTokens.rotate(refreshToken);
    const user = await this.usersService.findById(userId);
    if (!user) throw new UnauthorizedException();
    return { ...(await this.accessSession(user)), refreshToken: { token, expiresAt } };
  }

  logout(refreshToken: string) {
    return this.refreshTokens.revoke(refreshToken);
  }

  /** Access token for the response body + refresh token for the httpOnly cookie */
  private async session(user: { id: string; email: string; name: string }) {
    return {
      ...(await this.accessSession(user)),
      refreshToken: await this.refreshTokens.issue(user.id),
    };
  }

  private async accessSession(user: { id: string; email: string; name: string }) {
    const payload = { sub: user.id, email: user.email };
    return {
      accessToken: await this.jwtService.signAsync(payload),
      user: { id: user.id, email: user.email, name: user.name },
    };
  }
}
