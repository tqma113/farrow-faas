import fs from 'fs'
import path from 'path'
import { checkFileExists } from '../utils'
import { ROUTES_EXTENSIONS, ROUTES_FILE_NAME } from '../constants'
import type { BundleScriptOptions } from '../bin'

const SHIM_PATH = path.resolve(__dirname, '../shim.js')

export const bundle = async ({ dir, entry, output, port = '80' }: BundleScriptOptions) => {
  const pwd = dir || process.cwd()

  const entryPath = entry ? path.resolve(pwd, entry) : await search(pwd)

  if (entryPath) {
    require('esbuild').build({
      bundle: true,
      inject: [SHIM_PATH],
      define: { routePath: '"' + entryPath + '"', port },
      entryPoints: [entryPath],
      outdir: output,
      platform: 'node'
    })
  } else {
    console.error(`Can't find the entry`)
  }
}

const search = async (pwd: string): Promise<string | null> => {
  for(const extension of ROUTES_EXTENSIONS) {
    const absoluePath = path.resolve(pwd, `${ROUTES_FILE_NAME}.${extension}`)
    const isExist = await checkFileExists(absoluePath)
    if (isExist) {
      return absoluePath
    }
  }

  return null
}
