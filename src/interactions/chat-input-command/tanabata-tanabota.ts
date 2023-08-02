import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  userMention,
} from 'discord.js'
import client from '../..'
import split from 'graphemesplit'
import { parse } from 'twemoji-parser'

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
const emojiFirstPoint: number[] = []
const emojiName: string[] = []
const emojiId: string[] = []

function moziHenkan(str: string, i: number) {
  let returnString = ''
  if (!(Object.keys(parse(str)).length === 0)) {
    // 絵文字アリの場合
    returnString = str
  } else if (emojiFirstPoint.includes(i)) {
    // カスタム絵文字アリの場合
    const useEmojiNumber = emojiFirstPoint.indexOf(i)
    returnString =
      '<:' + emojiName[useEmojiNumber] + ':' + emojiId[useEmojiNumber] + '>'
  } else {
    //絵文字無しの場合
    returnString = ' ' + moziZennkakuKa(str) + ' '
  }

  return returnString
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

    //願いの分割
    const negaiArray = split(negaiText)
    let negaiLongs: number = negaiArray.length

    let emojiEndPoint: number
    let judgmentEmoji = false //true間が絵文字の可能性
    let judgmentEmojiMiddle = false // trueでnameとid間の":"発見
    const emojiIdPattern = new RegExp('[0-9]') // emojiidの例外処理用
    const emojiNamePattern = new RegExp('[a-z]|[A-Z]|[0-9]|_') // emojinameの例外処理用
    let emojiUseNumber = 0
    let i = 0
    // カスタム絵文字の捜索と圧縮
    while (!(negaiArray[i] === undefined)) {
      // カスタム絵文字の可能性のある先端文字"<:"を見つけた場合
      if (negaiArray[i] === '<' && negaiArray[i + 1] === ':') {
        if (!judgmentEmoji) {
          // 頭文字発見の場合

          emojiFirstPoint[emojiUseNumber] = i
          emojiName[emojiUseNumber] = '!'
          judgmentEmoji = true
        } else if (judgmentEmojiMiddle) {
          // 末尾文字が見つからず、先頭文字が見つかった場合
          emojiFirstPoint.slice(emojiUseNumber, 1)
          emojiName.slice(emojiUseNumber, 1)
          emojiId.slice(emojiUseNumber, 1)
          judgmentEmoji = false
          judgmentEmojiMiddle = false
        } else {
          // 中間文字すら見つかっていない場合
          emojiFirstPoint.slice(emojiUseNumber, 1)
          judgmentEmoji = false
        }
      }
      // カスタム文字のnameとidをわける":"が見つかった場合
      if (negaiArray[i] === ':' && !judgmentEmojiMiddle) {
        if (
          judgmentEmoji &&
          !(i == emojiFirstPoint[emojiFirstPoint.length - 1] + 1)
        ) {
          // 前に先頭文字が見つかっていた場合
          judgmentEmojiMiddle = true

          emojiId[emojiUseNumber] = '!'
        } else {
          // ":"のみ見つかった場合
        }
      }
      // カスタム絵文字の可能性のある末尾文字">"を見つけた場合の処理
      if (negaiArray[i] === '>') {
        if (judgmentEmojiMiddle) {
          // 先頭文字と中間文字が存在した場合

          emojiEndPoint = i + 1
          // カスタム絵文字部分の圧縮
          negaiArray[emojiFirstPoint[emojiFirstPoint.length - 1]] = '!'
          negaiArray.splice(
            emojiFirstPoint[emojiUseNumber] + 1,
            emojiEndPoint - emojiFirstPoint[emojiUseNumber] - 1
          )
          negaiLongs = negaiArray.length
          judgmentEmoji = false
          judgmentEmojiMiddle = false

          i = emojiFirstPoint[emojiUseNumber]
          emojiName[emojiUseNumber] = emojiName[emojiUseNumber].replace('!', '')
          emojiId[emojiUseNumber] = emojiId[emojiUseNumber].replace('!', '')
          emojiUseNumber++
        } else if (judgmentEmoji) {
          // 先頭文字が見つかったのに中間文字が見つからなかった場合

          emojiFirstPoint.slice(emojiUseNumber, 1)
          emojiName.slice(emojiUseNumber, 1)
          judgmentEmoji = false
        } else {
          // 末尾文字だけ見つかった場合
        }
      }
      // カスタム文字のnameを取得
      if (
        judgmentEmoji &&
        !judgmentEmojiMiddle &&
        !(
          negaiArray[i] === ':' ||
          negaiArray[i] === '<' ||
          negaiArray[i] === '>'
        )
      ) {
        if (emojiNamePattern.test(negaiArray[i])) {
          // emojinameで使える文字か
          emojiName[emojiUseNumber] += negaiArray[i]
        } else {
          // emojinameに許されざる文字が入っていた場合
          emojiFirstPoint.slice(emojiUseNumber, 1)
          emojiName.slice(emojiUseNumber, 1)
          judgmentEmoji = false
        }
      }
      // カスタム文字のidを取得
      if (
        judgmentEmojiMiddle &&
        !(
          negaiArray[i] === ':' ||
          negaiArray[i] === '<' ||
          negaiArray[i] === '>'
        )
      ) {
        if (emojiIdPattern.test(negaiArray[i])) {
          // emojiidで使える文字か
          emojiId[emojiUseNumber] += negaiArray[i]
        } else {
          // emojiidに許されざる文字が入っていた場合
          emojiFirstPoint.slice(emojiUseNumber, 1)
          emojiName.slice(emojiUseNumber, 1)
          emojiId.slice(emojiUseNumber, 1)
          judgmentEmoji = false
          judgmentEmojiMiddle = false
        }
      }
      i++
    }

    await interaction.reply({
      content:
        '叶うわけないやろがい' + negaiText + userMention(interaction.user.id),
      ephemeral: true,
    })
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

    // 短冊の作成
    let tanzakuString = '★━┷━━━┓'

    tanzakuString += '\n'

    const splitUsername = split(useName)
    const usernameLongs: number = splitUsername.length

    let overString: number
    if (usernameLongs > negaiLongs) {
      //ユーザー名の方が長かった場合
      overString = usernameLongs - negaiLongs
      for (let i = 0; i < overString; i++) {
        tanzakuString +=
          '┃ ' + '　   ' + moziZennkakuKa(splitUsername[i]) + ' ┃' + '\n'
      }
      for (let i = 0; i < negaiLongs; i++) {
        tanzakuString +=
          '┃' +
          moziHenkan(negaiArray[i], i) +
          '  ' +
          moziZennkakuKa(splitUsername[overString + i]) +
          ' ┃' +
          '\n'
      }
    } else {
      //usernameの方が短かった場合
      overString = negaiLongs - usernameLongs
      for (let i = 0; i < overString; i++) {
        tanzakuString +=
          '┃' + moziHenkan(negaiArray[i], i) + '  　' + ' ┃' + '\n'
      }
      for (let i = 0; i < usernameLongs; i++) {
        tanzakuString +=
          '┃ ' +
          moziHenkan(negaiArray[overString + i], overString + i) +
          '  ' +
          moziZennkakuKa(splitUsername[i]) +
          ' ┃' +
          '\n'
      }
    }
    tanzakuString += '┗' + '━━━━━' + '★'

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
