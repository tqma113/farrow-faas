import { start } from 'farrow-faas/starter'

declare let routesPath: string
declare let middlewaresPath: string | null
declare let port: string

const loadModule = <M = any>(module: any): M => {
  return module.default || module
}

const main = () => {
  Promise.all([import(routesPath), middlewaresPath ? import(middlewaresPath) : void 0])
    .then(([routes, load]) => {
      return [loadModule<any>(routes), load ? loadModule<any>(load) : void 0] as const
    })
    .then(([routes, load]) => {
      start(routes, { port, loadMiddlewares: load })
    })
}

main()
