import { ModalSubmitInteraction } from 'discord.js'
import {
  editSessionStore,
  editableProperties,
} from '../context-menu-command/edit-project'
import { guildProjectsCache } from '../..'
import { updateProjectPage } from '../../adapters/notion-adapter'
import { createProjectPostMessage } from '../../utils/create-project'

export async function editProject(interaction: ModalSubmitInteraction) {
  const reply = await interaction.reply({
    content: '⏳Applying changes to the project...',
    ephemeral: true,
  })

  const inputNames = editableProperties.map((e) => e.propName)
  console.log('inputNames:', inputNames)

  const projectMessage = editSessionStore.getSession(interaction.user)
  console.log('projectMessage:', projectMessage)
  editSessionStore.endSession(interaction.user)

  if (projectMessage === undefined) {
    throw new Error('Cannot get modal session by user.')
  }

  const project: any = guildProjectsCache.getProjectByProjectMessageId(
    projectMessage.id
  )
  for (const inputName of inputNames) {
    console.log('inputName:', inputName)
    project[inputName] = interaction.fields.getTextInputValue(inputName)
    console.log('project[inputName]:', project[inputName])
  }
  console.log('project:', project)
  await updateProjectPage(project)
  console.log('project updated.')
  reply.edit('✅ Project edited successfully.')
  projectMessage.edit(createProjectPostMessage(project))
}
