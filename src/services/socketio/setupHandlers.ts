import { load_config } from "../../config/config";
import { ADSBridge } from "../../core/bridge";
import { createLogger } from "../../utils/logger";

const LOGGER = createLogger("ADSBridgeSocketIoHandler");
const config = load_config();

const setupSocketHandlers = (adsBridge: ADSBridge) => {
  // Socket.io handlers
  adsBridge.socketIoServer.on("connection", async (socket) => {
    const ads_subscribers_pool_id =
      socket.handshake.auth.ads_subscribers_pool_id || "";

    if (!ads_subscribers_pool_id || ads_subscribers_pool_id == "") {
      LOGGER.warn(
        `A client connected with SocketID '${socket.id}' but 'ads_subscribers_pool_id' is missing in 'auth' object. This will cause all replicas of ADS Subscribers to invoke their agents on the same ADS Event`,
        { sid: socket.id, ads_subscribers_pool_id: ads_subscribers_pool_id }
      );
    } else {
      const roomToJoin = `${config.ads_subscribers_pool_id_prefix}${ads_subscribers_pool_id}`;
      await socket.join(roomToJoin);
      LOGGER.debug(
        `Client with Socket ID '${socket.id}' joined room '${roomToJoin}'`,
        { sid: socket.id, ads_subscribers_pool_id: ads_subscribers_pool_id }
      );
    }

    LOGGER.info(
      `A client connected to ads_subscribers_pool_id '${
        ads_subscribers_pool_id || "NO ROOM ID"
      }'`,
      {
        sid: socket.id,
        ads_subscribers_pool_id: ads_subscribers_pool_id,
      }
    );

    socket.on("disconnect", () => {
      LOGGER.info("A client disconnected", {
        sid: socket.id,
        ads_subscribers_pool_id: ads_subscribers_pool_id,
      });
    });
  });
};

export default setupSocketHandlers;
