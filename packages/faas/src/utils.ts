import fs from 'fs'
import globby from 'globby'
import { isFunc, FuncType, Route as DraftRoute } from 'farrow-faas-runtime'

export const getFunc = async (pwd: string, func: DraftRoute['func']): Promise<FuncType> => {
  if (isFunc(func)) {
    return func
  }

  return (await func()).default
}

export const loadModule = <M = any>(module: any): M => {
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