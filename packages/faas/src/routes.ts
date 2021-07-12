import fs from 'fs'
import path from 'path'
import { Result, Ok, Err } from './result'
import { loadModule, getFiles } from './utils'
import type { Route } from 'farrow-faas-runtime'
import { FUNCION_FILE_DIR } from './constants'

export const getRoutes = async (pwd: string): Promise<Route[]> => {
  const filepath = process.argv[3]
  if (filepath) {
    const absoluePath = path.resolve(process.cwd(), filepath)
    return loadModule(require(absoluePath))
  }

  const searchResult = await search(pwd)

  if (searchResult.isErr) {
    const funcDir = path.resolve(pwd, FUNCION_FILE_DIR)
    return getRoutesFromDisk(funcDir)
  }

  return searchResult.value
}

const checkFileExists = async (filename: string) => {
  return fs.promises.access(filename, fs.constants.F_OK)
           .then(() => true)
           .catch(() => false)
}
const ROUTES_FILE_NAME = 'routes'
const ROUTES_EXTENSIONS = ['ts', 'js', 'json']
const search = async (pwd: string): Promise<Result<Route[], void>> => {
  for(const extension of ROUTES_EXTENSIONS) {
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
  const files = getFiles(pwd)

  return files.map((filename) => {
    return {
      name: getNameFromFilename(pwd, filename),
      func: () => import(path.resolve(pwd, filename))
    }
  })
}

const getNameFromFilename = (
  pwd: string,
  filename: string,
): string => {
  const relativeName = filename.substring(pwd.length);
  const relativePath = relativeName
    .split('.')
    .slice(0, -1)
    .join('.');

  const nameSplit = relativePath.split('/').map(item => {
    if (item.length > 2) {
      if (item.startsWith('[') && item.endsWith(']')) {
        return `:${item.substring(1, item.length - 1)}`;
      }
    }

    return item;
  });

  const name = nameSplit.join('/');
  const finalName = name.endsWith('index')
    ? name.substring(0, name.length - 5)
    : name;

  return clearName(finalName);
};

const clearName = (routeName: string): string => {
  let finalRouteName = routeName.trim();

  if (finalRouteName.length > 1 && finalRouteName.endsWith('/')) {
    finalRouteName = finalRouteName.substring(0, finalRouteName.length - 1);
  }

  if (finalRouteName.startsWith('/')) {
    finalRouteName = finalRouteName.slice(1)
  }

  return finalRouteName;
};
