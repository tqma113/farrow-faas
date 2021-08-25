import { match, MatchFunction } from 'path-to-regexp'
import { isFunc } from '../runtime'
import type { JsonType } from 'farrow-schema'
import type { FuncType, Route } from '../runtime'

export type UnmatchedError = {
  type: 'UnmatchedError'
  path: string
}
export const UnmatchedError = (path: string): UnmatchedError => {
  return {
    type: 'UnmatchedError',
    path,
  }
}

export type Matcher = (pathname: string) => FuncType | null
export const createMatcher = async (routes: Route[]): Promise<Matcher> => {
  const finalRoutes: IntactRoute[] = await Promise.all(routes.map(createRoute))
  const routeLength: number = finalRoutes.length
  const matcher: Matcher = (pathname) => {
    let finalPathname = cleanPath(pathname)
    for (let i = 0; i < routeLength; i++) {
      const route = finalRoutes[i]
      const matches = route.matcher(finalPathname)
      if (!matches) {
        continue
      }
      return route.func
    }
    return null
  }

  return matcher
}

type IntactRoute = {
  matcher: MatchFunction
  func: FuncType
}
const createRoute = async (route: Route): Promise<IntactRoute> => {
  const finalRoute: Route = Object.assign({}, route)
  const matcher = match(finalRoute.path)
  const intactRoute: IntactRoute = Object.assign(
    { matcher },
    { func: await loadFunc(route.func) },
  )
  return intactRoute
}

function cleanPath(path: string): string {
  return path.replace(/\/\//g, '/')
}

export const loadFunc = async (
  module: FuncType | (() => Promise<{ default: FuncType }>),
): Promise<FuncType> => {
  if (isFunc(module)) {
    return module
  }

  return module().then((module) => module.default || module)
}
