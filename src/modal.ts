import fs from 'fs'
import path from 'path'

// モジュールの型定義
export interface ModalModule {
  data: {
    modalCustomId: string
  }
  execute: (interaction: any) => Promise<void>
}

async function loadModalModules(): Promise<
  Map<string, (interaction: any) => Promise<void>>
> {
  const dirPath = path.resolve(__dirname, './interactions/modal')

  const modalCallbacks = new Map<string, (interaction: any) => Promise<void>>()

  const files = fs.readdirSync(dirPath)
  await Promise.all(
    files.map((file) => {
      if (path.extname(file) === '.ts' || path.extname(file) === '.js') {
        console.log(`Loading modal module: ${file}`)
        return import(path.join(dirPath, file)).then((modal) => {
          const modalModule = modal.default as ModalModule
          if (modalModule.data && typeof modalModule.execute === 'function') {
            modalCallbacks.set(
              modalModule.data.modalCustomId,
              modalModule.execute
            )
            console.log(
              `Modal module loaded successfully: ${modalModule.data.modalCustomId}`
            )
          }
        })
      }
    })
  )

  return modalCallbacks
}

export default loadModalModules
