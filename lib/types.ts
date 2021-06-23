export enum SecurityState {
  DISARMED = 0,
  ARMING_AWAY_IN_EXIT_DELAY = 1,
  ARMING_STAY_IN_EXIT_DELAY = 2,
  ARMED_STAY = 3,
  ARMED_AWAY = 4,
  ARMED_STAY_IN_ENTRY_DELAY = 5,
  ARMED_AWAY_IN_ENTRY_DELAY = 6,
  ALARM = 7,
  ALARM_FIRE = 8,
  DISABLED = 11,
  WALK_TEST = 12,
}
export interface Mapping {
  vivintId: number
  topic: string
  type: string
}

export interface Config {
  username: string
  password: string
  mqttUsername: string
  mqttPassword: string
  mqttUrl: string
  apiLoginRefreshSecs?: number
  ignoreDeviceTypes?: string[]
  mappings: { [key: string]: Mapping }
}

export interface PubNubMessage {
  Id: string
  Data: Data
}

export interface Data {
  Devices: Device[]
  PlatformContext: PlatformContext
}

export interface Device {
  Id: number
  ActualType: string
  Status: boolean
  CameraThumbnailDate?: string
  DeterUserInfo?: string
  DeterTimestamp?: number
}

export interface PlatformContext {
  MessagePayload_ContextCarrier: MessagePayloadContextCarrier
  MessageId: string
  Timestamp: Date
}

export interface MessagePayloadContextCarrier {
  previous_handler: string
  tracing_context: TracingContext
}

export interface TracingContext {
  'uber-trace-id': string
}
