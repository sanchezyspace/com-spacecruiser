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

client.once(Events.ClientReady, (c: Client) => {
  if (client.commands) {
    for (const command of client.commands) {
      console.log('Registering command: ' + command[0])
    }
  }
  console.log('Ready! Logged in as ' + c.user?.tag)
})

client.on(Events.InteractionCreate, async (interaction: BaseInteraction) => {
  if (!interaction.isChatInputCommand()) return

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
})

// respond to modal submit
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isModalSubmit()) return

  // add project command of ./commands/addproject.ts
  if (interaction.customId === 'addprojectModal') {
    const projectId = interaction.fields.getTextInputValue('projectIdInput')
    const projectDesc = interaction.fields.getTextInputValue('projectDescInput')
    const githubUrl = interaction.fields.getTextInputValue('githubUrlInput')

    const message = await interaction.reply({
      content: 'Creating new project...',
    })

    createProject({
      projectId: projectId,
      projectDesc: projectDesc,
      githubUrl: githubUrl,
      interaction: message
    })
  }
})

client.on(Events.MessageCreate, async (message: Message) => {
  // console.log('Message received: ' + message.content)
  if (message.content === 'ping') {
    await message.reply('Pong!')
  }
})

client.login(process.env.DISCORD_TOKEN)

export default client
