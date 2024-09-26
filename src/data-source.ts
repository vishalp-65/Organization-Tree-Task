import "reflect-metadata";
import { DataSource } from "typeorm";
import "reflect-metadata";
import { config } from "./config/server_config";

const AppDataSource = new DataSource({
    type: "mysql",
    url: config.DB_URI,
    synchronize: true,
    // logging: true,
    entities: ["src/entities/**/*.ts"],
    migrations: ["src/migrations/**/*.ts"],
    subscribers: [],
});

export default AppDataSource;
