import { InteractionResponse } from 'discord.js'

// todo: 行の操作ハンドラを返し、それを使って進捗を更新するようにする
export class ProgressReply {
  private progressMessage: string
  private message: InteractionResponse

  constructor(message: InteractionResponse) {
    this.progressMessage = ''
    this.message = message
  }

  async addProgress(newLine: string) {
    this.progressMessage = this.progressMessage + '\n' + newLine
    await this.message.edit(this.progressMessage)
  }

  async updateProgress(newLine: string) {
    const latestLines = this.progressMessage.split('\n') as string[]
    latestLines.pop()
    latestLines.push(newLine)
    this.progressMessage = latestLines.join('\n')
    await this.message.edit(this.progressMessage)
  }
}
