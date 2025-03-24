import { execSync } from 'child_process';
import { MqttConfig, HomeAssistantScene } from './types.js';
import { scenes } from './scenes.js';
import { MqttClient } from './mqttClient.js';

export class MqttService {
  private mqttClient: MqttClient;

  constructor(config: MqttConfig) {
    this.mqttClient = MqttClient.getInstance(config);
    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.mqttClient.subscribe('homeassistant/scene_executor/set', (topic, payload) => {
      const sceneName = payload.toString();
      const scene = scenes.find(s => s.name === sceneName);
      
      if (scene && (!scene.instance || scene.instance === this.mqttClient.getInstanceName())) {
        try {
          execSync(scene.command);
          console.log(`Executed command for scene: ${scene.name}`);
        } catch (error) {
          console.error(`Error executing command for scene ${scene.name}:`, error);
        }
      }
    });

    this.publishScenes();
  }

  private publishScenes() {
    const availableScenes = scenes.filter(scene => !scene.instance || scene.instance === this.mqttClient.getInstanceName());
    
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
      this.mqttClient.publish(topic, JSON.stringify(haScene), { retain: true });
      console.log(`Published scene: ${scene.name}`);
    });
  }
}