import { IncomingMessage } from 'http'
import type { JsonType } from 'farrow-schema'
import { AsyncPipeline, createAsyncPipeline } from 'farrow-pipeline'

export type FuncRouterPipeline = AsyncPipeline<IncomingMessage, JsonType>

export const createRouter = (): FuncRouterPipeline => {
  return createAsyncPipeline()
}

export const router = createRouter()
