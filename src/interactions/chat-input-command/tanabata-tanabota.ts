import {
  BaseInteraction,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from 'discord.js'

export default {
  data: new SlashCommandBuilder()
    .setName('tanabata')
    .setDescription('お願いごと しよう！')
    .addStringOption(
      (
        negaiInput //スラッシュコマンドに
      ) =>
        negaiInput
          .setName('願い')
          .setDescription('願い事をどうぞ')
          .setRequired(true)
    )
    .addBooleanOption((tokumei) =>
      tokumei
        .setName('匿名')
        .setDescription('匿名で書き込む?')
        .setRequired(false)
    ),
  execute: async (interaction: ChatInputCommandInteraction) => {
    interaction.reply({
      content: '叶うわけないやろがい' + interaction.options.getString('願い'),
      ephemeral: true,
    })
  },
}
