import { Client } from '@notionhq/client'
import {
  PageObjectResponse
} from '@notionhq/client/build/src/api-endpoints'
import {
  heading1,
  paragraph,
} from '@sota1235/notion-sdk-js-helper/dist/blockObjects'
import { Project } from '../models/project'

// Initializing a client
export const notion = new Client({
  auth: process.env.NOTION_TOKEN,
})

const databaseId = process.env.NOTION_PROJECTS_DATABASE_ID as string

export const createProjectPage = async (project: Project) => {
  const h1Content = project.displayTitle ? project.displayTitle : project.name
  if (!h1Content) {
    throw new Error('No title provided (' + project.notionPageId + ')')
  }

  const pageBody = [heading1(h1Content), paragraph(project.description ?? '')]

  const response = (await notion.pages.create({
    icon: {
      type: 'emoji',
      emoji: '🆕',
    },
    parent: {
      type: 'database_id',
      database_id: databaseId,
    },
    properties: {
      Name: {
        title: [
          {
            text: {
              content: project.displayTitle
                ? project.displayTitle
                : (project.name as string),
            },
          },
        ],
      },
      'Project Name': {
        rich_text: [
          {
            type: 'text',
            text: {
              content: project.name as string,
            },
          },
        ],
      },
    },
    children: pageBody,
  })) as PageObjectResponse
  return response
}

export async function fetchUniqueId(pageId: string): Promise<number | null> {
  try {
    for (let i = 0; i < 4; i++) {
      const response = (await notion.pages.retrieve({ page_id: pageId })) as any
      const uniqueId = response.properties['ID']?.unique_id.number
      if (uniqueId) {
        return uniqueId
      }
    }
    throw new Error('Failed to fetch unique id (retry limit exceeded)')
  } catch (e) {
    console.log(e)
    return null
  }
}

export async function updateProjectPage(project: Project) {
  if (project.notionPageId === undefined) {
    throw new Error('No notion page id defined')
  }

  const notionProps = {} as any

  if (project.displayTitle !== undefined) {
    notionProps['Name'] = {
      title: [{ text: { content: project.displayTitle } }],
    }
  }

  if (project.name !== undefined) {
    notionProps['Project Name'] = {
      rich_text: [{ type: 'text', text: { content: project.name } }],
    }
  }

  if (project.description !== undefined) {
    notionProps['Description'] = {
      rich_text: [{ type: 'text', text: { content: project.description } }],
    }
  }

  if (project.githubUrl !== undefined) {
    notionProps['GitHub URL'] = {
      url: project.githubUrl,
    }
  }

  if (project.techStacks !== undefined) {
    notionProps['Tech Stacks'] = {
      multi_select: {
        options: project.techStacks.map((techStack) => {
          return { name: techStack }
        }),
      },
    }
  }

  if (project.incomeSource !== undefined) {
    notionProps['Income Source'] = {
      rich_text: [{ type: 'text', text: { content: project.incomeSource } }],
    }
  }

  if (project.discordChannelId !== undefined) {
    notionProps['Channel ID'] = {
      rich_text: [
        { type: 'text', text: { content: project.discordChannelId } },
      ],
    }
  }

  if (project.discordProjectMessageId !== undefined) {
    notionProps['Project Message ID'] = {
      rich_text: [
        { type: 'text', text: { content: project.discordProjectMessageId } },
      ],
    }
  }

  if (project.discordIdeaMessageId !== undefined) {
    notionProps['Idea Message ID'] = {
      rich_text: [
        { type: 'text', text: { content: project.discordIdeaMessageId } },
      ],
    }
  }

  if (project.discordProposerUserId !== undefined) {
    notionProps['Proposer User ID'] = {
      rich_text: [
        { type: 'text', text: { content: project.discordProposerUserId } },
      ],
    }
  }

  try {
    notion.pages.update({
      page_id: project.notionPageId,
      properties: notionProps,
    })
  } catch (e) {
    console.error(e)
  }
}

export async function fetchProjects() {
  try {
    const response = await notion.databases.query({
      database_id: databaseId,
    })

    const supportProperties = [
      'ID',
      'Project Name',
      'Name',
      'Description',
      'GitHub URL',
      'Tech Stacks',
      'Income Source',
      'Channel ID',
      'Project Message ID',
      'Idea Message ID',
      'Proposer User ID',
    ]

    const projects: Project[] = await Promise.all(
      response.results.map(async (page: any) => {
        let uniqueId = undefined
        if (!page.properties['ID']?.unique_id.number) {
          console.log('fetching page unique id: ' + page.id + '...')
          uniqueId = await fetchUniqueId(page.id)
          console.log('fetched page unique id: ' + uniqueId)
        } else {
          uniqueId = page.properties['ID']?.unique_id.number
        }

        const extraProperties: Record<string, any> = {}
        for (const property in page.properties) {
          if (!supportProperties.includes(property)) {
            extraProperties[property] = page.properties[property]
          }
        }
        if (Object.keys(extraProperties).length > 0) {
          console.log('Extra Properties:', extraProperties)
        }

        // console.log(JSON.stringify(page.properties, null, 2))

        return {
          id: uniqueId,
          name: page.properties['Project Name']?.rich_text[0]
            ? page.properties['Project Name']?.rich_text[0].plain_text
            : undefined,
          displayTitle: page.properties['Name']?.title[0]
            ? page.properties['Name']?.title[0].plain_text
            : undefined,
          description: page.properties['Description']?.rich_text[0]
            ? page.properties['Description']?.rich_text[0].plain_text
            : undefined,
          notionUrl: page.url,
          notionPageId: page.id,
          githubUrl: page.properties['GitHub URL']?.url ?? undefined,
          techStacks: page.properties['Tech Stacks']?.multi_select
            ? page.properties['Tech Stacks']?.multi_select.map(
                (option: any) => option.name
              )
            : undefined,
          incomeSource: page.properties['Income Source']?.rich_text[0]
            ? page.properties['Income Source']?.rich_text[0].plain_text
            : undefined,
          channelId: page.properties['Channel ID']?.rich_text[0]
            ? page.properties['Channel ID']?.rich_text[0].plain_text
            : undefined,
          discordProjectMessageId: page.properties['Project Message ID']
            ?.rich_text[0]
            ? page.properties['Project Message ID']?.rich_text[0].plain_text
            : undefined,
          discordIdeaMessageId: page.properties['Idea Message ID']?.rich_text[0]
            ? page.properties['Idea Message ID']?.rich_text[0].plain_text
            : undefined,
          discordProposerUserId: page.properties['Proposer User ID']
            ?.rich_text[0]
            ? page.properties['Proposer User ID']?.rich_text[0].plain_text
            : undefined,
          additionalProperties: extraProperties,
        }
      })
    )

    return projects
  } catch (error) {
    console.error('Error retrieving projects from Notion:', error)
    return []
  }
}
