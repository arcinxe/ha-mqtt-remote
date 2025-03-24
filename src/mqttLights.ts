import { execSync } from 'child_process';
import { MqttConfig } from './types.js';
import { MqttClient } from './mqttClient.js';

interface MqttLight {
  name: string;
  friendly_name: string;
  command_topic: string;
  state_topic: string;
  unique_id: string;
  object_id: string;
  icon?: string;
  instance: string;
  command: string;
}

const lenovoLegion7RgbLights: MqttLight = {
  name: 'lenovo-legion7_rgb_light',
  friendly_name: 'Lenovo Legion 7 RGB Lights',
  command_topic: 'homeassistant/light/rgb_light/set',
  state_topic: 'homeassistant/light/rgb_light/state',
  unique_id: 'lenovo-legion7_rgb_light',
  object_id: 'lenovo-legion7_rgb_light',
  icon: 'mdi:led-strip',
  instance: 'lenovo-legion7',
  command: '/home/arcin/.npm-global/bin/legion7-rgb'
};

export class MqttLightsService {
  private mqttClient: MqttClient;
  private currentColor: { r: number; g: number; b: number } = { r: 255, g: 0, b: 8 };

  constructor(config: MqttConfig) {
    this.mqttClient = MqttClient.getInstance(config);
    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.mqttClient.subscribe(lenovoLegion7RgbLights.command_topic, (topic, payload) => {
      try {
        console.log(`Received command: ${payload}`);
        const command = payload.toString();
        
        // Check if the command is a color value (comma-separated RGB)
        if (command.includes(',')) {
          const [r, g, b] = command.split(',').map(Number);
          this.currentColor = { r, g, b };
          const hexColor = `${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
          execSync(`${lenovoLegion7RgbLights.command} -l ${hexColor} -v ${hexColor} -n ${hexColor} -k ${hexColor}`);
          console.log(`Executed RGB command: ${hexColor}`);
          
          // Publish state update
          const state = {
            state: "ON",
            color: { r, g, b },
            color_mode: "rgb"
          };
          this.mqttClient.publish(lenovoLegion7RgbLights.state_topic, JSON.stringify(state));
        } else if (command === "OFF") {
          // Handle turn off command
          execSync(`${lenovoLegion7RgbLights.command} -l 000000 -v 000000 -n 000000 -k 000000`);
          console.log('Turned off RGB lights');
          
          // Publish state update
          const state = {
            state: "OFF",
            color: { r: 0, g: 0, b: 0 },
            color_mode: "rgb"
          };
          this.mqttClient.publish(lenovoLegion7RgbLights.state_topic, JSON.stringify(state));
        } else if (command === "ON") {
          // Handle turn on command - restore last color
          const { r, g, b } = this.currentColor;
          const hexColor = `${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
          execSync(`${lenovoLegion7RgbLights.command} -l ${hexColor} -v ${hexColor} -n ${hexColor} -k ${hexColor}`);
          console.log(`Turned on RGB lights with color: ${hexColor}`);
          
          // Publish state update
          const state = {
            state: "ON",
            color: { r, g, b },
            color_mode: "rgb"
          };
          this.mqttClient.publish(lenovoLegion7RgbLights.state_topic, JSON.stringify(state));
        }
      } catch (error) {
        console.error('Error processing light command:', error);
      }
    });

    this.publishLights();
  }

  private publishLights() {
    if (lenovoLegion7RgbLights.instance === this.mqttClient.getInstanceName()) {
      const haLight = {
        platform: "mqtt",
        name: lenovoLegion7RgbLights.name,
        friendly_name: lenovoLegion7RgbLights.friendly_name,
        command_topic: lenovoLegion7RgbLights.command_topic,
        state_topic: lenovoLegion7RgbLights.state_topic,
        unique_id: lenovoLegion7RgbLights.unique_id,
        object_id: lenovoLegion7RgbLights.object_id,
        icon: lenovoLegion7RgbLights.icon,
        color_mode: "rgb",
        supported_color_modes: ["rgb"],
        brightness: false,
        brightness_scale: 255,
        rgb: true,
        rgb_command_topic: lenovoLegion7RgbLights.command_topic,
        state_value_template: "{{ value_json.state }}",
        color_value_template: "{{ value_json.color | tojson }}"
      };

      const topic = `homeassistant/light/${lenovoLegion7RgbLights.name}/config`;
      this.mqttClient.publish(topic, JSON.stringify(haLight), { retain: true });
      console.log(`Published light: ${lenovoLegion7RgbLights.name}`);

      // Publish initial state
      const initialState = {
        state: "ON",
        color: this.currentColor,
        color_mode: "rgb"
      };
      this.mqttClient.publish(lenovoLegion7RgbLights.state_topic, JSON.stringify(initialState));
    }
  }
} 