import { ModalSubmitInteraction } from 'discord.js'
import {
  editSessionStore,
  editableProperties,
} from '../context-menu-command/edit-project'
import { guildProjectsCache } from '../..'
import { updateProjectPage } from '../../adapters/notion-adapter'
import { createProjectPostMessage } from '../../utils/create-project'
import { Logger } from '../../utils/logger'
import { ProgressReply } from '../../utils/progress-reply'

export async function editProject(interaction: ModalSubmitInteraction) {
  const logger = new Logger('edit-project')
  const reply = await interaction.reply({
    content: '⏳Applying changes to the project...',
    ephemeral: true,
  })
  const progressReply = new ProgressReply(reply)

  try {
    await reply.edit('⏳Fetching project...')
    await guildProjectsCache.fetchProjects()
  } catch (e: any) {
    logger.error('Error fetching projects:\n', e)
    await progressReply.addProgress(`❌ Failed to fetch projects ${e.message}`)
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
  await progressReply.updateProgress('✅ Fetched all projects.')

  for (const inputName of modalInputNames) {
    logger.log('modal input name:', inputName)
    project[inputName] = interaction.fields.getTextInputValue(inputName)
    logger.log('project[inputName]:', project[inputName])
  }
  logger.log('project:', project)

  await progressReply.addProgress('⏳ Updating notion database...')
  try{
    await updateProjectPage(project)
  } catch(e: any){
    logger.error("Project update page error:\n", e)
    progressReply.addProgress(`❌ Failed to edit project.（$e.message}`)
    return
  }
  logger.log('project updated.')
  await progressReply.updateProgress('✅ Project database updated.')

  await progressReply.addProgress('⏳ Updating project message...')
  projectMessage.edit(createProjectPostMessage(project))
  await progressReply.updateProgress('🎉 Project has been edited successfully.')

  setTimeout(() => {
    reply.delete()
    logger.log('reply deleted.')
  }, 8000)

}
