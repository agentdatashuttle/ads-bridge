import { ADSBridge } from "../../core/bridge";
import { createLogger } from "../../utils/logger";

const LOGGER = createLogger("ADSBridgeSocketIoHandler");

const setupSocketHandlers = (adsBridge: ADSBridge) => {
  // Socket.io handlers
  adsBridge.socketIoServer.on("connection", (socket) => {
    LOGGER.info("A client connected", { sid: socket.id });

    socket.on("disconnect", () => {
      LOGGER.info("A client disconnected", { sid: socket.id });
    });
  });
};

export default setupSocketHandlers;
