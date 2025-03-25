import { execSync } from 'child_process';
import { MqttClient } from './mqttClient.js';
import { MqttConfig } from './types.js';
import logger from './logger.js';

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
  currentBrightness: number;
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
  command: '/home/arcin/.npm-global/bin/legion7-rgb',
  currentBrightness: 30,
};

const laptopBacklight: MqttLight = {
  name: "laptop backlight",
  friendly_name: "Laptop Backlight",
  command_topic: "homeassistant/light/laptop_backlight/set",
  state_topic: "homeassistant/light/laptop_backlight/state",
  unique_id: "laptop_backlight",
  object_id: "laptop_backlight",
  icon: "mdi:laptop",
  instance: "lenovo-legion7",
  command: "brightnessctl -d intel_backlight set {value}%",
  currentBrightness: 30,
};

export class MqttLightsService {
  private mqttClient: MqttClient;
  private currentColor: { r: number; g: number; b: number } = { r: 255, g: 0, b: 8 };

  constructor(config: MqttConfig) {
    this.mqttClient = MqttClient.getInstance(config);
    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    // RGB Light handler
    this.mqttClient.subscribe(lenovoLegion7RgbLights.command_topic, (topic, payload) => {
      try {
        logger.info(`Received RGB command: ${payload}`);
        const command = payload.toString();
        
        // Check if the command is a color value (comma-separated RGB)
        if (command.includes(',')) {
          const [r, g, b] = command.split(',').map(Number);
          this.currentColor = { r, g, b };
          const hexColor = `${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
          execSync(`${lenovoLegion7RgbLights.command} -l ${hexColor} -v ${hexColor} -n ${hexColor} -k ${hexColor}`);
          logger.info(`Executed RGB command: ${hexColor}`);
          
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
          logger.info('Turned off RGB lights');
          
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
          logger.info(`Turned on RGB lights with color: ${hexColor}`);
          
          // Publish state update
          const state = {
            state: "ON",
            color: { r, g, b },
            color_mode: "rgb"
          };
          this.mqttClient.publish(lenovoLegion7RgbLights.state_topic, JSON.stringify(state));
        }
      } catch (error) {
        logger.error('Error processing RGB light command:', error);
      }
    });

    // Backlight handler
    this.mqttClient.subscribe(laptopBacklight.command_topic, (topic: string, message: Buffer) => {
      const payload = message.toString();
      logger.info(`Received laptop backlight command: ${payload}`);

      try {
        // Handle ON/OFF commands
        if (payload === "ON") {
          // Restore last brightness
          const command = laptopBacklight.command.replace("{value}", laptopBacklight.currentBrightness.toString());
          execSync(command);
          this.mqttClient.publish(laptopBacklight.state_topic, JSON.stringify({ state: "ON", brightness: laptopBacklight.currentBrightness }));
        } else if (payload === "OFF") {
          // Turn off backlight
          const command = laptopBacklight.command.replace("{value}", "0");
          execSync(command);
          this.mqttClient.publish(laptopBacklight.state_topic, JSON.stringify({ state: "OFF", brightness: 0 }));
        } else {
          // Handle brightness command - payload is a direct integer 0-255
          const brightness = parseInt(payload);
          if (!isNaN(brightness)) {
            // Convert Home Assistant brightness (0-255) to percentage (0-100)
            const brightnessPercent = Math.round((brightness / 255) * 100);
            laptopBacklight.currentBrightness = brightnessPercent;
            const cmd = laptopBacklight.command.replace("{value}", brightnessPercent.toString());
            logger.info(`Executing command: ${cmd}`);
            execSync(cmd);
            this.mqttClient.publish(laptopBacklight.state_topic, JSON.stringify({ state: "ON", brightness: brightness }));
          }
        }
      } catch (error) {
        logger.error("Error handling laptop backlight command:", error);
      }
    });

    this.publishLights();
  }

  private publishLights() {
    if (lenovoLegion7RgbLights.instance === this.mqttClient.getInstanceName()) {
      // Publish RGB light config
      const haRgbLight = {
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

      const rgbTopic = `homeassistant/light/${lenovoLegion7RgbLights.name}/config`;
      this.mqttClient.publish(rgbTopic, JSON.stringify(haRgbLight), { retain: true });
      logger.info(`Published RGB light: ${lenovoLegion7RgbLights.name}`);

      // Publish backlight config
      this.mqttClient.publish(
        "homeassistant/light/laptop_backlight/config",
        JSON.stringify({
          platform: "mqtt",
          name: laptopBacklight.name,
          friendly_name: laptopBacklight.friendly_name,
          command_topic: laptopBacklight.command_topic,
          state_topic: laptopBacklight.state_topic,
          unique_id: laptopBacklight.unique_id,
          object_id: laptopBacklight.object_id,
          icon: laptopBacklight.icon,
          brightness: true,
          brightness_scale: 255,
          state_value_template: "{{ value_json.state }}",
          brightness_value_template: "{{ value_json.brightness }}",
          brightness_command_topic: laptopBacklight.command_topic,
          payload_on: "ON",
          payload_off: "OFF",
          state_class: "measurement",
          supported_features: 1, // Enable brightness control
          min_mireds: 0,
          max_mireds: 0,
          color_mode: "brightness",
          supported_color_modes: ["brightness"]
        })
      );

      // Publish initial state
      this.mqttClient.publish(
        laptopBacklight.state_topic,
        JSON.stringify({
          state: "ON",
          brightness: Math.round((laptopBacklight.currentBrightness / 100) * 255),
          color_mode: "brightness"
        })
      );
    }
  }
} 