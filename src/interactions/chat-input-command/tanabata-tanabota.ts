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

function moziZennkakuKa(str: string) {
  const kanaMap: {
    [K: string]: string
  } = {
    ｶﾞ: 'ガ',
    ｷﾞ: 'ギ',
    ｸﾞ: 'グ',
    ｹﾞ: 'ゲ',
    ｺﾞ: 'ゴ',
    ｻﾞ: 'ザ',
    ｼﾞ: 'ジ',
    ｽﾞ: 'ズ',
    ｾﾞ: 'ゼ',
    ｿﾞ: 'ゾ',
    ﾀﾞ: 'ダ',
    ﾁﾞ: 'ヂ',
    ﾂﾞ: 'ヅ',
    ﾃﾞ: 'デ',
    ﾄﾞ: 'ド',
    ﾊﾞ: 'バ',
    ﾋﾞ: 'ビ',
    ﾌﾞ: 'ブ',
    ﾍﾞ: 'ベ',
    ﾎﾞ: 'ボ',
    ﾊﾟ: 'パ',
    ﾋﾟ: 'ピ',
    ﾌﾟ: 'プ',
    ﾍﾟ: 'ペ',
    ﾎﾟ: 'ポ',
    ｳﾞ: 'ヴ',
    ﾜﾞ: 'ヷ',
    ｦﾞ: 'ヺ',
    ｱ: 'ア',
    ｲ: 'イ',
    ｳ: 'ウ',
    ｴ: 'エ',
    ｵ: 'オ',
    ｶ: 'カ',
    ｷ: 'キ',
    ｸ: 'ク',
    ｹ: 'ケ',
    ｺ: 'コ',
    ｻ: 'サ',
    ｼ: 'シ',
    ｽ: 'ス',
    ｾ: 'セ',
    ｿ: 'ソ',
    ﾀ: 'タ',
    ﾁ: 'チ',
    ﾂ: 'ツ',
    ﾃ: 'テ',
    ﾄ: 'ト',
    ﾅ: 'ナ',
    ﾆ: 'ニ',
    ﾇ: 'ヌ',
    ﾈ: 'ネ',
    ﾉ: 'ノ',
    ﾊ: 'ハ',
    ﾋ: 'ヒ',
    ﾌ: 'フ',
    ﾍ: 'ヘ',
    ﾎ: 'ホ',
    ﾏ: 'マ',
    ﾐ: 'ミ',
    ﾑ: 'ム',
    ﾒ: 'メ',
    ﾓ: 'モ',
    ﾔ: 'ヤ',
    ﾕ: 'ユ',
    ﾖ: 'ヨ',
    ﾗ: 'ラ',
    ﾘ: 'リ',
    ﾙ: 'ル',
    ﾚ: 'レ',
    ﾛ: 'ロ',
    ﾜ: 'ワ',
    ｦ: 'ヲ',
    ﾝ: 'ン',
    ｧ: 'ァ',
    ｨ: 'ィ',
    ｩ: 'ゥ',
    ｪ: 'ェ',
    ｫ: 'ォ',
    ｯ: 'ッ',
    ｬ: 'ャ',
    ｭ: 'ュ',
    ｮ: 'ョ',
    '｡': '。',
    '､': '、',
    ｰ: 'ー',
    '｢': '「',
    '｣': '」',
    '･': '・',
    ' ﾞ': '゛',
    ' ﾟ': '゜',
    ' ': '　',
    '＿': '｜',
    '｜': '＿', //正規表現に使われる文字なので全角→全角じゃないとバグる
  }

  const reg = new RegExp('(' + Object.keys(kanaMap).join('|') + ')', 'g')
  return str
    .replace(/[!-~]/g, function (s) {
      return String.fromCharCode(s.charCodeAt(0) + 0xfee0)
    })
    .replace(reg, function (match) {
      return kanaMap[match]
    })
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
    const negaiArray = split(negaiText)
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
    let tanzakuString = '★┷━━┓'

    tanzakuString += '\n'
    console.log(useName)
    console.log(moziZennkakuKa(useName))
    const splitUsername = split(useName)
    const usernameLongs: number = splitUsername.length

    let overString: number
    if (usernameLongs > negaiLongs) {
      //ユーザー名の方が長かった場合
      overString = usernameLongs - negaiLongs
      for (let i = 0; i < overString; i++) {
        tanzakuString +=
          '┃' + '　' + moziZennkakuKa(splitUsername[i]) + '┃' + '\n'
      }
      for (let i = 0; i < negaiLongs; i++) {
        tanzakuString +=
          '┃' +
          moziZennkakuKa(negaiArray[i]) +
          moziZennkakuKa(splitUsername[overString + i]) +
          '┃' +
          '\n'
      }
    } else {
      //usernameの方が短かった場合
      overString = negaiLongs - usernameLongs
      for (let i = 0; i < overString; i++) {
        tanzakuString += '┃' + moziZennkakuKa(negaiArray[i]) + '　' + '┃' + '\n'
      }
      for (let i = 0; i < usernameLongs; i++) {
        tanzakuString +=
          '┃' +
          moziZennkakuKa(negaiArray[overString + i]) +
          moziZennkakuKa(splitUsername[i]) +
          '┃' +
          '\n'
      }
    }
    tanzakuString += '┗' + '━━━' + '★'

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
