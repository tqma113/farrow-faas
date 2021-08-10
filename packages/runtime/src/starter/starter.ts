import { createContainer } from 'farrow-pipeline'
import { createHttpServer, ServerOptions, getBody } from './server'
import { createMatcher, UnmatchedError } from './service'
import { createRouter } from '../runtime'
import type { Route, FuncMiddlewaresLoader } from '../runtime'
import type { Server } from 'http'

export type StartOptions = ServerOptions & {
  port?: string | number
  loadMiddlewares?: FuncMiddlewaresLoader
}

export type RESTfulStartOptions = StartOptions & {
  basenames?: string[]
}
export const start = async (
  routes: Route[],
  options: RESTfulStartOptions = {},
) => {
  const matcher = await createMatcher(routes)
  const router = createRouter()

  if (options.loadMiddlewares) {
    const middlewares = options.loadMiddlewares()
    router.use(...middlewares)
  }

  const server = createHttpServer(async (req, res) => {
    if (typeof req.url !== 'string') {
      throw new Error(`req.url is not existed`)
    }

    const { url } = req

    const [pathname = '/'] = url.split('?')

    const func = matcher(pathname)

    if (func) {
      router.use(func)
    }

    const body = (req as any).body ?? (await getBody(req))

    return router.run(
      body,
      {
        container: createContainer(),
        onLast: () => {
          return UnmatchedError(pathname)
        },
      },
    ) as any
  }, options)

  if (options.port) {
    return new Promise<Server>((resolve) => {
      server.listen(options.port, () => {
        console.log(`Listening on ${options.port}`)
        resolve(server)
      })
    })
  }

  return server
}
