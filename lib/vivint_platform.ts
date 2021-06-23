import type { Client } from 'mqtt'
import VivintApiModule from './vivint_api'
import { SecurityState } from './types'
import type { Config, PubNubMessage } from './types'

const isSecurityState = (msg) =>
  msg.Data.PlatformContext?.validation?.MessagePayload_Args
    ?.MessagePayload_Name?.[0] === 'security_state'

const getSecurityState = (msg): SecurityState =>
  msg.Data.PlatformContext.validation.MessagePayload_Args
    .MessagePayload_Value[0]

export default class VivintPlatform {
  api: any
  config: Config
  cachedAccessories: any[]

  constructor(log: Console, config: Config, mqttClient: Client, api: any) {
    this.config = config
    this.api = api
    this.cachedAccessories = []
    let config_apiLoginRefreshSecs = config.apiLoginRefreshSecs || 1200 // once per 20 minutes default

    VivintApiModule(config, log)
      .login({
        username: config.username,
        password: config.password,
      })
      .then((vivintApi) =>
        vivintApi.connectPubNub().then((pubNub) => {
          // const snapshot = vivintApi.deviceSnapshot()

          pubNub.addListener({
            status: function (statusEvent) {
              switch (statusEvent.category) {
                case 'PNConnectedCategory':
                  log.debug('Connected to Pubnub')
                  break
                case 'PNReconnectedCategory':
                  log.warn('Reconnected to Pubnub')
                  break
                default:
                  log.warn('Could not connect to Pubnub, reconnecting...')
                  log.error(statusEvent)
              }
            },
            message: function ({ message }) {
              const parsed = vivintApi.parsePubNub(message) as PubNubMessage

              if (isSecurityState(parsed)) {
                mqttClient.publish(
                  'stat/vivint/panel/STATUS',
                  SecurityState[getSecurityState(parsed)]
                )
              }

              parsed.Data?.Devices?.forEach((device) => {
                const mapping = config.mappings[device.Id]

                if (mapping) {
                  if (mapping.type === 'switch') {
                    mqttClient.publish(
                      mapping.topic,
                      device.Status ? 'ON' : 'OFF'
                    )
                  }
                } else {
                  log.info(JSON.stringify(device, null, 2))
                }
              })
            },
          })

          //Refreshing the token
          setInterval(() => {
            vivintApi
              .renew()
              .then((vivintApi) => vivintApi.renewPanelLogin())
              .catch((err) => log.error('Error refreshing login info:', err))
          }, config_apiLoginRefreshSecs * 1000)

          //Setting up the system info refresh to keep the notification stream active
          setInterval(() => {
            vivintApi
              .renewSystemInfo()
              .catch((err) => log.error('Error getting system info:', err))
          }, (config_apiLoginRefreshSecs / 20) * 1000)
        })
      )
      .catch((error) => {
        log.error('Error while bootstrapping accessories:', error)
        // Promise.all(this.cachedAccessories).then(setCatastrophe)
      })
  }

  configureAccessory(accessory) {
    this.cachedAccessories.push(accessory)
  }
}
