import type { Client } from 'mqtt'
import VivintApiModule from './vivint_api'
import type { Config } from './types'

export default class VivintPlatform {
  api: any

  log: Console
  config: Config
  mqttClient: Client
  pubNubPromise: Promise<any>
  vivintApiPromise: Promise<any>
  cachedAccessories: any[]

  constructor(log: Console, config: Config, mqttClient: Client, api: any) {
    this.log = log
    this.config = config
    this.api = api
    this.mqttClient = mqttClient
    this.cachedAccessories = []

    let config_apiLoginRefreshSecs = config.apiLoginRefreshSecs || 1200 // once per 20 minutes default

    let VivintApi = VivintApiModule(config, log)
    this.vivintApiPromise = VivintApi.login({
      username: config.username,
      password: config.password,
    })

    this.pubNubPromise = this.vivintApiPromise.then((vivintApi) =>
      vivintApi.connectPubNub()
    )

    Promise.all([
      this.vivintApiPromise,
      this.pubNubPromise,
      this.cachedAccessories,
    ])
      .then(([vivintApi, pubNub]) => {
        this.log.debug(JSON.stringify(vivintApi.deviceSnapshot(), undefined, 4))

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
          message: function (msg) {
            log.debug(
              'Parsed PubNub message:',
              JSON.stringify(vivintApi.parsePubNub(msg.message), undefined, 4)
            )
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
      .catch((error) => {
        log.error('Error while bootstrapping accessories:', error)
        // Promise.all(this.cachedAccessories).then(setCatastrophe)
      })
  }

  configureAccessory(accessory) {
    this.cachedAccessories.push(accessory)
  }
}
