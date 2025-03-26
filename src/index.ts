import { config } from 'dotenv';
import { MqttScenesService } from './mqttScenes';
import { MqttLightsService } from './mqttLights';
import { MqttButtonsService } from './mqttButtons';
import { scenes } from './scenes';
import { MqttConfig } from './types';
import logger from './logger';

// Load environment variables
config();

const instanceName = process.env.INSTANCE_NAME || 'lenovo-legion7';

const mqttConfig: MqttConfig = {
  host: process.env.MQTT_HOST || 'localhost',
  port: parseInt(process.env.MQTT_PORT || '1883'),
  username: process.env.MQTT_USERNAME || '',
  password: process.env.MQTT_PASSWORD || '',
  clientId: process.env.MQTT_CLIENT_ID || 'ha-mqtt-remote',
};

try {
  const mqttScenesService = new MqttScenesService(mqttConfig);
  const mqttLightsService = new MqttLightsService(mqttConfig);
  const mqttButtonsService = new MqttButtonsService(mqttConfig);
  logger.info('MQTT Services started successfully');
} catch (error) {
  logger.error('Failed to start MQTT Services:', error);
  process.exit(1);
}

// Handle process termination
process.on('SIGINT', () => {
  logger.info('Received SIGINT. Shutting down...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.info('Received SIGTERM. Shutting down...');
  process.exit(0);
});