
import type { FuncType, Route } from '../runtime'
import { isFunc } from '../runtime'

export type FinalRoute = Route & {
  func: FuncType
}
export const createRoute = async (route: Route): Promise<FinalRoute> => {
  const finalRoute: FinalRoute = Object.assign(
    route,
    { func: await loadFunc(route.func) },
  )
  return finalRoute
}

export const loadFunc = async (
  module: FuncType | (() => Promise<{ default: FuncType }>),
): Promise<FuncType> => {
  if (isFunc(module)) {
    return module
  }

  return module().then((module) => module.default || module)
}
