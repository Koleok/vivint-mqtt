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
