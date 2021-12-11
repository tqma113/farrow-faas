import fs from 'fs'
import globby from 'globby'
import { isFunc, FuncType, Route as DraftRoute } from 'farrow-faas'

export const getFunc = async (
  pwd: string,
  func: DraftRoute['func'],
): Promise<FuncType> => {
  if (isFunc(func)) {
    return func
  }

  return (await func()).default
}

export const loadModule = <M = any>(module: any): M => {
  return module.default || module
}

const API_FILE_RULES = [
  '**/*.[tj]s',
  '!**/_*',
  '!**/*.test.js',
  '!**/*.test.ts',
  '!**/*.d.ts',
  '!__test__/*.ts',
  '!__tests__/*.ts',
  '!node_modules/**',
]
export const getFiles = (pwd: string): string[] => {
  return globby.sync(API_FILE_RULES, {
    cwd: pwd,
    gitignore: true,
  })
}

export const checkFileExists = async (filename: string) => {
  return fs.promises
    .access(filename, fs.constants.F_OK)
    .then(() => true)
    .catch(() => false)
}

export const getName = (pwd: string, filename: string): string => {
  const relativeName = filename.substring(pwd.length)
  const relativePath = relativeName.split('.').slice(0, -1).join('.')

  const nameSplit = relativePath.split('/').map((item) => {
    if (item.length > 2) {
      if (item.startsWith('[') && item.endsWith(']')) {
        return `:${item.substring(1, item.length - 1)}`
      }
    }

    return item
  })

  const name = nameSplit.join('/')
  return clearName(name)
}

const clearName = (routeName: string): string => {
  let finalRouteName = routeName.trim()

  if (finalRouteName.length > 1 && finalRouteName.endsWith('/')) {
    finalRouteName = finalRouteName.substring(0, finalRouteName.length - 1)
  }

  if (finalRouteName.startsWith('/')) {
    finalRouteName = finalRouteName.slice(1)
  }

  return finalRouteName
}
