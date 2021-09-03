import fs from 'fs'
import path from 'path'
import { loadModule } from './utils'
import { FILE_EXTENSIONS, MIDDLEWARES_FILE_NAME } from './constants'
import type { ProviderConfigsLoader } from 'farrow-faas'

export const getMiddlewares = async (
  pwd: string,
): Promise<ProviderConfigsLoader | undefined> => {
  for (const extension of FILE_EXTENSIONS) {
    const absoluePath = path.resolve(
      pwd,
      `${MIDDLEWARES_FILE_NAME}.${extension}`,
    )
    const isExist = await checkFileExists(absoluePath)
    if (isExist) {
      const module = loadModule(require(absoluePath))
      if (module) {
        return module
      }
    }
  }

  return void 0
}

const checkFileExists = async (filename: string) => {
  return fs.promises
    .access(filename, fs.constants.F_OK)
    .then(() => true)
    .catch(() => false)
}
