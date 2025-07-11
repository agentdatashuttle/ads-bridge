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

    // Broadcast Socket.io event to one random ADS Subscriber in each room (each room represents a pool of ADS Subscribers which are ideally horizontally scaled replicas of the same ADS Subscriber Agent where only one of them should invoke the agent on an ADS Event)
    const sockets_in_cluster = await ads_bridge.socketIoServer.fetchSockets();
    const socket_rooms = new Map<string, Set<string>>();
    for (const socket of sockets_in_cluster) {
      const roomIds = Array.from(socket.rooms);

      for (const roomId of roomIds) {
        if (!socket_rooms.has(roomId)) {
          socket_rooms.set(roomId, new Set());
        }
        socket_rooms.get(roomId)?.add(socket.id);
      }
    }

    for (const roomId of socket_rooms.keys()) {
      if (roomId.startsWith(config.ads_subscribers_pool_id_prefix)) {
        const socketsInRoom = Array.from(
          socket_rooms.get(roomId)?.values() || []
        );
        const randomIdx = Math.floor(Math.random() * socketsInRoom.length);
        if (socketsInRoom.length === 0) {
          LOGGER.warn(
            `No sockets found in room '${roomId}'. Skipping emit to this room.`
          );
          continue;
        }

        const randomSocketId = socketsInRoom[randomIdx];
        LOGGER.debug(
          `Emitting ADS event to random socket ID '${randomSocketId}' in room '${roomId}'. All sockets in this room: ${socketsInRoom.join(
            ", "
          )}`
        );

        ads_bridge.socketIoServer
          .to(randomSocketId)
          .emit(
            config.ads_publish_socket_event_name,
            JSON.stringify(messagePayload)
          );
      }
    }

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
