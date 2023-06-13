import { type } from 'os'
import client from '..'
import 'dotenv/config'
import {
  ChannelType,
  ForumChannel,
  InteractionResponse,
  channelMention,
} from 'discord.js'
import { createProjectPage } from '../adapters/notion-adapter'
import { Logger } from './logger'

type Props = {
  projectId: string
  projectDesc: string
  githubUrl: string
  interaction: InteractionResponse
}

let progressMessage = ''

const addProgress = async (
  interaction: InteractionResponse,
  newLine: string
) => {
  progressMessage = progressMessage + '\n' + newLine
  await interaction.edit(progressMessage)
}

const updateProgress = async (
  interaction: InteractionResponse,
  newLine: string
) => {
  const latestLines = progressMessage.split('\n') as string[]
  latestLines.pop()
  latestLines.push(newLine)
  progressMessage = latestLines.join('\n')
  await interaction.edit(progressMessage)
}

const getOverviewText = (
  projectId: string,
  description: string,
  githubUrl: string
) => {
  return `
# ${projectId}
\`概要\`
${description}

\`GitHub\`
${githubUrl}
`
}

export default async (props: Props) => {
  const { projectId, projectDesc, githubUrl } = props
  progressMessage = ''
  const logger = new Logger(projectId)

  logger.log('Project creation requested:', projectId)

  if (process.env.DISCORD_GUILD_ID === undefined) {
    throw new Error('Define DISCORD_GUILD_ID in .env file')
  }
  if (process.env.DISCORD_PROJECT_CATEGORY_ID === undefined) {
    throw new Error('Define DISCORD_PROJECT_CATEGORY_ID in .env file')
  }
  if (projectId === '') {
    throw new Error('Project ID is empty')
  }

  const guild = client.guilds.cache.get(process.env.DISCORD_GUILD_ID)

  // create channel
  await addProgress(props.interaction, '⏳ Creating a channel...')
  const channel = await guild?.channels.create({
    name: projectId,
    type: ChannelType.GuildForum,
    parent: process.env.DISCORD_PROJECT_CATEGORY_ID,
  })
  await updateProgress(
    props.interaction,
    '✅ Project channel has been created!\n👉 ' +
      (channel?.id === undefined
        ? `#${props.projectId}`
        : channelMention(channel?.id as string))
  )
  logger.log('Project channel has been generated:', channel?.id)

  // create posts
  const overviewMessage = getOverviewText(projectId, projectDesc, githubUrl)
  const defaultPosts = [
    { type: 'overview', name: '📌 overview', message: 'プロジェクトの概要' },
    { type: 'random', name: '🌴 random', message: 'プロジェクトに関する雑談' },
    { type: 'progress', name: '🚀 progress', message: '進捗報告チャンネル' },
  ]
  await addProgress(props.interaction, '⏳ Creating posts...')
  for (const [key, post] of Object.entries(defaultPosts)) {
    await updateProgress(
      props.interaction,
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
  await updateProgress(props.interaction, `✅ Default chat rooms are perfectly prepared!`)
  logger.log('Default posts has been created')


  // create notion page
  await addProgress(props.interaction, '⏳ Creating Notion page...')
  const notionPage = await createProjectPage({
    projectId,
    projectDesc,
    githubUrl,
  })

  await updateProgress(
    props.interaction,
    '✅ Generated brand-new project page in Notion! \n👉 ' + notionPage.url
  )

  logger.log('Project page was successfully created:', notionPage.url)


  await addProgress(props.interaction, '🎉 You are all set!')
  logger.log('Project creation completed:', projectId)
  return true
}
