/* eslint-disable no-console */
// getting-started.js
import mongoose from "mongoose";
import {envVars} from "./config/env";
import app from "./app";
import {Server} from "http";
import {connectRedis} from "./config/redis.config";
import {superAdmin} from "./utils/superAdmin";

let server: Server;

async function main() {
  try {
    await mongoose.connect(envVars.MONGO_URI);

    server = app.listen(envVars.PORT, () => {
      console.log(`Example app listening on port ${envVars.PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
}

(async () => {
  await connectRedis();
  await main();
  await superAdmin();
})();

process.on("SIGTERM", () => {
  console.log("SIGTERM signal received... Server shutting down..");

  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }

  process.exit(1);
});

process.on("SIGINT", () => {
  console.log("SIGINT signal received... Server shutting down..");

  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }

  process.exit(1);
});

process.on("unhandledRejection", (err) => {
  console.log("Unhandled Rejection detected... Server shutting down..", err);

  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }

  process.exit(1);
});

process.on("uncaughtException", (err) => {
  console.log("Uncaught Exception detected... Server shutting down..", err);

  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }

  process.exit(1);
});
