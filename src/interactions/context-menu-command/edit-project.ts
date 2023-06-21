import {
  ActionRowBuilder,
  ApplicationCommandType,
  ContextMenuCommandBuilder,
  Interaction,
  Message,
  ModalActionRowComponentBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  User,
  channelMention,
} from 'discord.js'
import { guildProjectsCache } from '../..'

export class EditSessionStore {
  private sessions: Map<string, Message>

  constructor() {
    this.sessions = new Map()
  }

  startSession(user: User, message: Message) {
    this.sessions.set(user.id, message)
  }

  getSession(user: User): Message | undefined {
    return this.sessions.get(user.id)
  }

  endSession(user: User) {
    this.sessions.delete(user.id)
  }
}

export const editSessionStore = new EditSessionStore()

export const editableProperties = [
  {
    label: 'Project ID (channel/repo name)?',
    propName: 'name',
    placeHolder: 'e.g. ind-tw-bookmark-webext',
    type: TextInputStyle.Short,
    required: true,
  },
  {
    label: 'Title',
    propName: 'displayTitle',
    placeHolder: 'e.g. Twitter Bookmark フォルダ分けブラウザ拡張',
    type: TextInputStyle.Paragraph,
    required: false,
  },
  {
    label: 'Description',
    propName: 'description',
    placeHolder:
      'ツイートURL、本文、メタ情報、メディアURLを保管し、タグ or フォルダ分けで整理できるWebアプリ',
    type: TextInputStyle.Paragraph,
    required: false,
  },
  {
    label: 'GitHub URL',
    propName: 'githubUrl',
    placeHolder: '',
    type: TextInputStyle.Short,
    required: false,
  },
  {
    label: 'Income Source',
    propName: 'incomeSource',
    placeHolder: 'フリーミアム、広告、寄付、その他',
    type: TextInputStyle.Paragraph,
    required: false,
  },
  // {
  //   label: 'Channel ID',
  //   propName: 'discordChannelId',
  //   placeHolder: '',
  //   type: TextInputStyle.Paragraph,
  //   required: false,
  // },
  // {
  //   label: 'Project Message ID',
  //   propName: '',
  //   placeHolder: '',
  //   type: TextInputStyle.Paragraph,
  //   required: false,
  // },
  // {
  //   label: 'Idea Message ID',
  //   propName: '',
  //   placeHolder: '',
  //   type: TextInputStyle.Paragraph,
  //   required: false,
  // },
  // {
  //   label: 'Proposer User ID',
  //   propName: 'discordProposerUserId',
  //   placeHolder: 'e.g. 299712742019956748',
  //   type: TextInputStyle.Paragraph,
  //   required: false,
  // },
]

export default {
  data: new ContextMenuCommandBuilder()
    .setName('Edit Project')
    .setType(ApplicationCommandType.Message),

  execute: async (interaction: Interaction) => {
    if (interaction.isMessageContextMenuCommand()) {
      // const reply = await interaction.reply(
      //   '⏳ Fetching projects from notion...'
      // )

      // 3秒のタイムアウトに引っかかりやすいのでスキップ
      // await guildProjectsCache.fetchProjects()
      const project = guildProjectsCache.getProjectByProjectMessageId(
        interaction.targetMessage.id
      ) as any
      console.log(project)
      if (project === undefined) {
        await interaction.reply(
          '❌ This message was not bind to any project.\n💡Try again on the posts of ' +
            channelMention(process.env.DISCORD_PROJECTS_CHANNEL_ID as string) +
            ' channel.'
        )
        return
      }

      editSessionStore.startSession(interaction.user, interaction.targetMessage)

      // await reply.edit(
      //   '✅ Projects are up to date. \nEdit project on shown modal.'
      // )

      const modal = new ModalBuilder()
        .setCustomId('editProjectModal')
        .setTitle('Edit Project')

      const textInputs = []

      for (const element of editableProperties) {
        console.log(element)
        textInputs.push(
          new TextInputBuilder()
            .setCustomId(element.propName)
            .setLabel(element.label)
            .setPlaceholder(element.placeHolder)
            .setValue(project[element.propName] ?? '')
            .setStyle(element.type)
            .setRequired(element.required)
        )
      }

      const actionRows = textInputs.map((e) => {
        return new ActionRowBuilder().addComponents(e)
      }) as ActionRowBuilder<ModalActionRowComponentBuilder>[]

      modal.addComponents(actionRows)

      console.log('Edit project modal sent to ' + interaction.user.id)
      await interaction.showModal(modal)
    }
  },
}
