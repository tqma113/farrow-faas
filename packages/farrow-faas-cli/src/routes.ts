import fs from 'fs'
import path from 'path'
import { Result, Ok, Err } from './result'
import { loadModule, getFiles, getNameFromFilename } from './utils'
import { FUNCION_FILE_DIR, FILE_EXTENSIONS, ROUTES_FILE_NAME } from './constants'
import type { Route } from 'farrow-faas'

export const getRoutes = async (pwd: string): Promise<Route[]> => {
  const searchResult = await search(pwd)

  if (searchResult.isErr) {
    const funcDir = path.resolve(pwd, FUNCION_FILE_DIR)
    return getRoutesFromDisk(funcDir)
  }

  return searchResult.value
}

const checkFileExists = async (filename: string) => {
  return fs.promises
    .access(filename, fs.constants.F_OK)
    .then(() => true)
    .catch(() => false)
}
const search = async (pwd: string): Promise<Result<Route[], void>> => {
  for (const extension of FILE_EXTENSIONS) {
    const absoluePath = path.resolve(pwd, `${ROUTES_FILE_NAME}.${extension}`)
    const isExist = await checkFileExists(absoluePath)
    if (isExist) {
      const module = loadModule(require(absoluePath))
      if (module) {
        return Ok(module)
      }
    }
  }

  return Err(void 0)
}

const getRoutesFromDisk = (pwd: string): Route[] => {
  const files = getFiles(pwd).map((filename) => path.resolve(pwd, filename))

  return files.map((filename) => {
    return {
      path: `/${getNameFromFilename(pwd, filename)}`,
      func: () => import(path.resolve(pwd, filename)),
    }
  })
}
