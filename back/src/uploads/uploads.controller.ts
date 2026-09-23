import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CompleteUploadDto, PresignUploadDto } from './dto/presign-upload.dto';
import { UploadsService } from './uploads.service';

@ApiTags('uploads')
@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploads: UploadsService) {}

  @Post('presign')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Admin: signed S3 POST to upload an image or video into the private incoming/ area',
  })
  presign(@Body() dto: PresignUploadDto) {
    return this.uploads.presign(dto);
  }

  @Post('complete')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Admin: verify an uploaded file (real format, re-encoded images) and publish it',
  })
  complete(@Body() dto: CompleteUploadDto) {
    return this.uploads.complete(dto);
  }
}
