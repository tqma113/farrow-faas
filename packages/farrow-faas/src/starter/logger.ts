import util from 'util'
import bytes from 'bytes'
import type { IncomingMessage } from 'http'

const colorCodes = {
  7: 'magenta' as const,
  5: 'red' as const,
  4: 'yellow' as const,
  3: 'cyan' as const,
  2: 'green' as const,
  1: 'green' as const,
  0: 'yellow' as const,
}

export type LoggerArgs = {
  requestInfo: IncomingMessage
}

export type LoggerOptions = {
  transporter?: (str: string) => void
}

export type LoggerEvent = 'error' | 'close' | 'finish'

export const createLogger = (options?: LoggerOptions) => {
  const config: Required<LoggerOptions> = {
    transporter: (str) => console.log(str),
    ...options,
  }

  const { transporter } = config

  const print = (format: string, ...args: (string | number)[]) => {
    const string = util.format(format, ...args)
    transporter(string)
  }

  const logInput = (method: string, url: string) => {
    print(`  <-- %s %s`, method, url)
  }

  const logOutput = (
    method: string,
    url: string,
    status: number,
    startTime: number,
    contentLength: number,
    event: LoggerEvent,
  ) => {
    const length = [204, 205, 304].includes(status)
      ? ''
      : contentLength
      ? bytes(contentLength)
      : '-'
    const upstream =
      event === 'error' ? 'xxx' : event === 'close' ? '-x-' : '-->'

    print(
      `  ${upstream} %s %s %s %s`,
      method,
      url,
      status,
      prettyTime(startTime),
      length,
    )
  }

  return {
    print,
    logInput,
    logOutput,
  }
}

export type PrettyNumberOptions = {
  delimiter?: string
  separator?: string
}
export const defaultPrettyNumberOptions: Required<PrettyNumberOptions> = {
  delimiter: ',',
  separator: '.',
}

export const prettyNumber = function (
  number: number | string,
  options?: PrettyNumberOptions,
) {
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
  return prettyNumber(
    delta < 10000 ? `${delta}ms` : `${Math.round(delta / 1000)}s`,
  )
}
