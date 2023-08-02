import fs from 'fs'
import path from 'path'
import {
  Collection,
  ContextMenuCommandBuilder,
  SlashCommandBuilder,
} from 'discord.js'

const DEPLOY_COMMANDS = false

type ExecuteCallback = (interaction: any) => Promise<void>
type CommandModule = {
  default: {
    data: SlashCommandBuilder | ContextMenuCommandBuilder
    execute: ExecuteCallback
  }
}

// enable this to deploy commands
if (DEPLOY_COMMANDS) require('./deploy-commands')

// list of directories to search for command files
const commandDirs = [
  './interactions/chat-input-command',
  './interactions/context-menu-command',
]

const commandModules: CommandModule[] = []

export const loadCommands = async (): Promise<
  Collection<string, ExecuteCallback>
> => {
  for (const dir of commandDirs) {
    const commandFiles = fs
      .readdirSync(path.resolve(__dirname, dir))
      .filter((file) => file.endsWith('.ts') || file.endsWith('.js'))

    for (const file of commandFiles) {
      console.log(`Loading command file: ${file}`)
      const command: CommandModule = await import(`./${dir}/${file}`)
      commandModules.push(command)
    }
  }

  const commands: Collection<string, ExecuteCallback> = new Collection()

  for (const commandModule of commandModules) {
    if (commandModule.default.data instanceof SlashCommandBuilder) {
      console.log(
        `Registering slash command: /${commandModule.default.data.name}`
      )
    } else if (
      commandModule.default.data instanceof ContextMenuCommandBuilder
    ) {
      console.log(
        `Registering context menu command: ${commandModule.default.data.name}`
      )
    }
    commands.set(commandModule.default.data.name, commandModule.default.execute)
  }
  return commands
}
