import os from "os";
import { ADSBridge } from "../../core/bridge";

const setupExpressHandlers = (adsBridge: ADSBridge) => {
  // Health Endpoint
  adsBridge.expressApp.get("/health", (req, res) => {
    res.send({ status: "healthy", hostname: os.hostname() });
  });

  // Stats Endpoint
  adsBridge.expressApp.get("/stats", async (req, res) => {
    const allSocketClients = await adsBridge.socketIoServer.fetchSockets();

    res.send({
      totalSocketioConnections: allSocketClients.length,
      currentInstanceSocketioConnections:
        adsBridge.socketIoServer.engine.clientsCount,
      hostname: os.hostname(),
    });
  });
};

export default setupExpressHandlers;
