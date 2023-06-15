export class Project {
  id?: number
  name?: string
  displayTitle?: string
  description?: string
  notionUrl?: string
  notionPageId?: string
  githubUrl?: string
  techStacks?: string[]
  incomeSource?: string
  discordChannelId?: string
  discordProjectMessageId?: string
  discordIdeaMessageId?: string
  discordProposerUserId?: string
  additionalProperties?: {
    [key: string]: any
  }

  constructor(
    id?: number,
    name?: string,
    displayTitle?: string,
    description?: string,
    notionUrl?: string,
    notionPageId?: string,
    githubUrl?: string,
    techStacks?: string[],
    incomeSource?: string,
    discordChannelId?: string,
    discordProjectMessageId?: string,
    discordIdeaMessageId?: string,
    discordProposerUserId?: string,
    additionalProperties?: {
      [key: string]: any
    }
  ) {
    this.id = id
    this.name = name
    this.displayTitle = displayTitle
    this.description = description
    this.notionUrl = notionUrl
    this.notionPageId = notionPageId
    this.githubUrl = githubUrl
    this.techStacks = techStacks
    this.incomeSource = incomeSource
    this.discordChannelId = discordChannelId
    this.discordProjectMessageId = discordProjectMessageId
    this.discordIdeaMessageId = discordIdeaMessageId
    this.discordProposerUserId = discordProposerUserId
    this.additionalProperties = additionalProperties
  }
}
