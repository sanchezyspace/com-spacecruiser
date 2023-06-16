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
import createProject, { createProjectPostMessage } from './utils/create-project'
import {
  createProjectPage,
  fetchProjects,
  updateProjectPage,
} from './adapters/notion-adapter'
import { Projects } from './models/projects'
import edit, { editSessionStore, editableProperties } from './commands/edit'

require('./adapters/notion-adapter')

class MyClient extends Client {
  commands?: Collection<string, Function>

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
    'Fetched projects sucsessfully.',
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

    const reply = await interaction.reply({
      content: '⏳Applying changes to the project...',
      ephemeral: true,
    })

    const inputNames = editableProperties.map((e) => e.propName)
    console.log('inputNames:', inputNames)

    const projectMessage = editSessionStore.getSession(interaction.user)
    console.log('projectMessage:', projectMessage)
    editSessionStore.endSession(interaction.user)

    if (projectMessage === undefined) {
      throw new Error('Cannot get modal session by user.')
    }

    const project: any = guildProjectsCache.getProjectByProjectMessageId(
      projectMessage.id
    )
    for (const inputName of inputNames) {
      console.log('inputName:', inputName)
      project[inputName] = interaction.fields.getTextInputValue(inputName)
      console.log('project[inputName]:', project[inputName])
    }
    console.log('project:', project)
    await updateProjectPage(project)
    console.log('project updated.')
    reply.edit('✅ Project edited successfully.')
    projectMessage.edit(createProjectPostMessage(project))
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

client.login(process.env.DISCORD_TOKEN)

export const guildProjectsCache = new Projects()

export default client
