import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import type { IssuedRefreshToken } from './refresh-tokens.service';

const REFRESH_COOKIE = 'jbs_refresh';
// Only the auth routes ever receive the refresh cookie
const cookiePath = () => `/${(process.env.API_PREFIX ?? 'api').replace(/^\/|\/$/g, '')}/auth`;

function readRefreshCookie(req: Request): string | undefined {
  for (const part of (req.headers.cookie ?? '').split(';')) {
    const [name, ...rest] = part.trim().split('=');
    // base64url token: nothing to URI-decode
    if (name === REFRESH_COOKIE) return rest.join('=');
  }
  return undefined;
}

function setRefreshCookie(res: Response, { token, expiresAt }: IssuedRefreshToken) {
  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    // Dashboard and API share the site (…joaobarres.dev, or localhost in dev)
    sameSite: 'strict',
    path: cookiePath(),
    expires: expiresAt,
  });
}

function clearRefreshCookie(res: Response) {
  res.clearCookie(REFRESH_COOKIE, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: cookiePath(),
  });
}

/** Cookie-authenticated routes only accept calls from the dashboard's origins (CSRF) */
function assertAllowedOrigin(req: Request) {
  const allowed = process.env.CORS_ORIGIN?.split(',').map((o) => o.trim());
  const origin = req.headers.origin;
  if (!allowed || allowed.includes('*') || !origin) return;
  if (!allowed.includes(origin)) throw new ForbiddenException();
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  // Brute-force guard: 5 attempts per IP every 15 minutes
  @Throttle({ default: { limit: 5, ttl: 15 * 60_000 } })
  @ApiOperation({
    summary: 'Admin login: returns a short-lived JWT and sets the refresh-token cookie',
  })
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const { refreshToken, ...session } = await this.authService.login(dto.email, dto.password);
    setRefreshCookie(res, refreshToken);
    return session;
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  @ApiOperation({ summary: 'New access token from the refresh-token cookie (rotates it)' })
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    assertAllowedOrigin(req);
    const token = readRefreshCookie(req);
    if (!token) throw new UnauthorizedException();
    try {
      const { refreshToken, ...session } = await this.authService.refresh(token);
      setRefreshCookie(res, refreshToken);
      return session;
    } catch (err) {
      clearRefreshCookie(res);
      throw err;
    }
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Ends the session of the refresh-token cookie' })
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    assertAllowedOrigin(req);
    const token = readRefreshCookie(req);
    if (token) await this.authService.logout(token);
    clearRefreshCookie(res);
  }

  @Post('password')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  // Guessing the current password through this endpoint is as limited as the login
  @Throttle({ default: { limit: 5, ttl: 15 * 60_000 } })
  @ApiOperation({ summary: 'Change the admin password; other sessions are signed out' })
  async changePassword(
    @CurrentUser() user: { id: string },
    @Body() dto: ChangePasswordDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { refreshToken, ...session } = await this.authService.changePassword(
      user.id,
      dto.currentPassword,
      dto.newPassword,
    );
    setRefreshCookie(res, refreshToken);
    return session;
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Current authenticated admin user' })
  me(@CurrentUser() user: unknown) {
    return user;
  }
}
