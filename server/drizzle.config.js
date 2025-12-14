import { defineConfig } from "drizzle-kit";

export default defineConfig({
    schema: "./schema.js",
    out: "./migrations",
    driver: "pg",
    dbCredentials: {
        connectionString: process.env.DATABASE_URL,
    },
});
