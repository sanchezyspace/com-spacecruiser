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


client.on(Events.MessageCreate, async (message: Message) => {
  console.log('Message received: ' + message.content)
  if (message.content === 'ping') {
    await message.reply('Pong!')
  }
})

client.login(process.env.DISCORD_TOKEN)

export default client
