import "reflect-metadata";
import { DataSource } from "typeorm";
import "reflect-metadata";
import { config } from "./config/server_config";

const AppDataSource = new DataSource({
    type: "mysql",
    url: config.DB_URI,
    synchronize: true,
    logging: true,
    entities: [
        process.env.NODE_ENV === "production"
            ? "dist/entities/**/*.js" // Use JS files in production
            : "src/entities/**/*.ts", // Use TS files in development
    ],
    migrations: [
        process.env.NODE_ENV === "production"
            ? "dist/migrations/**/*.js" // Use JS files in production
            : "src/migrations/**/*.ts", // Use TS files in development
    ],
    subscribers: [],
});

AppDataSource.initialize()
    .then(() => {
        console.log("Data Source has been initialized!");
    })
    .catch((error) => {
        console.error("Error during Data Source initialization:", error);
    });

export default AppDataSource;
