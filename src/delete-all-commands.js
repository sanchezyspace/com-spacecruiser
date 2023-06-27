import config from 'dotenv'

import { REST } from '@discordjs/rest'
import { Routes } from 'discord-api-types/v9'

config()

const token = process.env.DISCORD_TOKEN
const guildId = process.env.DISCORD_GUILD_ID
const clientId = process.env.DISCORD_CLIENT_ID

const rest = new REST({ version: '9' }).setToken(token)
rest.get(Routes.applicationGuildCommands(clientId, guildId)).then((data) => {
  const promises = []
  for (const command of data) {
    const deleteUrl = `${Routes.applicationGuildCommands(clientId, guildId)}/${
      command.id
    }`
    promises.push(rest.delete(deleteUrl))
  }
  return Promise.all(promises)
})
