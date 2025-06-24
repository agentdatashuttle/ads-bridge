import { load_config } from "./config/config";
import { ADSBridge } from "./core/bridge";
import { ADSRabbitMQClientParams } from "./types/types";
import { createLogger } from "./utils/logger";
import { quitProcess } from "./utils/quit";

const config = load_config();
const LOGGER = createLogger("MainADSBridge");

(async () => {
  const rabbitMqClientParams: ADSRabbitMQClientParams = {
    host: config.rabbitmq_host,
    port: config.rabbitmq_port,
    username: config.rabbitmq_username,
    password: config.rabbitmq_password,
  };

  const adsBridge = new ADSBridge(rabbitMqClientParams);

  try {
    await adsBridge.start();
  } catch (error) {
    LOGGER.error("Error starting ADS Bridge", error);
  } finally {
    quitProcess(adsBridge);
  }
})();
