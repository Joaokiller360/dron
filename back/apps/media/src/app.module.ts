import { Module } from '@nestjs/common';
import { CoreModule } from '@app/common/core.module';
import { AuthClientModule } from '@app/common/auth/auth-client.module';
import { ProcessHealthModule } from '@app/common/health/health.module';
import { UploadsModule } from './uploads/uploads.module';

/** Media service: dashboard uploads to S3, scanned by ClamAV before publishing */
@Module({
  imports: [
    CoreModule.forRoot({ service: 'media', requiredEnv: ['JWT_PUBLIC_KEY', 'INTERNAL_TOKEN'] }),
    AuthClientModule,
    ProcessHealthModule,
    UploadsModule,
  ],
})
export class AppModule {}
