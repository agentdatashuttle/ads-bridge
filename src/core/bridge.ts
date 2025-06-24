import cors from "cors";
import http from "http";
import express from "express";
import { createClient, RedisClientType } from "redis";
import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import setupExpressHandlers from "../services/express/setupHandlers";
import setupSocketHandlers from "../services/socketio/setupHandlers";
import { load_config } from "../config/config";
import { ADSRabbitMQClient } from "./client";
import { ADSRabbitMQClientParams } from "../types/types";
import { createLogger } from "../utils/logger";
import { quitProcess } from "../utils/quit";
import eventCallback from "../services/rabbitmq/eventCallback";

const LOGGER = createLogger("ADSBridge");
const config = load_config();

export class ADSBridge {
  adsRabbitMQClient: ADSRabbitMQClient;
  httpServer: http.Server;
  redisAdapterPubClient: RedisClientType;
  redisAdapterSubClient: RedisClientType;
  expressApp: express.Express;
  socketIoServer: Server;

  constructor(rabbitMqClientParams: ADSRabbitMQClientParams) {
    this.adsRabbitMQClient = new ADSRabbitMQClient(rabbitMqClientParams);

    // Provision Express app
    this.expressApp = express();
    this.expressApp.use(cors({ origin: "*" }));

    // Create Redis clients for Socket.io adapter
    this.redisAdapterPubClient = createClient({
      url: `redis://${config.redis_host}:${config.redis_port}`,
    });
    this.redisAdapterSubClient = this.redisAdapterPubClient.duplicate();

    this.redisAdapterPubClient.on("error", (err) => {
      LOGGER.error("Error from Socket.io Redis adapter PubClient", err);
      process.exit(1);
    });

    this.redisAdapterSubClient.on("error", (err) => {
      LOGGER.error("Error from Socket.io Redis adapter SubClient", err);
      process.exit(1);
    });

    // Provision Socket.io server
    this.httpServer = http.createServer(this.expressApp);
    this.socketIoServer = new Server(this.httpServer, {
      cors: { origin: "*" },
      adapter: createAdapter(
        this.redisAdapterPubClient,
        this.redisAdapterSubClient
      ),
    });
  }

  start = async () => {
    return new Promise(async (resolve, reject) => {
      try {
        await this.adsRabbitMQClient.connect();

        await Promise.all([
          this.redisAdapterPubClient.connect(),
          this.redisAdapterSubClient.connect(),
        ]);
        LOGGER.debug(`Socket.io adapter Redis clients connected`);

        setupExpressHandlers(this);
        setupSocketHandlers(this);

        await this.adsRabbitMQClient.setupCallback(this, eventCallback);

        this.httpServer.listen(config.server_port, () => {
          LOGGER.info(`ADS Bridge Listening on *:${config.server_port}`);

          process.on("SIGINT", async (s) => {
            quitProcess(this);
          });
        });
      } catch (error) {
        LOGGER.error("Failed to start ADS Bridge", error);
        reject(error);
      }
    });
  };

  stop = async () => {
    await this.adsRabbitMQClient.disconnect();
    await this.socketIoServer.disconnectSockets(true);
    LOGGER.info("Successfully stopped ADS Bridge");
  };
}
