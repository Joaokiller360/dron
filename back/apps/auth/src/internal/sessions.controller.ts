import { Get, NotFoundException, Param } from '@nestjs/common';
import { InternalController } from '@app/common/internal/internal.guard';
import type { SessionUser } from '@app/common/auth/remote-jwt.strategy';
import { UsersService } from '../users/users.service';

/** Other services confirm an admin's JWT here (see RemoteJwtStrategy) */
@InternalController('sessions')
export class SessionsController {
  constructor(private readonly users: UsersService) {}

  @Get(':userId')
  async find(@Param('userId') userId: string): Promise<SessionUser> {
    const user = await this.users.findById(userId);
    if (!user) throw new NotFoundException();
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      passwordChangedAt: user.passwordChangedAt?.toISOString() ?? null,
    };
  }
}
