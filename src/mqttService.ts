import mqtt from 'mqtt';
import { execSync } from 'child_process';
import { MqttConfig, HomeAssistantScene } from './types.js';
import { scenes } from './scenes.js';

export class MqttService {
  private client: ReturnType<typeof mqtt.connect>;
  private config: MqttConfig;
  private instanceName: string;

  constructor(config: MqttConfig) {
    this.config = config;
    const instanceName = process.env.INSTANCE_NAME;
    if (!instanceName) {
      throw new Error('INSTANCE_NAME environment variable is required');
    }
    this.instanceName = instanceName;
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

  private setupEventHandlers() {
    this.client.on('connect', () => {
      console.log('Connected to MQTT broker');
      this.publishScenes();
      this.client.subscribe('homeassistant/scene_executor/set');
    });

    this.client.on('message', (topic: string, payload: Buffer) => {
      if (topic === 'homeassistant/scene_executor/set') {
        const sceneName = payload.toString();
        const scene = scenes.find(s => s.name === sceneName);
        
        if (scene && (!scene.instance || scene.instance === this.instanceName)) {
          try {
            execSync(scene.command);
            console.log(`Executed command for scene: ${scene.name}`);
          } catch (error) {
            console.error(`Error executing command for scene ${scene.name}:`, error);
          }
        }
      }
    });
  }

  private publishScenes() {
    const availableScenes = scenes.filter(scene => !scene.instance || scene.instance === this.instanceName);
    
    availableScenes.forEach(scene => {
      const haScene: HomeAssistantScene = {
        platform: "mqtt",
        name: scene.name,
        friendly_name: scene.friendly_name,
        icon: scene.icon,
        command_topic: "homeassistant/scene_executor/set",
        payload_on: scene.name,
        unique_id: `scene_${scene.name}`,
        object_id: scene.name
      };

      const topic = `homeassistant/scene/${scene.name}/config`;
      this.client.publish(topic, JSON.stringify(haScene), { retain: true });
      console.log(`Published scene: ${scene.name}`);
    });
  }
}