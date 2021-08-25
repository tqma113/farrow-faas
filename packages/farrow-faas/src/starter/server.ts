import {
  createServer,
  RequestListener,
  IncomingMessage,
  ServerResponse,
} from 'http'
import inflate from 'inflation'
import raw from 'raw-body'
import typer from 'media-typer'
import { LoggerOptions, LoggerEvent, createLogger } from './logger'
import type { JsonType } from 'farrow-schema'

export type ServerOptions = {
  logger?: boolean | LoggerOptions
}
export type RequestHandler = (
  req: IncomingMessage,
  res: ServerResponse,
) => JsonType | Promise<JsonType>
export const createHttpServer = (
  handleRequest: RequestHandler,
  options?: ServerOptions,
) => {
  const isNotProduction = process.env.NODE_ENV !== 'production'
  const config: ServerOptions = {
    logger: isNotProduction,
    ...options,
  }

  const loggerOptions: LoggerOptions =
    !config.logger || typeof config.logger === 'boolean' ? {} : config.logger

  const logger = config.logger ? createLogger(loggerOptions) : null

  const handle: RequestListener = async (req, res) => {
    if (logger) {
      const startTime = Date.now()
      const method = req.method ?? 'GET'
      const url = req.url ?? ''

      let contentLength = 0

      let hasLogOut = false
      const logOutput = (event: LoggerEvent) => {
        if (hasLogOut) return
        hasLogOut = true
        logger?.logOutput(
          method,
          url,
          res.statusCode,
          startTime,
          contentLength || getContentLength(res),
          event,
        )
      }

      logger.logInput(method, url)
      // log close
      res.once('close', () => {
        logOutput('close')
      })

      // log error
      res.once('error', () => {
        logOutput('error')
      })

      // log finish
      res.once('finish', () => {
        logOutput('finish')
      })

      // log stream pipe response
      res.once('pipe', (readable) => {
        readable.on('data', (chunk) => {
          contentLength += chunk.length
        })
      })
    }

    try {
      const json = await handleRequest(req, res)
      const content = JSON.stringify(json)
      const length = Buffer.byteLength(content)
      res.setHeader('Content-Type', 'application/json')
      res.setHeader('Content-Length', length)
      res.end(content)
    } catch (error) {
      const message = error?.stack ?? ''

      if (!res.headersSent) {
        res.statusCode = error.statusCode ?? 500
        res.setHeader('Content-Type', 'text/plain')
        res.setHeader('Content-Length', Buffer.byteLength(message))
      }

      if (!res.writableEnded) {
        res.end(Buffer.from(message))
      }
    }
  }

  return createServer(handle)
}

export const getContentLength = (res: ServerResponse) => {
  const contentLength = res.getHeader('Content-Length')
  if (typeof contentLength === 'string') {
    const length = parseFloat(contentLength)
    return isNaN(length) ? 0 : length
  }
  if (typeof contentLength !== 'number') {
    return 0
  }
  return contentLength
}

export const getBody = async (
  req: IncomingMessage,
  options?: ParseBodyOptions,
) => {
  const type = isJsonType(req)

  if (type) {
    const body = await parseBody(req, options)
    return body
  }

  return null
}

export const handleBasenames = <T extends { pathname: string }>(
  basenames: string[],
  requestInfo: T,
) => {
  const { basename, pathname } = findBasename(basenames, requestInfo.pathname)

  const newRequestInfo = {
    ...requestInfo,
    pathname,
  }

  return {
    basename,
    requestInfo: newRequestInfo,
  }
}

const findBasename = (basenames: string[], pathname: string) => {
  for (const basename of basenames) {
    if (!pathname.startsWith(basename)) continue

    let newPathname = pathname.replace(basename, '')

    if (!newPathname.startsWith('/')) {
      newPathname = `/${newPathname}`
    }

    return {
      basename,
      pathname: newPathname,
    }
  }

  return {
    basename: '',
    pathname,
  }
}

const jsonTypes = [
  'json',
  'application/json',
  'application/*+json',
  'application/csp-report',
]

export const isJsonType = (req: IncomingMessage): boolean => {
  // no body
  if (!hasbody(req)) {
    return false
  }

  // request content type
  const value = tryNormalizeType(req.headers['content-type']) || ''

  for (let i = 0; i < jsonTypes.length; i++) {
    if (mimeMatch(normalize(jsonTypes[i]), value)) {
      return true
    }
  }

  return false
}
const hasbody = (req: IncomingMessage): boolean => {
  return (
    req.headers['transfer-encoding'] !== undefined ||
    !isNaN(Number(req.headers['content-length']))
  )
}

const mimeMatch = (expected: string, actual: string): boolean => {
  // split types
  var actualParts = actual.split('/')
  var expectedParts = expected.split('/')

  // invalid format
  if (actualParts.length !== 2 || expectedParts.length !== 2) {
    return false
  }

  // validate type
  if (expectedParts[0] !== '*' && expectedParts[0] !== actualParts[0]) {
    return false
  }

  // validate suffix wildcard
  if (expectedParts[1].substr(0, 2) === '*+') {
    return (
      expectedParts[1].length <= actualParts[1].length + 1 &&
      expectedParts[1].substr(1) ===
        actualParts[1].substr(1 - expectedParts[1].length)
    )
  }

  // validate subtype
  if (expectedParts[1] !== '*' && expectedParts[1] !== actualParts[1]) {
    return false
  }

  return true
}

const normalizeType = (value: string): string => {
  // parse the type
  var type = typer.parse(value)

  // remove the parameters
  // @ts-ignore
  type.parameters = undefined

  // reformat it
  return typer.format(type)
}

const tryNormalizeType = (value: string | undefined): string | null => {
  if (!value) {
    return null
  }

  try {
    return normalizeType(value)
  } catch (err) {
    return null
  }
}

const normalize = (type: string): string => {
  if (type[0] === '+') {
    // "+json" -> "*/*+json" expando
    return '*/*' + type
  }

  return type
}

export type ParseBodyOptions = {
  limit?: string | number
  strict?: boolean
  length?: number
}

const strictJSONReg = /^[\x20\x09\x0a\x0d]*(\[|\{)/

export const parseBody = async (
  req: IncomingMessage,
  options: ParseBodyOptions = {},
): Promise<any> => {
  const parse = (str: string): any => {
    if (!strict) return str ? JSON.parse(str) : str
    // strict mode always return object
    if (!str) return {}
    // strict JSON test
    if (!strictJSONReg.test(str)) {
      throw new SyntaxError('invalid JSON, only supports object and array')
    }
    return JSON.parse(str)
  }

  const len = req.headers['content-length']
  const encoding = req.headers['content-encoding'] || 'identity'
  if (len && encoding === 'identity') options.length = ~~len
  options.limit = options.limit || '1mb'
  const strict = options.strict !== false

  const str = await raw(inflate(req), { ...options, encoding: 'utf8' })
  try {
    return parse(str)
  } catch (err) {
    err.status = 400
    err.body = str
    throw err
  }
}
