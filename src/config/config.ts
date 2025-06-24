let config: Config;

class Config {
  server_port: number;
  redis_host: string;
  redis_port: number;
  rabbitmq_host: string;
  rabbitmq_port: number;
  rabbitmq_username: string;
  rabbitmq_password: string;
  ads_publish_socket_event_name: string;
  log_level: string;

  constructor(
    server_port: string,
    redis_host: string,
    redis_port: string,
    rabbitmq_host: string,
    rabbitmq_port: string,
    rabbitmq_username: string,
    rabbitmq_password: string,
    ads_publish_socket_event_name: string,
    log_level: string
  ) {
    this.server_port = parseInt(server_port);
    this.redis_host = redis_host;
    this.redis_port = parseInt(redis_port);
    this.rabbitmq_host = rabbitmq_host;
    this.rabbitmq_port = parseInt(rabbitmq_port);
    this.rabbitmq_username = rabbitmq_username;
    this.rabbitmq_password = rabbitmq_password;
    this.ads_publish_socket_event_name = ads_publish_socket_event_name;
    this.log_level = log_level;
  }
}

export const load_config = () => {
  if (config) {
    return config;
  }

  const server_port = process.env.SERVER_PORT || "8000";
  const redis_host = process.env.REDIS_HOST || "localhost";
  const redis_port = process.env.REDIS_PORT || "6379";
  const rabbitmq_host = process.env.RABBITMQ_HOST || "localhost";
  const rabbitmq_port = process.env.RABBITMQ_PORT || "5672";
  const rabbitmq_username = process.env.RABBITMQ_USERNAME || "guest";
  const rabbitmq_password = process.env.RABBITMQ_PASSWORD || "guest";
  const ads_publish_socket_event_name =
    process.env.ADS_PUBLISH_SOCKET_EVENT_NAME || "ads_event_published";
  const log_level = process.env.LOG_LEVEL || "info";

  config = new Config(
    server_port,
    redis_host,
    redis_port,
    rabbitmq_host,
    rabbitmq_port,
    rabbitmq_username,
    rabbitmq_password,
    ads_publish_socket_event_name,
    log_level
  );

  return config;
};
