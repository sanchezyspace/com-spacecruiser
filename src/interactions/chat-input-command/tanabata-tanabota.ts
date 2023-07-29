import {
  BaseInteraction,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  userMention,
  Client,
  Channel,
} from 'discord.js'
import client from '../..'
import split from 'graphemesplit'

const splitString = (s: string): string[] => {
  const customEmojiPattern = /<:[a-zA-Z0-9_]+:[0-9]+>/g
  const matches = [...s.matchAll(customEmojiPattern)]

  let lastEnd = 0
  const result: string[] = []

  for (const match of matches) {
    const start = match.index ?? 0
    // これまでの文字を追加
    const substr = s.slice(lastEnd, start)
    result.push(...split(substr))

    // カスタム絵文字を追加
    result.push(match[0])
    lastEnd = start + match[0].length
  }

  // 残りの文字を追加
  const remaining = s.slice(lastEnd)
  result.push(...split(remaining))

  return result
}

export default {
  data: new SlashCommandBuilder()
    .setName('tanabata')
    .setDescription('お願いごと しよう！')
    .addStringOption(
      (
        negaiInput //スラッシュコマンドに
      ) =>
        negaiInput
          .setName('願い')
          .setDescription('願い事をどうぞ')
          .setRequired(true)
    )
    .addBooleanOption((tokumei) =>
      tokumei
        .setName('匿名')
        .setDescription('匿名で書き込む?')
        .setRequired(false)
    ),
  execute: async (interaction: ChatInputCommandInteraction) => {
    const negaiText = interaction.options.getString('願い')
    if (negaiText === null) return
    console.log(negaiText)
    const negaiArray = splitString(negaiText)
    const negaiLongs: number = negaiArray.length
    console.log(negaiArray)
    await interaction.reply({
      content:
        '叶うわけないやろがい' + negaiText + userMention(interaction.user.id),
      ephemeral: true,
    })
    //願いの分割

    //匿名かの判断
    let useName: string
    if (
      interaction.options.getBoolean('匿名') === false ||
      interaction.options.getBoolean('匿名') === null
    ) {
      //匿名では無い場合
      useName = interaction.user.username
    } else {
      //匿名の場合
      useName = '匿名'
    }
    //短冊の作成
    let tanzakuString = '★┷━┓'

    tanzakuString += '\n'
    const splitUsername = split(useName)
    const usernameLongs: number = splitUsername.length

    let overString: number
    if (usernameLongs > negaiLongs) {
      //ユーザー名の方が長かった場合
      overString = usernameLongs - negaiLongs
      for (let i = 0; i < overString; i++) {
        tanzakuString += '┃' + '　' + splitUsername[i] + '┃' + '\n'
      }
      for (let i = 0; i < negaiLongs; i++) {
        tanzakuString +=
          '┃' + negaiArray[i] + splitUsername[overString + i] + '┃' + '\n'
      }
    } else {
      //usernameの方が短かった場合
      overString = negaiLongs - usernameLongs
      for (let i = 0; i < overString; i++) {
        tanzakuString += '┃' + negaiArray[i] + '　' + '┃' + '\n'
      }
      for (let i = 0; i < usernameLongs; i++) {
        tanzakuString +=
          '┃' + negaiArray[overString + i] + splitUsername[i] + '┃' + '\n'
      }
    }
    tanzakuString += '┗' + '━━' + '★'

    //チャンネルに送信(半分理解なので有識者に聞く)https://stackoverflow.com/questions/62899012/discord-js-cast-or-convert-guildchannel-to-textchannel
    //const TargetChannel =  client.channels.cache.get('1112583911495708762')//テキストチャンネル
    //const TargetChannel = client.channels.cache.get("1118120544236228628")//スレッド(動作した)
    // await client.channels.cache.get('1126734764708216973')?.send()
    const targetChannel = client.channels.cache.get('1126734764708216973') //短冊チャンネル
    if (targetChannel?.isTextBased()) {
      await targetChannel.send(tanzakuString)
    }
  },
}
