import mqtt from 'async-mqtt'
import VivintPlatform from './lib/vivint_platform'
import VivintApiModule from './lib/vivint_api'
import config from './config.json'

mqtt
  .connectAsync(config.mqttUrl, {
    username: config.mqttUsername,
    password: config.mqttPassword,
  })
  .then((client) => {
    new VivintPlatform(console, config, client, VivintApiModule)
  })
