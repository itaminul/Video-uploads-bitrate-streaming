import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { Video } from 'src/entity/video.entity';
import { Encoding } from 'src/entity/encoding.entity';
import ffmpeg from 'fluent-ffmpeg'; 
@Injectable()
export class VideoService {
  constructor(
    @InjectRepository(Video)
    private videoRepository: Repository<Video>,
    @InjectRepository(Encoding)
    private encodingRepository: Repository<Encoding>
  ) {}

  async createVideo(
    file: Express.Multer.File,
    title: string,
    description: string
  ): Promise<Video> {
    const folderPath = path.join("uploads", Date.now().toString());
    fs.mkdirSync(folderPath, { recursive: true });

    const video = new Video();
    video.title = title;
    video.description = description;
    video.originalFilename = file.originalname;
    video.folderPath = folderPath;

    const savedVideo = await this.videoRepository.save(video);

    const originalPath = path.join(folderPath, "original.mp4");
    fs.writeFileSync(originalPath, file.buffer);

    this.encodeVideo(savedVideo, originalPath);

    return savedVideo;
  }

  private async encodeVideo(video: Video, inputPath: string) {
    const resolutions = ["1080p", "720p", "480p", "360p"];

    for (const resolution of resolutions) {
      const outputPath = path.join(video.folderPath, `${resolution}.mp4`);
      await this.encodeToResolution(inputPath, outputPath, resolution);

      const encoding = new Encoding();
      encoding.resolution = resolution;
      encoding.bitrate = this.getBitrateForResolution(resolution);
      encoding.filePath = outputPath;
      encoding.video = video;

      await this.encodingRepository.save(encoding);
    }
  }

  private encodeToResolution(
    inputPath: string,
    outputPath: string,
    resolution: string
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .outputOptions("-vf", `scale=-2:${this.getHeightFromResolution(resolution)}`)
        .outputOptions("-c:v", "libx264")
        .outputOptions("-crf", "23")
        .outputOptions("-c:a", "aac")
        .outputOptions("-b:a", "128k")
        .output(outputPath)
        .on("end", (stdout: string, stderr: string) => {
          console.log("FFmpeg process completed");
          resolve();  // Resolve without parameters since it's a void promise
        })
        .on("error", (err: Error) => {
          console.error("Error during video encoding:", err);
          reject(err);  // Reject the promise with the error
        })
        .run();
    });
  }

  private getHeightFromResolution(resolution: string): number {
    const heights = {
      "1080p": 1080,
      "720p": 720,
      "480p": 480,
      "360p": 360,
    };
    return heights[resolution] || 360;
  }

  private getBitrateForResolution(resolution: string): string {
    const bitrates = {
      "1080p": "5000k",
      "720p": "2500k",
      "480p": "1000k",
      "360p": "500k",
    };
    return bitrates[resolution] || "500k";
  }

  async getVideoManifest(videoId: string): Promise<string> {
    const video = await this.videoRepository.findOne({
      where: { id: videoId },
      relations: ["encodings"],
    });

    if (!video) {
      throw new Error("Video not found");
    }

    let manifest = "#EXTM3U\n";
    manifest += "#EXT-X-VERSION:3\n";

    for (const encoding of video.encodings) {
      manifest += `#EXT-X-STREAM-INF:BANDWIDTH=${this.getBandwidthFromBitrate(encoding.bitrate)},RESOLUTION=${this.getResolutionString(encoding.resolution)}\n`;
      manifest += `${encoding.resolution}.m3u8\n`;
    }

    return manifest;
  }

  private getBandwidthFromBitrate(bitrate: string): number {
    return parseInt(bitrate.replace("k", "000"));
  }

  private getResolutionString(resolution: string): string {
    const heights = {
      "1080p": "1920x1080",
      "720p": "1280x720",
      "480p": "854x480",
      "360p": "640x360",
    };
    return heights[resolution] || "640x360";
  }
}
