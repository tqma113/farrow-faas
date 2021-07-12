import { parse as parseQuery } from 'querystring'
import { createHttpServer, ServerOptions, getBody } from './server'
import * as services from './services'
import type { Server } from 'http'
import type { FuncType } from 'farrow-faas-runtime'


export type StartOptions = ServerOptions & {
  port?: string | number
}

export const startFunc = (func: FuncType, options?: StartOptions) => {
  const server = createHttpServer(async (req, res) => {
    if (typeof req.url !== 'string') {
      throw new Error(`req.url is not existed`)
    }

    const { url } = req

    const [, search = ''] = url.split('?')

    const query = (req as any).query ?? parseQuery(search)

    const body = (req as any).body ?? (await getBody(req))

    return func.run({ ...query, ...body })
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

export type RESTfulStartOptions = StartOptions & {
  basenames?: string[]
}
export const restful = async (routes: services.Route[], options?: RESTfulStartOptions) => {
  const handler = services.restful(routes)
  const server = createHttpServer(async (req, res) => {
    if (typeof req.url !== 'string') {
      throw new Error(`req.url is not existed`)
    }

    const { url } = req

    const [pathname = '/', search = ''] = url.split('?')


    const query = (req as any).query ?? parseQuery(search)

    const body = (req as any).body ?? (await getBody(req))

    return handler(pathname, { ...query, ...body })
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

export type RPCStartOptions = StartOptions & {
  path?: string
}
export const rpc = async (routes: services.Route[], options?: StartOptions) => {
  const handler = services.rpc(routes)
  const server = createHttpServer(async (req, res) => {
    const body = (req as any).body ?? (await getBody(req))

    return handler(body)
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
