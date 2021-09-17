import { ProviderConfigs } from '../runtime'
import { FinalRoute } from './routes'

export const mountMiddlewares = (
  routes: FinalRoute[],
  providerConfigs: ProviderConfigs,
) => {
  for (const providerConfig of providerConfigs) {
    const { options, Provider } = providerConfig

    const middleware = Provider(options)

    if ('includes' in providerConfig && providerConfig.includes) {
      for (const route of routes) {
        const { path, func } = route

        if (Array.isArray(providerConfig.includes)) {
          const shouldMount = providerConfig.includes.some((pathOrRegexp) => {
            const regexp = new RegExp(pathOrRegexp)
            return regexp.test(path)
          })

          if (shouldMount) {
            func.use(middleware)
          }
        } else {
          const regexp = new RegExp(providerConfig.includes)
          if (regexp.test(path)) {
            func.use(middleware)
          }
        }
      }
    } else if ('excludes' in providerConfig && providerConfig.excludes) {
      for (const route of routes) {
        const { path, func } = route

        if (Array.isArray(providerConfig.excludes)) {
          const shouldMount = providerConfig.excludes.every((pathOrRegexp) => {
            const regexp = new RegExp(pathOrRegexp)
            return !regexp.test(path)
          })

          if (shouldMount) {
            func.use(middleware)
          }
        } else {
          const regexp = new RegExp(providerConfig.excludes)
          if (!regexp.test(path)) {
            func.use(middleware)
          }
        }
      }
    } else {
      for (const route of routes) {
        route.func.use(middleware)
      }
    }
  }
}
