import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Encoding } from "./encoding.entity";

@Entity()
export class Video {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  originalFilename: string;

  @Column()
  folderPath: string;

  @OneToMany(() => Encoding, (encoding) => encoding.video)
  encodings: Encoding[];
}
