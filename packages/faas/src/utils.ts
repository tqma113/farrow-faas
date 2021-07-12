import fs from 'fs'
import globby from 'globby'
import { isFunc, FuncType, Route as DraftRoute } from 'farrow-faas-runtime'

export type PrettyNumberOptions = {
  delimiter?: string
  separator?: string
}
export const defaultPrettyNumberOptions: Required<PrettyNumberOptions> = {
  delimiter: ',',
  separator: '.',
}

export const prettyNumber = function (number: number | string, options?: PrettyNumberOptions) {
  const config = {
    ...defaultPrettyNumberOptions,
    ...options,
  }
  const { delimiter, separator } = config
  const [first, ...rest] = number.toString().split('.')
  const text = first.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, `$1${delimiter}`)

  return [text, ...rest].join(separator)
}


export const prettyTime = (start: number): string => {
  const delta = Date.now() - start
  return prettyNumber(delta < 10000 ? `${delta}ms` : `${Math.round(delta / 1000)}s`)
}

export const getFunc = async (pwd: string, func: DraftRoute['func']): Promise<FuncType> => {
  if (isFunc(func)) {
    return func
  }

  return (await func()).default
}

export const loadModule = (module: any): any => {
  return module.default || module
};

const API_FILE_RULES = [
  '**/*.[tj]s',
  '!**/_*',
  '!**/*.test.js',
  '!**/*.test.ts',
  '!**/*.d.ts',
  '!__test__/*.ts',
  '!__tests__/*.ts',
  '!node_modules/**',
];
export const getFiles = (pwd: string): string[] => {
  return globby
    .sync(API_FILE_RULES, {
      cwd: pwd,
      gitignore: true,
    })
};

export const checkFileExists = async (filename: string) => {
  return fs.promises.access(filename, fs.constants.F_OK)
           .then(() => true)
           .catch(() => false)
}