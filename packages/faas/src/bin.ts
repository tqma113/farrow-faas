import { Command } from 'commander'
import chalk from 'chalk'
import leven from 'leven'
import { dev } from './scripts/dev'
import { bundle } from './scripts/bundle'
import { start } from './scripts/start'
import { genRoutes } from './scripts/genRoutes'

const program = new Command()

export type DevScriptOptions = {
  dir?: string
  entry?: string
}
program
  .command('dev')
  .description(`start development mode at ${process.cwd()}`)
  .option('-d, --dir <dir>', 'root path')
  .option('-e, --entry <entry>', 'routes file path')
  .action((options: DevScriptOptions) => {
    dev(options)
  })

export type BundleScriptOptions = {
  dir?: string
  output?: string
  entry?: string
  port?: string
}
program
  .command('bundle')
  .description(`bundle all functions at ${process.cwd()}`)
  .option('-d, --dir <dir>', 'root path')
  .option('-o, --output <output>', 'output path')
  .option('-e, --entry <entry>', 'entry routes file path')
  .option('-p, --port <port>', 'listen port')
  .action((options: BundleScriptOptions) => {
    bundle(options)
  })

export type StartScriptOptions = {
  dir?: string
  entry?: string
}
program
  .command('start')
  .description(`start development mode at ${process.cwd()}`)
  .option('-d, --dir <dir>', 'bundle path')
  .option('-e, --entry <entry>', 'entry routes file path')
  .action((options: StartScriptOptions) => {
    start(options)
  })

export type GenerateScriptOptions = {
  dir?: string
}
program
  .command('generate')
  .description(`generate entry routes file at ${process.cwd()}`)
  .option('-d, --dir <dir>', 'root path')
  .action((options: GenerateScriptOptions) => {
    genRoutes(options)
  })
program.arguments('<command>').action((cmd) => {
  program.outputHelp()
  console.log(`  ` + chalk.red(`Unknown command ${chalk.yellow(cmd)}.`))
  console.log()
  suggestCommands(cmd)
})

program.on('--help', () => {
  console.log('')
  console.log('Example call:')
})

program.parse(process.argv)

if (!process.argv.slice(2).length) {
  program.outputHelp()
}

function suggestCommands(unknownCommand: string) {
  const availableCommands = program.commands.map((cmd) => cmd.name())

  let suggestion: string | undefined = undefined

  availableCommands.forEach((cmd) => {
    const isBestMatch =
      leven(cmd, unknownCommand) < leven(suggestion || '', unknownCommand)
    if (leven(cmd, unknownCommand) < 3 && isBestMatch) {
      suggestion = cmd
    }
  })

  if (suggestion) {
    console.log(`  ` + chalk.red(`Did you mean ${chalk.yellow(suggestion)}?`))
  }
}
