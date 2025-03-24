import { Scene } from './types.js';

export const scenes: Scene[] = [
  {
    name: 'connect_soundbar',
    friendly_name: 'Connect Soundbar',
    command: 'bluetoothctl connect 17:1A:65:FA:0F:8E',
    icon: 'mdi:speaker-bluetooth',
    instance: 'lenovo-legion7'
  },
  {
    name: 'disconnect_soundbar',
    friendly_name: 'Disconnect Soundbar',
    command: 'bluetoothctl disconnect 17:1A:65:FA:0F:8E',
    icon: 'mdi:speaker-off',
    instance: 'lenovo-legion7'
  },
  {
    name: 'restart_plasma',
    friendly_name: 'Restart Plasma',
    command: 'killall plasmashell ; nohup plasmashell > /dev/null 2>&1 &',
    icon: 'mdi:desktop-classic',
    instance: 'lenovo-legion7'
  },
  {
    name: 'play_firefox',
    friendly_name: 'Play Firefox',
    command: 'playerctl -p firefox play',
    icon: 'mdi:play',
    instance: 'lenovo-legion7'
  },
  {
    name: 'pause_firefox',
    friendly_name: 'Pause Firefox',
    command: 'playerctl -p firefox pause',
    icon: 'mdi:pause',
    instance: 'lenovo-legion7'
  },
  {
    name: 'turn_off_screens',
    friendly_name: 'Turn Off Screens',
    command: 'xset dpms force off',
    icon: 'mdi:monitor-off',
    instance: 'lenovo-legion7'
  },
  {
    name: 'dim_screen',
    friendly_name: 'Dim Screen',
    command: 'brightnessctl -d intel_backlight set 1',
    icon: 'mdi:brightness-4',
    instance: 'lenovo-legion7'
  },
  {
    name: 'brighten_screen',
    friendly_name: 'Brighten Screen',
    command: 'brightnessctl -d intel_backlight set 30%',
    icon: 'mdi:brightness-7',
    instance: 'lenovo-legion7'
  },
  {
    name: 'dim_laptop_lights',
    friendly_name: 'Dim Laptop Lights',
    command: '/home/arcin/.npm-global/bin/legion7-rgb -l 000000 -v 000000 -n 000000 -k 000000',
    icon: 'mdi:led-off',
    instance: 'lenovo-legion7'
  },
  {
    name: 'brighten_laptop_lights',
    friendly_name: 'Brighten Laptop Lights',
    command: '/home/arcin/.npm-global/bin/legion7-rgb -l FF0008 -v FF0008 -n FF0008 -k FF0008',
    icon: 'mdi:led-on',
    instance: 'lenovo-legion7'
  },
  {
    name: 'performance_mode',
    friendly_name: 'Performance Mode',
    command: 'powerprofilesctl set performance',
    icon: 'mdi:speedometer',
    instance: 'lenovo-legion7'
  },
  {
    name: 'power_saver_mode',
    friendly_name: 'Power Saver Mode',
    command: 'powerprofilesctl set power-saver',
    icon: 'mdi:battery-charging',
    instance: 'lenovo-legion7'
  },
  {
    name: 'wake_screens',
    friendly_name: 'Wake Screens',
    command: 'xset dpms force on',
    icon: 'mdi:monitor',
    instance: 'lenovo-legion7'
  },
  {
    name: 'open_door_cam',
    friendly_name: 'Open Door Camera',
    command: 'vivaldi --new-tab "http://192.168.1.23:8080"',
    icon: 'mdi:cctv',
    instance: 'lenovo-legion7'
  }
]; 