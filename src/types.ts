export interface Scene {
  name: string;
  command: string;
  icon?: string;
  friendly_name: string;
  instance?: string;
}

export interface MqttConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  clientId: string;
}

export interface HomeAssistantScene {
  platform: "mqtt";
  name: string;
  friendly_name: string;
  icon?: string;
  command_topic: string;
  payload_on: string;
  unique_id: string;
  object_id: string;
}