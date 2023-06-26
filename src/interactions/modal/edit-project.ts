import { ModalSubmitInteraction } from 'discord.js'
import {
  editSessionStore,
  editableProperties,
} from '../context-menu-command/edit-project'
import { guildProjectsCache } from '../..'
import { updateProjectPage } from '../../adapters/notion-adapter'
import { createProjectPostMessage } from '../../utils/create-project'
import { Logger } from '../../utils/logger'

export async function editProject(interaction: ModalSubmitInteraction) {
  const logger = new Logger('edit-project')

  const reply = await interaction.reply({
    content: '⏳Applying changes to the project...',
    ephemeral: true,
  })

  try {
    await reply.edit('⏳Fetching project...')
    await guildProjectsCache.fetchProjects()
  } catch (e: any) {
    logger.error('Error fetching projects:\n', e)
    await reply.edit(`❌ Failed to fetch projects ${e.message}`)
  }

  const modalInputNames = editableProperties.map((e) => e.propName)
  logger.log('inputNames:', modalInputNames)

  const projectMessage = editSessionStore.getSession(interaction.user)
  logger.log('projectMessage:', projectMessage)
  editSessionStore.endSession(interaction.user)

  if (projectMessage === undefined) {
    throw new Error('Cannot get modal session by user.')
  }

  const project: any = guildProjectsCache.getProjectByProjectMessageId(
    projectMessage.id
  )

  logger.log('fetched project:', project);

  for (const inputName of modalInputNames) {
    logger.log('modal input name:', inputName)
    project[inputName] = interaction.fields.getTextInputValue(inputName)
    logger.log('project[inputName]:', project[inputName])
  }
  logger.log('project:', project)
  try{
    await updateProjectPage(project)
  } catch(e: any){
    logger.error("Project update page error:\n", e)
    reply.edit(`❌ Failed to edit project.（$e.message}`)
    return
  }
  logger.log('project updated.')
  reply.edit('✅ Project edited successfully.')
  projectMessage.edit(createProjectPostMessage(project))
}
