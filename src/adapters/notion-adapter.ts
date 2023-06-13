import { Client } from '@notionhq/client'
import { CreatePageResponse } from '@notionhq/client/build/src/api-endpoints'
import {
  heading1,
  paragraph,
} from '@sota1235/notion-sdk-js-helper/dist/blockObjects'

// Initializing a client
export const notion = new Client({
  auth: process.env.NOTION_TOKEN,
})

type ProjectPageProps = {
  projectId: string
  projectDesc: string
  githubUrl: string
}

export const createProjectPage = async (props: ProjectPageProps) => {
  const pageBody = [heading1(props.projectId), paragraph(props.projectDesc)]

  const response = await notion.pages.create({
    icon: {
      type: 'emoji',
      emoji: '🆕',
    },
    parent: {
      type: 'database_id',
      database_id: '48e08d3b4d7d455fb88818fb08ff2fe7',
    },
    properties: {
      Name: {
        title: [
          {
            text: {
              content: props.projectId,
            },
          },
        ],
      },
      'Project ID': {
        rich_text: [
          {
            type: 'text',
            text: {
              content: props.projectId,
            },
          },
        ],
      },
    },
    children: pageBody,
  })

  console.log(response)

  return response as CreatePageResponse
}
