import path from 'path'
import * as asyncHooksNode from 'farrow-pipeline/asyncHooks.node'
import { getRoutes } from '../routes'
import { rpc } from '../starter'
import { getFunc } from '../utils'
import type { DevScriptOptions } from '../bin'

export const dev = ({ dir, entry }: DevScriptOptions) => {
  const pwd = dir || process.cwd()

  // enable async hooks
  asyncHooksNode.enable()

  require('ts-node').register({
    transpileOnly: true,
    project: path.resolve(pwd, 'tsconfig.json'),
  });

  getRoutes(pwd).then(routes => Promise.all(routes.map(async route => ({
    ...route,
    func: await getFunc(pwd, route.func)
  })))).then(routes => {
    rpc(routes, { port: 3000 })
  })
}
