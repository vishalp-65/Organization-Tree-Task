import "reflect-metadata";
import { DataSource } from "typeorm";
import { config } from "./config/server_config";

const AppDataSource = new DataSource({
    type: "mysql",
    url: config.DB_URI,
    synchronize: true,
    // logging: true,
    entities: ["src/entities/**/*.ts"],
    migrations: [],
    subscribers: [],
});

AppDataSource.initialize()
    .then(() => console.log("DB connected"))
    .catch((err) => console.log("Error connecting DB", err));

export default AppDataSource;
