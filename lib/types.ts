export interface Config {
  username: string
  password: string
  mqttUsername: string
  mqttPassword: string
  mqttUrl: string
  apiLoginRefreshSecs?: number
  ignoreDeviceTypes?: string[]
}
