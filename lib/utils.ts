export const parseArgs = (topic: Buffer, payload: Buffer | string) => ({
  topic: topic.toString(),
  payload: typeof payload === 'object' ? JSON.parse(payload.toString()) : {},
})
