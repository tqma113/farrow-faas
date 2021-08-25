import path from 'path'
import { checkFileExists } from '../utils'
import {
  FILE_EXTENSIONS,
  ROUTES_FILE_NAME,
  MIDDLEWARES_FILE_NAME,
} from '../constants'
import { generateRoutes } from '../generate'
import type { BundleScriptOptions } from '../bin'

const SHIM_PATH = path.resolve(__dirname, '../shim.js')

export const bundle = async ({
  dir,
  entry,
  middlewares,
  output,
  port = '80',
}: BundleScriptOptions) => {
  const pwd = dir || process.cwd()

  const entryPath: string = entry
    ? path.resolve(pwd, entry)
    : (await searchRoutes(pwd)) || (await generateRoutes(pwd))
  const middlewaresPath: string | null = middlewares
    ? path.resolve(pwd, middlewares)
    : await searchMiddlewares(pwd)

  require('esbuild').build({
    bundle: true,
    inject: [SHIM_PATH],
    define: {
      routesPath: '"' + entryPath + '"',
      middlewaresPath: '"' + middlewaresPath + '"',
      port,
    },
    entryPoints: [entryPath],
    outdir: output,
    platform: 'node',
  })
}

const searchRoutes = async (pwd: string): Promise<string | null> => {
  for (const extension of FILE_EXTENSIONS) {
    const absoluePath = path.resolve(pwd, `${ROUTES_FILE_NAME}.${extension}`)
    const isExist = await checkFileExists(absoluePath)
    if (isExist) {
      return absoluePath
    }
  }

  return null
}

const searchMiddlewares = async (pwd: string): Promise<string | null> => {
  for (const extension of FILE_EXTENSIONS) {
    const absoluePath = path.resolve(
      pwd,
      `${MIDDLEWARES_FILE_NAME}.${extension}`,
    )
    const isExist = await checkFileExists(absoluePath)
    if (isExist) {
      return absoluePath
    }
  }

  return null
}
