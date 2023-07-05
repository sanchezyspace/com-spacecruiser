import {
  BaseInteraction,
  Client,
  Collection,
  Events,
  GatewayIntentBits,
  Message,
} from 'discord.js'
import 'dotenv/config'
import yargs from 'yargs'

import { fetchProjects } from './adapters/notion-adapter'
import { Projects } from './models/projects'
import { loadCommands } from './command'
import loadModalModules from './modal'

const BOT_VERSION = '1.1.0'

const args = yargs
  .command('* [options]', 'boot the spacecruiser')
  .version(BOT_VERSION)
  .options({
    'deploy-commands': {
      type: 'boolean',
      describe: 'deploy commands to discord',
      demandOption: true,
      default: false,
      alias: 'd',
    },
  })
  .parseSync()

const DEPLOY_COMMANDS_MODE = args['deploy-commands']
let modalModules: Map<string, (interaction: any) => Promise<void>> = new Map()

type ExecuteCallback = (interaction: any) => Promise<void>
class MyClient extends Client {
  commands?: Collection<string, ExecuteCallback>

  constructor(options: any) {
    super(options)
  }
}

const client = new MyClient({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
  ],
})

client.once(Events.ClientReady, async (c: Client) => {
  console.log('✅ Logged in as ' + c.user?.tag + '\n')

  console.log('⏳ Loading command modules...')
  client.commands = await loadCommands()
  console.log('✅ Command modules loaded successfully.\n')

  console.log('⏳ Loading modal modules...')
  modalModules = await loadModalModules()
  console.log('✅ Modal modules loaded successfully.\n')

  console.log('⏳ Fetching projects...')
  await guildProjectsCache.fetchProjects()
  console.log(
    '✅ Fetched projects successfully.',
    guildProjectsCache.projects.length,
    'projects found.\n'
  )

  console.log('🚀 Spacecruiser is ready to launch!\n')
})

client.on(Events.InteractionCreate, async (interaction: BaseInteraction) => {
  // 起動時に登録されたスラッシュコマンドを呼び出す
  if (interaction.isChatInputCommand()) {
    if (!client.commands) {
      console.error(`Commands are not loaded.`)
      return
    }
    // await interaction.deferReply()
    const executeCommand = client.commands.get(interaction.commandName)
    if (!executeCommand) {
      console.error(`No command matching ${interaction.commandName} was found.`)
      return
    }

    try {
      await executeCommand(interaction)
    } catch (error) {
      console.error(error)
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: 'There was an error while executing this command!',
          ephemeral: true,
        })
      } else {
        await interaction.reply({
          content: 'There was an error while executing this command!',
          ephemeral: true,
        })
      }
    }
  }

  // 起動時に登録されたスラッシュコマンドを呼び出す
  if (interaction.isMessageContextMenuCommand()) {
    // interaction.deferReply()
    if (!client.commands) {
      console.error(`Commands are not loaded.`)
      return
    }
    const executeCommand = client.commands.get(interaction.commandName)
    if (!executeCommand) {
      console.error(`No command matching ${interaction.commandName} was found.`)
      return
    }
    try {
      await executeCommand(interaction)
    } catch (error) {
      console.error(error)
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: 'There was an error while executing this command!',
          ephemeral: true,
        })
      } else {
        await interaction.reply({
          content: 'There was an error while executing this command!',
          ephemeral: true,
        })
      }
    }
  }
})

// モーダル送信時の処理
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isModalSubmit()) return
  const callback = modalModules.get(interaction.customId)

  if (callback) {
    await callback(interaction)
  } else {
    console.log('No callback found for modal ID: ' + interaction.customId)
    await interaction.reply({
      content: '❌ An error occurred while processing the modal submission.',
      ephemeral: true,
    })
  }
})

client.on(Events.MessageCreate, async (message: Message) => {
  // console.log('Message received: ' + message.content)
  if (message.content === 'ping') {
    await message.reply('Pong!')
    const projects = await fetchProjects()
    console.log(projects)
  }
})

if (DEPLOY_COMMANDS_MODE) {
  console.log('⏳ Deploying commands...')
  import('./deploy-commands')
} else {
  console.log('⏳ Booting spacecruiser...')
  client.login(process.env.DISCORD_TOKEN)
}

export const guildProjectsCache = new Projects()

export default client
