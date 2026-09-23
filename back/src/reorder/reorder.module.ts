import { Module } from '@nestjs/common';
import { ReorderController } from './reorder.controller';

@Module({ controllers: [ReorderController] })
export class ReorderModule {}
