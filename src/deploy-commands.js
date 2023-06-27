/* eslint-disable @typescript-eslint/no-extra-semi */
/* eslint-disable @typescript-eslint/no-var-requires */
const { REST, Routes } = require('discord.js')
const fs = require('node:fs')
const path = require('node:path')

require('dotenv').config()
const token = process.env.DISCORD_TOKEN
const guildId = process.env.DISCORD_GUILD_ID
const clientId = process.env.DISCORD_CLIENT_ID

const commands = []
const rest = new REST().setToken(token)

// Grab all the command files from the commands directory you created earlier
const chatInputCommandsPath = path.join(
  __dirname,
  './interactions/chat-input-command'
)
const contextMenuCommandsPath = path.join(
  __dirname,
  './interactions/context-menu-command'
)
const chatInputCommandFiles = fs
  .readdirSync(chatInputCommandsPath)
  .filter((file) => file.endsWith('.ts') || file.endsWith('.js'))
const contextMenuCommandFiles = fs
  .readdirSync(contextMenuCommandsPath)
  .filter((file) => file.endsWith('.ts') || file.endsWith('.js'))

const commandFiles = [
  ...chatInputCommandFiles.map((filePath) =>
    path.join(chatInputCommandsPath, filePath)
  ),
  ...contextMenuCommandFiles.map((filePath) =>
    path.join(contextMenuCommandsPath, filePath)
  ),
]

console.log(commandFiles)
// Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
for (const filePath of commandFiles) {
  const command = require(filePath).default
  // console.log(command)
  if ('data' in command && 'execute' in command) {
    commands.push(command.data.toJSON())
  } else {
    console.log(
      `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
    )
  }
}

;(async () => {
  try {
    console.log(
      `Started refreshing ${commands.length} application (/) commands.`
    )

    // The put method is used to fully refresh all commands in the guild with the current set
    const data = await rest.put(
      Routes.applicationGuildCommands(clientId, guildId),
      { body: commands }
    )

    console.log(
      `Successfully reloaded ${data.length} application (/) commands.`
    )
  } catch (error) {
    // And of course, make sure you catch and log any errors!
    console.error(error)
  }
})()
