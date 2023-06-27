// insert new commands here
import ping from './interactions/chat-input-command/ping'
import addproject from './interactions/chat-input-command/addproject'
import { Collection } from 'discord.js'
import edit from './interactions/context-menu-command/edit-project'

// enable this to deploy commands
const DEPLOY_COMMANDS = false

type ExecuteCallback = (interaction: any) => Promise<void>
type CommandModule = {
  data: any
  execute: ExecuteCallback
}

// enable this to deploy commands
if (DEPLOY_COMMANDS) require('./deploy-commands')

// insert new commands here
const commandModules: CommandModule[] = [ping, addproject, edit]
const commands: Collection<string, ExecuteCallback> = new Collection()

for (const commandModule of commandModules) {
  commands.set(commandModule.data.name, commandModule.execute)
}

export default commands
