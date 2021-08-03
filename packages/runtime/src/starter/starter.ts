import { createHttpServer, ServerOptions, getBody } from './server'
import { service } from './service'
import type { Route } from '../runtime'
import type { Server } from 'http'

export type StartOptions = ServerOptions & {
  port?: string | number
}

export type RESTfulStartOptions = StartOptions & {
  basenames?: string[]
}
export const start = async (routes: Route[], options?: RESTfulStartOptions) => {
  const handler = await service(routes)
  const server = createHttpServer(async (req, res) => {
    if (typeof req.url !== 'string') {
      throw new Error(`req.url is not existed`)
    }

    const { url } = req

    const [pathname = '/'] = url.split('?')

    const body = (req as any).body ?? (await getBody(req))

    return handler(pathname, body)
  }, options)

  if (options?.port) {
    return new Promise<Server>((resolve) => {
      server.listen(options.port, () => {
        console.log(`Listening on ${options.port}`)
        resolve(server)
      })
    })
  }

  return server
}
