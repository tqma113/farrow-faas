import { useContainer } from 'farrow-pipeline'
import { createHttpServer, ServerOptions, getBody } from './server'
import { createMatcher, UnmatchedError } from './service'
import { mountMiddlewares } from './mountMiddlewares'
import { createRoute } from './routes'
import type { Route, ProviderConfigsLoader } from '../runtime'
import type { Server } from 'http'

export type StartOptions = ServerOptions & {
  port?: string | number
  loadProviderConfigs?: ProviderConfigsLoader
}

export type RESTfulStartOptions = StartOptions & {
  basenames?: string[]
}
export const start = async (
  routes: Route[],
  options: RESTfulStartOptions = {},
) => {
  const finalRoutes = await Promise.all(routes.map(createRoute))
  const matcher = await createMatcher(finalRoutes)

  if (options.loadProviderConfigs) {
    const providerConfigs = options.loadProviderConfigs()
    mountMiddlewares(finalRoutes, providerConfigs)
  }

  const server = createHttpServer(async (req, res) => {
    if (typeof req.url !== 'string') {
      throw new Error(`req.url is not existed`)
    }

    const { url } = req

    const [pathname = '/'] = url.split('?')

    const handleInput = matcher(pathname)

    if (handleInput) {
      const body = (req as any).body ?? (await getBody(req))

      return handleInput(body)
    } else {
      return UnmatchedError(req.url!)
    }
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
