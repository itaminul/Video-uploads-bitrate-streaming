import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Video } from "./video.entity";

@Entity()
export class Encoding {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  resolution: string;

  @Column()
  bitrate: string;

  @Column()
  filePath: string;

  @ManyToOne(() => Video, (video) => video.encodings)
  video: Video;
}
