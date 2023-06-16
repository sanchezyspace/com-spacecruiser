// insert new commands here
import ping from './commands/ping'
import addproject from './commands/addproject'
import { Collection } from 'discord.js'
import edit from './commands/edit'

// enable this to deploy commands
const DEPLOY_COMMANDS = false

type CommandModule = {
  data: any
  execute: Function
}

// enable this to deploy commands
if (DEPLOY_COMMANDS) require('./deploy-commands')

// insert new commands here
const commandModules: CommandModule[] = [ping, addproject, edit]
const commands: Collection<string, Function> = new Collection()

for (const commandModule of commandModules) {
  commands.set(commandModule.data.name, commandModule.execute)
}

export default commands
