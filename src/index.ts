/* eslint-disable @typescript-eslint/no-extra-semi */
import {
  BaseInteraction,
  Client,
  Collection,
  Events,
  GatewayIntentBits,
  Message,
} from 'discord.js'
import 'dotenv/config'

import commands from './command'
import createProject from './utils/create-project'
import { fetchProjects } from './adapters/notion-adapter'
import { Projects } from './models/projects'
import { editProject } from './interactions/modal/edit-project'

import yargs from 'yargs'

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

require('./adapters/notion-adapter')

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
  if (client.commands) {
    for (const command of client.commands) {
      console.log('Registering command: ' + command[0])
    }
  }
  console.log('Ready! Logged in as ' + c.user?.tag)
  console.log('Fetching projects...')
  await guildProjectsCache.fetchProjects()
  console.log(
    'Fetched projects successfully.',
    guildProjectsCache.projects.length,
    'projects found.'
  )
})

client.on(Events.InteractionCreate, async (interaction: BaseInteraction) => {
  if (interaction.isChatInputCommand()) {
    // await interaction.deferReply()
    const executeCommand = commands.get(interaction.commandName)
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

  if (interaction.isMessageContextMenuCommand()) {
    // interaction.deferReply()
    const executeCommand = commands.get(interaction.commandName)
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

// respond to modal submit
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isModalSubmit()) return

  // add project command of ./commands/addproject.ts
  if (interaction.customId === 'addprojectModal') {
    const projectId = interaction.fields.getTextInputValue('projectIdInput')

    const message = await interaction.reply({
      content: 'Creating new project...',
    })

    createProject({
      projectId: projectId,
      interaction: message,
    })
  }

  if (interaction.customId === 'editProjectModal') {
    console.log('interaction:', interaction)
    await editProject(interaction)
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
  ;(async () => {
    console.log('Deploying commands...')
    await require('./deploy-commands')
  })()
} else {
  console.log('Booting spacecruiser...')
  client.login(process.env.DISCORD_TOKEN)
}

export const guildProjectsCache = new Projects()

export default client
