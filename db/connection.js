const { Pool } = require("pg");
const ENV = process.env.NODE_ENV || "development";

if (!process.env.PGDATABASE && !process.env.DATABASE_URL) {
  throw new Error("PGDATABASE or DATABASE_URL not set");
}

const config = {};

if (ENV === "production") {
  require("dotenv").config({
    path: `${__dirname}/../.env.${ENV}`,
  });
  config.connectionString = process.env.DATABSE_URL;
  config.max = 2;
}

module.exports = new Pool(config);
