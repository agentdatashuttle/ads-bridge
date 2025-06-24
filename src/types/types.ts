export interface ADSDataPayload {
  event_name: string;
  event_description: string;
  event_data: Record<string, any>;
}

export interface ADSRabbitMQClientParams {
  host: string;
  port: number;
  username: string;
  password: string;
}
