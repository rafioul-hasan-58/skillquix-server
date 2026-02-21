import { Server } from "http";
import app from "./app";
import config from "./config";
import { seedAdmin } from "./app/utils/seedAdmin";

let server: Server;

async function main() {
  server = app.listen(config.port, async () => {
    await seedAdmin()
    console.log("Raoclinical Sever is running on port ", config.port);
  });
  const exitHandler = () => {
    if (server) {
      server.close(() => {
        console.info("Server closed!");
      });
    }
    process.exit(1);
  };
  process.on("uncaughtException", (error) => {
    console.log(error);
    exitHandler();
  });

  process.on("unhandledRejection", (error) => {
    console.log(error);
    exitHandler();
  });
}

main();
