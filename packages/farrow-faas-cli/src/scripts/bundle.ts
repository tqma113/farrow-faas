import path from 'path'
import { build } from 'esbuild'
import { checkFileExists } from '../utils'
import { generateRoutes } from '../generate'
import {
  FILE_EXTENSIONS,
  ROUTES_FILE_NAME,
  MIDDLEWARES_FILE_NAME,
} from '../constants'

import type { BundleScriptOptions } from '../bin'

const SHIM_PATH = path.resolve(__dirname, '../shim.js')
const BUNDLE_ENTRY_FILE_PATH = './dist/index.js'

export const bundle = async ({
  dir,
  entry,
  middlewares,
  output,
  port = 'undefined',
}: BundleScriptOptions) => {
  const pwd = dir || process.cwd()

  const entryPath: string = entry
    ? path.resolve(pwd, entry)
    : (await searchRoutes(pwd)) || (await generateRoutes(pwd))
  const middlewaresPath: string = middlewares
    ? path.resolve(pwd, middlewares)
    : (await searchMiddlewares(pwd)) || ''

  await build({
    bundle: true,
    inject: [SHIM_PATH],
    define: {
      routesPath: '"' + entryPath + '"',
      middlewaresPath: '"' + middlewaresPath + '"',
      port,
    },
    entryPoints: [entryPath],
    outfile: output || BUNDLE_ENTRY_FILE_PATH,
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
