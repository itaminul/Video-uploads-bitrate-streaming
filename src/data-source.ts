import { DataSource, DataSourceOptions } from "typeorm";
import { Users } from "./entity/Users";
import { Encoding } from "./entity/encoding.entity";
import { Video } from "./entity/video.entity";

export const AppDataSource: DataSourceOptions = {
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "erpdb",
  password: "123456",
  database: "video_streaming",
  entities: [Users, Encoding, Video],
  // migrations: ['./src/migrations/*.ts'],
  migrations: ["./dist/migrations/*.js"],
  synchronize: false,
  logging: true,
};

const dataSource = new DataSource(AppDataSource);
export default dataSource;

//npx typeorm-ts-node-commonjs migration:generate src/migrations/CreatePhotoTable -d src/data-source.ts
//npx typeorm-ts-node-commonjs migration:run -d src/data-source.ts
//npx typeorm-ts-node-commonjs migration:generate src/migrations/CreateAllTables -d src/data-source.ts --timestamp
//npx typeorm-ts-node-commonjs migration:generate src/migrations/CreateAllTables -d src/data-source.ts
//npx typeorm-ts-node-commonjs migration:generate src/migrations/CreateUsersTables -d src/data-source.ts
