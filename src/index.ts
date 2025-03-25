import { config } from 'dotenv';
import { MqttService } from './mqttService.js';
import { MqttLightsService } from './mqttLights.js';
import { scenes } from './scenes.js';
import { MqttConfig } from './types.js';
import logger from './logger.js';

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

const mqttService = new MqttService(mqttConfig);

try {
  const mqttLightsService = new MqttLightsService(mqttConfig);
  logger.info('MQTT Lights Service started successfully');
} catch (error) {
  logger.error('Failed to start MQTT Lights Service:', error);
  process.exit(1);
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('Shutting down...');
  process.exit(0);
});