import { Controller, Get, Module } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('health')
@Controller('health')
export class ProcessHealthController {
  @Get()
  @ApiOperation({ summary: 'Liveness check for services without a database' })
  check() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}

/** /health for services without a database (media, events) */
@Module({ controllers: [ProcessHealthController] })
export class ProcessHealthModule {}
