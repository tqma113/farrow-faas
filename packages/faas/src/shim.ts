import { rpc } from './starter'

declare let routePath: string
declare let port: string

const loadModule = <M = any>(module: any): M => {
  return module.default || module
};

const main = () => {
  import(routePath).then(module => {
    return loadModule<any>(module)
  }).then(routes => {
    rpc(routes, { port })
  })
}

main()
