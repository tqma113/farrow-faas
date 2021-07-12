import path from 'path'
import { match, MatchFunction } from 'path-to-regexp'
import type { JsonType } from 'farrow-schema'
import type { FuncType } from 'farrow-faas-runtime'

export type Route = {
  name: string
  func: FuncType
}
export type UnmatchedError = {
  type: 'UnmatchedError',
  path: string
}
export const UnmatchedError = (path: string): UnmatchedError => {
  return {
    type: 'UnmatchedError',
    path
  }
}

export const restful = (routes: Route[]) => {
  const matcher = createMatcher(routes)
  return async (path: string, input: Readonly<JsonType>) => {
    const matches = matcher(path)

    if (!matches) {
      return UnmatchedError(path)

    }

    const [params, func] = matches

    return func.run({ ...params, input })
  }
}

export type Calling = {
  name: string
  input: Readonly<JsonType>
}
export const rpc = (routes: Route[]) => {
  const internalRoutes = routes.slice()
  const routesLength = internalRoutes.length
  const findFunc = (name: string): FuncType | null => {
    for(let i = 0;i < routesLength;i++) {
      const route = internalRoutes[i]
      if (route && route.name === name) {
        return route.func
      }
    }

    return null
  }

  return (calling: Calling) => {
    const func = findFunc(calling.name)

    if (!func) {
      return UnmatchedError(calling.name)
    }

    return func.run(calling.input)
  }
}

export type Matcher = (pathname: string) => [object, FuncType] | null
export const createMatcher = (routes: Route[]): Matcher => {
  const finalRoutes: IntactRoute[] = routes.map(createRoute);
  const routeLength: number = finalRoutes.length;
  const matcher: Matcher = (pathname) => {
    let finalPathname = cleanPath(pathname);
    for (let i = 0; i < routeLength; i++) {
      const route = finalRoutes[i];
      const matches = route.matcher(finalPathname);
      if (!matches) {
        continue;
      }
      return [matches.params, route.func]
    }
    return null;
  };

  return matcher;
}

type IntactRoute = {
  matcher: MatchFunction
  func: FuncType
}
const createRoute = (route: Route): IntactRoute => {
  const finalRoute: Route = Object.assign({}, route);
  const matcher = match(finalRoute.name);
  const intactRoute: IntactRoute = Object.assign({ matcher}, route)
  return intactRoute;
}

function cleanPath(path: string): string {
  return path.replace(/\/\//g, "/");
}
