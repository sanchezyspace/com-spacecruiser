import { BaseInteraction, SlashCommandBuilder } from 'discord.js'

export default {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with Pong!'),

  execute: async (interaction: BaseInteraction) => {
    if (interaction.isChatInputCommand()) {
      interaction.reply('Pongoe!')
    }
  },
}
