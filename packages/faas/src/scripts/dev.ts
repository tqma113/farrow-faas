import path from 'path'
import * as asyncHooksNode from 'farrow-pipeline/asyncHooks.node'
import type { Route } from 'farrow-faas-runtime'
import { getRoutes } from '../routes'
import { start } from 'farrow-faas-runtime/starter'
import { getFunc, loadModule } from '../utils'
import type { DevScriptOptions } from '../bin'

export const dev = ({ dir, entry }: DevScriptOptions) => {
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

  resolveRoutes()
    .then((routes) =>
      Promise.all(
        routes.map(async (route) => ({
          ...route,
          func: await getFunc(pwd, route.func),
        })),
      ),
    )
    .then((routes) => {
      start(routes, { port: 3000 })
    })
}

export const loadRoutes = async (routePath: string): Promise<Route[]> => {
  return import(routePath).then((module) => {
    return loadModule<Route[]>(module)
  })
}
