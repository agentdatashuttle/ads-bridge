import * as amqp from "amqplib";
import { createLogger } from "../utils/logger";
import { ADSRabbitMQClientParams } from "../types/types";
import { ADSBridge } from "./bridge";

const LOGGER = createLogger("ADSRabbitMQClient");

export class ADSRabbitMQClient {
  static readonly ADS_WORKER_QUEUE_NAME = "ads_events_worker_queue";
  private clientParams: ADSRabbitMQClientParams;
  private connection: amqp.ChannelModel | null = null;

  constructor(clientParams: ADSRabbitMQClientParams) {
    this.clientParams = clientParams;
  }

  connect = async () => {
    try {
      const { host, port, username, password } = this.clientParams;
      const conn = await amqp.connect({
        hostname: host,
        port,
        username,
        password,
      });
      this.connection = conn;
      await this.createAdsWorkerQueueIfNotExists();
      LOGGER.debug("Connected to RabbitMQ broker.");
    } catch (error) {
      LOGGER.error("Failed to connect to RabbitMQ broker:", error);
      this.connection = null;
      throw error;
    }
  };

  disconnect = async () => {
    if (this.connection) {
      await this.connection.close();
      this.connection = null;
      LOGGER.warn("Disconnected from RabbitMQ broker.");
    }
  };

  isConnected = () => {
    return this.connection !== null;
  };

  getChannel = async () => {
    if (!this.isConnected() || !this.connection) {
      throw new Error("Not connected to RabbitMQ broker.");
    }
    const channel = await this.connection.createChannel();
    return channel;
  };

  createAdsWorkerQueueIfNotExists = async () => {
    const channel = await this.getChannel();
    await channel.assertQueue(ADSRabbitMQClient.ADS_WORKER_QUEUE_NAME, {
      durable: true,
    });
    LOGGER.debug(
      `RabbitMQ Worker Queue '${ADSRabbitMQClient.ADS_WORKER_QUEUE_NAME}' created or already exists.`
    );
    await channel.close();
  };

  setupCallback = async (ads_bridge: ADSBridge, callback: any) => {
    if (!this.isConnected()) {
      throw new Error("ADS Bridge is not connected to the RabbitMQ broker.");
    }

    try {
      const channel = await this.getChannel();
      await channel.prefetch(1); // Set prefetch count to 1 to ensure that the consumer processes one message at a time

      // Set up the callback function to process messages and start consuming messages
      channel.consume(
        ADSRabbitMQClient.ADS_WORKER_QUEUE_NAME,
        (msg) => callback(ads_bridge, channel, msg),
        {
          noAck: false,
        }
      );

      LOGGER.debug(
        `Callback set up for processing messages from ADS Publisher - Queue name: ${ADSRabbitMQClient.ADS_WORKER_QUEUE_NAME}`
      );
    } catch (error) {
      LOGGER.error(
        `Error in setting callback for processing messages from ADS Publisher - Queue name: ${ADSRabbitMQClient.ADS_WORKER_QUEUE_NAME}`,
        error
      );
      throw error;
    }
  };
}
