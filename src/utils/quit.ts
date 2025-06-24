import { ADSBridge } from "../core/bridge";
import { createLogger } from "./logger";

const LOGGER = createLogger("ProcessQuitHandler");

const quitProcess = async (adsBridge: ADSBridge) => {
  try {
    await adsBridge.stop();
  } catch (error) {
    LOGGER.error("Error gracefully stopping ADS Bridge", error);
  } finally {
    process.exit(0);
  }
};

export { quitProcess };
