import {
  ActionRowBuilder,
  ChatInputCommandInteraction,
  TextInputStyle,
} from 'discord.js'
import { ModalBuilder, SlashCommandBuilder, TextInputBuilder } from 'discord.js'

export default {
  data: new SlashCommandBuilder()
    .setName('addproject')
    .setDescription('Create new channel and Notion page for your project.'),

  execute: async (interaction: ChatInputCommandInteraction) => {
    const modal = new ModalBuilder()
      .setCustomId('addProjectModal')
      .setTitle('Create New Project')

    const projectIdInput = new TextInputBuilder()
      .setCustomId('projectIdInput')
      .setLabel('Project ID (channel name)?')
      .setPlaceholder('e.g. ind-tw-bookmark-webext')
      .setStyle(TextInputStyle.Short)
      .setRequired(true)

    // const projectDescInput = new TextInputBuilder()
    //   .setCustomId('projectDescInput')
    //   .setLabel('Project Description? (optional)')
    //   .setPlaceholder('e.g. A browser extension to bookmark tweets')
    //   .setStyle(TextInputStyle.Paragraph)
    //   .setRequired(false)

    // const githubUrlInput = new TextInputBuilder()
    //   .setCustomId('githubUrlInput')
    //   .setLabel('Github URL? (optional)')
    //   .setStyle(TextInputStyle.Short)
    //   .setRequired(false)

    const actionRows = [
      new ActionRowBuilder().addComponents(projectIdInput),
      // new ActionRowBuilder().addComponents(projectDescInput),
      // new ActionRowBuilder().addComponents(githubUrlInput),
    ] as Array<ActionRowBuilder<any>>

    modal.addComponents(actionRows)

    console.log('Create new project modal sent to ' + interaction.user.id)
    await interaction.showModal(modal)
  },
}
