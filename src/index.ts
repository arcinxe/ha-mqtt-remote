import { MqttService } from './mqttService.js';
import { MqttLightsService } from './mqttLights.js';
import { scenes } from './scenes.js';

const instanceName = process.env.INSTANCE_NAME || 'lenovo-legion7';

const config = {
  host: process.env.MQTT_HOST || 'localhost',
  port: parseInt(process.env.MQTT_PORT || '1883', 10),
  username: process.env.MQTT_USERNAME || '',
  password: process.env.MQTT_PASSWORD || '',
  clientId: `${process.env.MQTT_CLIENT_ID || 'ha-scenes'}-${Math.random().toString(16).slice(3)}`
};

const mqttService = new MqttService(config);
const mqttLightsService = new MqttLightsService(config);

// Handle process termination
process.on('SIGINT', () => {
  console.log('Shutting down...');
  process.exit(0);
});