import { Module } from '@nestjs/common';
import { VideoService } from './video.service';
import { VideoController } from './video.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Video } from 'src/entity/video.entity';
import { Encoding } from 'src/entity/encoding.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Video, Encoding])],
  providers: [VideoService],
  controllers: [VideoController]
})
export class VideoModule {}
