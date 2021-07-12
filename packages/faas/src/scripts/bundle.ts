import fs from 'fs'
import path from 'path'
import esbuild from 'esbuild'
import { checkFileExists } from '../utils'
import { ROUTES_EXTENSIONS, ROUTES_FILE_NAME } from '../constants'
import type { BundleScriptOptions } from '../bin'

export const bundle = ({}: BundleScriptOptions) => {

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
