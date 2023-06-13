// insert new commands here
import { Collection } from 'discord.js'

// enable this to deploy commands
const DEPLOY_COMMANDS = false

type CommandModule = {
  data: any
  execute: Function
}

// enable this to deploy commands
if (DEPLOY_COMMANDS) require('./deploy-commands')

// insert new commands here
const commandModules: CommandModule[] = [ping, addproject]
const commands: Collection<string, Function> = new Collection()

for (const commandModule of commandModules) {
  commands.set(commandModule.data.name, commandModule.execute)
}

export default commands
