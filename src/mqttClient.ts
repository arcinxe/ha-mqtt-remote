import mqtt from 'mqtt';
import { MqttConfig } from './types.js';

export class MqttClient {
  private static instance: MqttClient;
  private client: ReturnType<typeof mqtt.connect>;
  private config: MqttConfig;
  private instanceName: string;
  private subscribers: Map<string, (topic: string, payload: Buffer) => void>;

  private constructor(config: MqttConfig) {
    this.config = config;
    const instanceName = process.env.INSTANCE_NAME;
    if (!instanceName) {
      throw new Error('INSTANCE_NAME environment variable is required');
    }
    this.instanceName = instanceName;
    this.subscribers = new Map();

    this.client = mqtt.connect(`mqtt://${config.host}:${config.port}`, {
      clientId: config.clientId,
      clean: true,
      connectTimeout: 4000,
      username: config.username,
      password: config.password,
      reconnectPeriod: 1000,
    });

    this.setupEventHandlers();
  }

  public static getInstance(config: MqttConfig): MqttClient {
    if (!MqttClient.instance) {
      MqttClient.instance = new MqttClient(config);
    }
    return MqttClient.instance;
  }

  private setupEventHandlers() {
    this.client.on('connect', () => {
      console.log('Connected to MQTT broker');
      // Notify subscribers that we're connected
      this.subscribers.forEach((callback, topic) => {
        this.client.subscribe(topic);
      });
    });

    this.client.on('message', (topic: string, payload: Buffer) => {
      const callback = this.subscribers.get(topic);
      if (callback) {
        callback(topic, payload);
      }
    });
  }

  public subscribe(topic: string, callback: (topic: string, payload: Buffer) => void) {
    this.subscribers.set(topic, callback);
    if (this.client.connected) {
      this.client.subscribe(topic);
    }
  }

  public publish(topic: string, message: string, options?: mqtt.IClientPublishOptions) {
    this.client.publish(topic, message, options);
  }

  public getInstanceName(): string {
    return this.instanceName;
  }
} 