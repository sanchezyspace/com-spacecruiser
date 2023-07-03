import { BaseInteraction, SlashCommandBuilder } from 'discord.js'

export default {
  data: new SlashCommandBuilder()
    .setName('play-ito')
    .setDescription('itoをオンラインでプレイ(違法)'),

  execute: async (interaction: BaseInteraction) => {
    console.log('ikisugi')
    if (interaction.isChatInputCommand()) {
      const testreturn = await interaction.reply('Wubba Lubba dub-dub')
      //console.log(testreturn)
      testreturn.edit("ここに変更内容を記述")
    }
  },
}
