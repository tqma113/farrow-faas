import fs from 'fs/promises'
import path from 'path'
import { FUNCION_FILE_DIR } from './constants'
import { getFiles, getNameFromFilename } from './utils'
import type { Route } from 'farrow-faas-runtime'

const GENERATE_ROUTES_PATH = 'node_modules/.farrow/routes.ts'

export const generateRoutes = async (pwd: string): Promise<string> => {
  const routes = getRoutesFromDisk(path.resolve(pwd, FUNCION_FILE_DIR))
  const routePath = path.resolve(pwd, GENERATE_ROUTES_PATH)

  const codeStr = routes2Str(routes)

  await fs.mkdir(path.dirname(routePath), { recursive: true })
  await fs.writeFile(routePath, codeStr)

  return routePath
}

export const routes2Str = (routes: PathRoute[]) => {
  const importStatements = routes.map((route) => {
    return `import ${route.name} from '${route.filepath}'\n`
  })

  const routesItems = routes.map((route) => {
    return `
  {
    path: '${route.path}',
    func: ${route.name}
  },
    `
  })
  return `import { createRoutes } from 'farrow-faas-runtime'
${importStatements}

export default createRoutes([
${routesItems}
])
  `
}

export type PathRoute = {
  name: string
  path: string
  filepath: string
}
const getRoutesFromDisk = (pwd: string): PathRoute[] => {
  const files = getFiles(pwd).map((filename) => path.resolve(pwd, filename))

  return files.map((filepath) => {
    const name = getNameFromFilename(pwd, filepath)
    return {
      name,
      path: `/${name}`,
      filepath,
    }
  })
}
