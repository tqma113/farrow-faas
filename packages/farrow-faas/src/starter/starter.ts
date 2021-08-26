import { createContainer } from 'farrow-pipeline'
import { createHttpServer, ServerOptions, getBody } from './server'
import { createMatcher, UnmatchedError } from './service'
import { createRouter } from './router'
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

  router.use(async (req, next) => {
    if (typeof req.url !== 'string') {
      throw new Error(`req.url is not existed`)
    }

    const { url } = req

    const [pathname = '/'] = url.split('?')

    const func = matcher(pathname)

    console.log({ pathname, func })

    if (func) {
      const body = (req as any).body ?? (await getBody(req))

      return func.run(body)
    } else {
      return next()
    }
  })

  const server = createHttpServer(async (req, res) => {

    return router.run(req, {
      container: createContainer(),
      onLast: (req) => {
        return UnmatchedError(req.url!)
      },
    }) as any
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
