import client, { guildProjectsCache } from '..'
import 'dotenv/config'
import {
  ChannelType,
  InteractionResponse,
  ModalSubmitInteraction,
  channelMention,
  messageLink,
} from 'discord.js'
import {
  createProjectPage,
  fetchUniqueId,
  updateProjectPage,
} from '../adapters/notion-adapter'
import { Logger } from './logger'
import { Project } from '../models/project'
import { ProgressReply } from './progress-reply'
import { env } from 'process'

type Props = {
  projectId: string
  interaction: InteractionResponse
}

export default async (props: Props) => {
  const { projectId: projectName } = props
  const interaction = props.interaction.interaction as ModalSubmitInteraction

  const logger = new Logger(projectName)
  const project = new Project()
  const progressReply = new ProgressReply(props.interaction)

  logger.log('Project creation requested:', projectName)

  if (process.env.DISCORD_GUILD_ID === undefined) {
    throw new Error('Define DISCORD_GUILD_ID in .env file')
  }
  if (process.env.DISCORD_PROJECT_CATEGORY_ID === undefined) {
    throw new Error('Define DISCORD_PROJECT_CATEGORY_ID in .env file')
  }
  if (process.env.DISCORD_PROJECTS_CHANNEL_ID === undefined) {
    throw new Error('Define DISCORD_PROJECTS_CHANNEL_ID in .env file')
  }
  if (projectName === '') {
    throw new Error('Project ID is empty')
  }

  project.name = projectName
  project.discordProposerUserId = interaction.user.id

  const guild = client.guilds.cache.get(process.env.DISCORD_GUILD_ID)

  // create channel
  await progressReply.addProgress('⏳ Creating a channel...')
  const channel = await guild?.channels.create({
    name: project.name,
    type: ChannelType.GuildForum,
    parent: process.env.DISCORD_PROJECT_CATEGORY_ID,
  })
  await progressReply.updateProgress(
    '✅ Project channel has been created!\n👉 ' +
      (channel?.id === undefined
        ? `#${project.name}`
        : channelMention(channel?.id as string))
  )
  project.discordChannelId = channel?.id
  logger.log('Project channel has been generated:', channel?.id)

  // create posts
  const overviewMessage = createProjectPostMessage(project)
  const defaultPosts = [
    { type: 'overview', name: '📌 overview', message: 'プロジェクトの概要' },
    { type: 'random', name: '🌴 random', message: 'プロジェクトに関する雑談' },
    { type: 'progress', name: '🚀 progress', message: '進捗報告チャンネル' },
  ]
  await progressReply.addProgress('⏳ Creating posts...')
  for (const [key, post] of Object.entries(defaultPosts)) {
    await progressReply.updateProgress(
      `⏳ Preparing ${post.name} (${key} / ${defaultPosts.length})...`
    )
    const thread = await channel?.threads.create({
      name: post.name,
      message: {
        content: post.message,
      },
    })

    if (post.type === 'overview') {
      await thread?.pin()
      await thread?.send(overviewMessage)
    }
  }
  await progressReply.updateProgress(
    `✅ Default chat rooms are perfectly prepared!`
  )
  logger.log('Default posts has been created')

  // create notion page
  await progressReply.addProgress('⏳ Creating Notion page...')
  const notionPage = await createProjectPage(project)
  await progressReply.updateProgress(
    '✅ Generated brand-new project page in Notion! \n👉 ' + notionPage.url
  )
  project.notionPageId = notionPage.id
  logger.log('Project page was successfully created:', notionPage.url)

  // fetch unique id
  logger.log('Fetching Project Unique ID...')
  project.id = (await fetchUniqueId(project.notionPageId)) ?? undefined
  logger.log('Project Unique ID fetched as', project.id)

  // add project post to #projects channel
  await progressReply.addProgress(
    '⏳ Adding project post to #projects channel...'
  )
  const projectsChannel = await guild?.channels.fetch(
    process.env.DISCORD_PROJECTS_CHANNEL_ID as string
  )
  const projectPostMessage = createProjectPostMessage(project)
  if (projectsChannel?.isTextBased()) {
    const message = await projectsChannel.send(projectPostMessage)
    project.discordProjectMessageId = message.id
  } else {
    throw new Error('projectsChannel is not text-based channel')
  }
  await progressReply.updateProgress(
    '✅ Project is now introduced in ' +
      channelMention(projectsChannel?.id as string) +
      ' channel!'
  )

  // update notion properties
  await progressReply.addProgress('⏳ Updating project properties...')
  logger.log('Updating project page...')
  const updatedProject = await updateProjectPage(project)
  logger.log('updatedProjects:', updatedProject)
  await progressReply.updateProgress('✅ Project properties are updated!')

  // done
  await progressReply.addProgress('🎉 You are all set!')
  await progressReply.addProgress(
    '💡 You can edit your project by selecting `Apps > Edit Project` from the context menu of project information\n👉 ' +
      messageLink(
        process.env.DISCORD_PROJECTS_CHANNEL_ID,
        project.discordProjectMessageId
      )
  )
  logger.log('Project creation completed:', projectName)

  guildProjectsCache.fetchProjects()

  return true
}

export const createProjectPostMessage = (project: Project) => {
  // console.log('cppm', project)

  const projectId = project.id ? '#' + project.id : ''
  const headingText =
    projectId +
    ' ' +
    (project.displayTitle ? project.displayTitle : project.name)

  const message =
    `\n#  ${headingText}` +
    (project.description ? `\n${project.description}` : '') +
    (project.name ? `\n### リポジトリ名\n${project.name}` : '') +
    (project.discordChannelId
      ? `\n### チャンネル\n<#${project.discordChannelId}>`
      : '') +
    (project.notionUrl ? `\n### Notion\n${project.notionUrl}` : '') +
    (project.githubUrl ? `\n### GitHub\n${project.githubUrl}` : '') +
    (project.githubUrl != null && project.techStacks?.length != 0
      ? `\n### 技術スタック\n${project.techStacks
          ?.map((e) => `\`${e}\``)
          ?.join(', ')}`
      : '') +
    (project.incomeSource ? `\n### 収入源\n${project.incomeSource}` : '') +
    (project.discordProposerUserId
      ? `\n### 提案者\n<@${project.discordProposerUserId}>`
      : '')

  return message
}
