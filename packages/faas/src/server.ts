import { createServer, RequestListener, IncomingMessage, ServerResponse } from 'http'
import typeis from 'type-is'
import parseBody, { Options as BodyOptions } from 'co-body'
import { LoggerOptions, LoggerEvent, createLogger } from './logger'
import type { JsonType } from 'farrow-schema'

export type ServerOptions = {
  logger?: boolean | LoggerOptions
}
export type RequestHandler = (req: IncomingMessage, res: ServerResponse) => JsonType | Promise<JsonType>
export const createHttpServer = (handleRequest: RequestListener, options?: ServerOptions) => {
  const isNotProduction = process.env.NODE_ENV !== 'production'
  const config: ServerOptions = {
    logger: isNotProduction,
    ...options,
  }

  const loggerOptions: LoggerOptions = !config.logger || typeof config.logger === 'boolean' ? {} : config.logger

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
        logger?.logOutput(method, url, res.statusCode, startTime, contentLength || getContentLength(res), event)
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

  const server = createServer(handle)

  return server
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

const jsonTypes = ['json', 'application/*+json', 'application/csp-report']
const formTypes = ['urlencoded']
const textTypes = ['text']

export const getBody = async (req: IncomingMessage, options?: BodyOptions) => {
  const type = typeis(req, jsonTypes) || typeis(req, formTypes) || typeis(req, textTypes)

  if (type) {
    const body = await parseBody(req, options)
    return body
  }

  return null
}

export const handleBasenames = <T extends { pathname: string }>(basenames: string[], requestInfo: T) => {
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
