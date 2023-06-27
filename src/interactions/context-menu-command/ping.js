import { SlashCommandBuilder } from 'discord.js'

export default {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with Pong!'),

  execute: async (interaction) => {
    if (interaction.isMessageContextMenuCommand()) {
      interaction.reply('Pongoe!')
    }
  },
}
