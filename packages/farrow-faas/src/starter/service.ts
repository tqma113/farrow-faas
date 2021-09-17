import { match, MatchFunction } from 'path-to-regexp'
import type { FuncType, Route } from '../runtime'
import type { FinalRoute } from './routes'

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
export const createMatcher = async (routes: FinalRoute[]): Promise<Matcher> => {
  const finalRoutes: IntactRoute[] = await Promise.all(routes.map(createRoute))
  const routeLength: number = routes.length
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

export type IntactRoute = FinalRoute & {
  matcher: MatchFunction
}
export const createRoute = async (route: FinalRoute): Promise<IntactRoute> => {
  const finalRoute: Route = Object.assign({}, route)
  const matcher = match(finalRoute.path)
  const intactRoute: IntactRoute = Object.assign(route, { matcher })
  return intactRoute
}

function cleanPath(path: string): string {
  return path.replace(/\/\//g, '/')
}
