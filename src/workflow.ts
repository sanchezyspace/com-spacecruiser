import { BaseInteraction, Events, Interaction } from 'discord.js'
import { promises as fsPromises } from 'fs'
import { join as pathJoin } from 'path'
import client from '.'

const { readdir } = fsPromises

// Session state interface
interface SessionState {
  [key: string]: any
}

// The SessionStore holds the states for each user-guild combination
class SessionStore {
  private store: Map<string, SessionState>

  constructor() {
    this.store = new Map<string, SessionState>()
  }

  getSessionKey(userId: string, guildId: string): string {
    return `${userId}-${guildId}`
  }

  getSessionState(userId: string, guildId: string): SessionState {
    const key = this.getSessionKey(userId, guildId)
    return this.store.get(key) || {}
  }

  updateSessionState(
    userId: string,
    guildId: string,
    newState: SessionState
  ): void {
    const key = this.getSessionKey(userId, guildId)
    this.store.set(key, newState)
  }
}

const sessionStore = new SessionStore()

// The workflow manager
class WorkflowManager {
  private workflows: Map<string, any> // A map from workflow name to the workflow object

  constructor() {
    this.workflows = new Map<string, any>()
  }

  // Load all workflows from the workflows directory
  async loadWorkflows() {
    const dirPath = pathJoin(__dirname, 'workflows')
    const workflowNames = await readdir(dirPath)
    for (const name of workflowNames) {
      const workflowModule = await import(pathJoin(dirPath, name))
      this.workflows.set(name, workflowModule.default)
    }
  }

  async handleInteraction(interaction: BaseInteraction) {
    const { user, guild } = interaction
    const workflowName = 'ito' // Replace this with the logic to determine the correct workflow
    const workflow = this.workflows.get(workflowName)
    if (!workflow) {
      console.error(`No workflow matching ${workflowName} was found.`)
      return
    }

    if (guild === null) {
      if (interaction.isRepliable()) {
        await interaction.reply('Please use this command in a guild.')
      }
      return
    }

    const sessionState = sessionStore.getSessionState(user.id, guild.id)
    await workflow.handleInteraction(interaction, sessionState)
    sessionStore.updateSessionState(user.id, guild.id, sessionState)
  }
}

const workflowManager = new WorkflowManager()

// Use the workflow manager to handle interactions
client.on(Events.InteractionCreate, async (interaction: Interaction) => {
  await workflowManager.handleInteraction(interaction)
})
