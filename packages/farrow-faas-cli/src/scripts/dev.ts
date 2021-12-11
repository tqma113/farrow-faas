import path from 'path'
import * as asyncHooksNode from 'farrow-faas/node'
import { getRoutes } from '../routes'
import { getMiddlewares } from '../middlewares'
import { start } from 'farrow-faas/starter'
import { getFunc, loadModule } from '../utils'

import type { Route, ProviderConfigsLoader } from 'farrow-faas'
import type { DevScriptOptions } from '../bin'

export const dev = ({ dir, entry, middlewares }: DevScriptOptions) => {
  const pwd = dir || process.cwd()

  // enable async hooks
  asyncHooksNode.enable()

  require('ts-node').register({
    transpileOnly: true,
    project: path.resolve(pwd, 'tsconfig.json'),
  })

  const resolveRoutes = () => {
    return entry ? loadRoutes(path.resolve(pwd, entry)) : getRoutes(pwd)
  }

  const resolveMiddlewares = () => {
    return middlewares
      ? loadMiddlewares(path.resolve(pwd, middlewares))
      : getMiddlewares(pwd)
  }

  resolveRoutes()
    .then((routes) =>
      Promise.all([
        Promise.all(
          routes.map(async (route) => ({
            ...route,
            func: await getFunc(pwd, route.func),
          })),
        ),
        resolveMiddlewares(),
      ]),
    )
    .then(([routes, load]) => {
      start(routes, { port: 3000, loadMiddlewares: load })
    })
}

export const loadRoutes = async (routePath: string): Promise<Route[]> => {
  return import(routePath).then((module) => {
    return loadModule<Route[]>(module)
  })
}

export const loadMiddlewares = async (
  routePath: string,
): Promise<ProviderConfigsLoader> => {
  return import(routePath).then((module) => {
    return loadModule<ProviderConfigsLoader>(module)
  })
}
