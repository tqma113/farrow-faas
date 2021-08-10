import { AsyncPipeline, createAsyncPipeline } from 'farrow-pipeline'

export type FuncRouterPipeline = AsyncPipeline<unknown, unknown>

export const createRouter = (): FuncRouterPipeline => {
  return createAsyncPipeline()
}

export const router = createRouter()
