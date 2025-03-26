import { execSync } from 'child_process';
import { MqttClient } from './mqttClient.js';
import { MqttConfig } from './types.js';
import logger from './logger.js';
import buttons from './buttons.json' assert { type: 'json' };

interface MqttButton {
  name: string;
  friendly_name: string;
  unique_id: string;
  object_id: string;
  icon: string;
  instance: string;
  command: string;
  command_topic: string;
  payload_press: string;
}

export class MqttButtonsService {
  private mqttClient: MqttClient;
  private buttons: MqttButton[];

  constructor(config: MqttConfig) {
    this.mqttClient = MqttClient.getInstance(config);
    this.buttons = buttons.buttons;
    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    // Subscribe to each button's command topic
    this.buttons.forEach(button => {
      if (button.instance === this.mqttClient.getInstanceName()) {
        this.mqttClient.subscribe(button.command_topic, (topic, payload) => {
          try {
            const command = payload.toString();
            logger.info(`Received button command for ${button.name}: ${command}`);

            if (command === button.payload_press) {
              // Execute the command
              execSync(button.command);
              logger.info(`Executed button command for ${button.name}`);
            }
          } catch (error) {
            logger.error(`Error processing button command for ${button.name}:`, error);
          }
        });
      }
    });

    this.publishButtons();
  }

  private publishButtons() {
    this.buttons.forEach(button => {
      if (button.instance === this.mqttClient.getInstanceName()) {
        // Publish button config
        this.mqttClient.publish(
          `homeassistant/button/${button.name}/config`,
          JSON.stringify({
            platform: "mqtt",
            name: button.name,
            friendly_name: button.friendly_name,
            unique_id: button.unique_id,
            object_id: button.object_id,
            icon: button.icon,
            command_topic: button.command_topic,
            payload_press: button.payload_press,
            retain: true
          })
        );

        logger.info(`Published button: ${button.name}`);
      }
    });
  }
} 