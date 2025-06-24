import { Channel, ConsumeMessage } from "amqplib";
import { createLogger } from "../../utils/logger";
import { ADSDataPayload } from "../../types/types";
import { ADSBridge } from "../../core/bridge";
import { load_config } from "../../config/config";

const LOGGER = createLogger("ADSRabbitMQEventCallbackHandler");
const config = load_config();

const eventCallback = async (
  ads_bridge: ADSBridge,
  channel: Channel,
  msg: ConsumeMessage | null
) => {
  if (!msg) return;

  try {
    const messagePayload: ADSDataPayload = JSON.parse(msg.content.toString());
    LOGGER.debug(
      `Received message from ADS Publisher via RabbitMQ: ${JSON.stringify(
        messagePayload
      )}`
    );

    // Broadcast Socket.io event to all ADS Subscribers
    ads_bridge.socketIoServer.emit(
      config.ads_publish_socket_event_name,
      JSON.stringify(messagePayload)
    );

    LOGGER.debug(
      `ADS event published from ADS Bridge via Socket.io broadcast event name '${config.ads_publish_socket_event_name}'`,
      messagePayload
    );

    channel.ack(msg);
  } catch (error) {
    LOGGER.error(
      "Error processing message from ADS Publisher via RabbitMQ:",
      error
    );
    channel.nack(msg, false, false);
  } finally {
    LOGGER.debug("Message acknowledged");
  }
};

export default eventCallback;
