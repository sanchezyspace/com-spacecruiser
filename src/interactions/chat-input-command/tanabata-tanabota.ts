import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  formatEmoji,
  userMention,
} from 'discord.js'
import client from '../..'
import split from 'graphemesplit'
import { parse } from 'twemoji-parser'

function convertToFullWidth(str: string) {
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

type SpliceEmoji = {
  index: number
  name: string
  id: string
}

const formatLine = (
  character: string,
  negaiIndex: number,
  splicedEmojis: SpliceEmoji[]
) => {
  let returnString = ''
  if (!(Object.keys(parse(character)).length === 0)) {
    // 絵文字アリの場合
    returnString = character
  } else if (splicedEmojis.map((e) => e.index).includes(negaiIndex)) {
    // カスタム絵文字アリの場合
    const emojisIndex = splicedEmojis.map((e) => e.index).indexOf(negaiIndex)
    returnString = formatEmoji(splicedEmojis[emojisIndex].id)
  } else {
    //絵文字無しの場合
    returnString = ' ' + convertToFullWidth(character) + ' '
  }

  return returnString
}

const spliceCustomEmojis = (negaiArray: string[]) => {
  let isProcessingCustomEmoji = false //true間が絵文字の可能性
  let isProcessingCustomEmojiId = false // trueでnameとid間の":"発見
  let newCustomEmoji: {
    index?: number
    name?: string
    id?: string
  } = {}
  const emojiIdPattern = new RegExp('[0-9]') // emojiIdの例外処理用
  const emojiNamePattern = new RegExp('[a-z]|[A-Z]|[0-9]|_') // emojiNameの例外処理用
  const splicedEmojis: SpliceEmoji[] = []

  let i = 0

  while (!(negaiArray[i] === undefined)) {
    if (negaiArray[i] === '<' && negaiArray[i + 1] === ':') {
      // カスタム絵文字の可能性のある先端文字"<:"を見つけた場合
      if (!isProcessingCustomEmoji) {
        // "<:"
        // 頭文字発見の場合
        newCustomEmoji.index = i
        isProcessingCustomEmoji = true
      } else if (isProcessingCustomEmojiId) {
        // "<:emojiName:123123 <:"
        // 前回の絵文字の末尾文字が見つからず、先頭文字が見つかった場合
        newCustomEmoji = {}
        newCustomEmoji.index = i
        isProcessingCustomEmoji = true
        isProcessingCustomEmojiId = false
      } else {
        // "<:emojiName <:"
        // 中間文字すら見つかっていない場合
        newCustomEmoji = {}
        newCustomEmoji.index = i
        isProcessingCustomEmoji = true
        isProcessingCustomEmojiId = false
      }
    }

    if (negaiArray[i] === ':' && !isProcessingCustomEmojiId) {
      // ":"が見つかった場合

      if (isProcessingCustomEmoji && (negaiArray[i - 1] ?? '') !== '<') {
        // 前に先頭文字が見つかっていた場合 (=カスタム文字のnameとidをわける":"だった場合)
        isProcessingCustomEmojiId = true
        newCustomEmoji.id = ''
      }
    }

    if (negaiArray[i] === '>') {
      // カスタム絵文字の可能性のある末尾文字">"を見つけた場合
      if (
        newCustomEmoji.index !== undefined &&
        newCustomEmoji.name !== undefined &&
        newCustomEmoji.id !== undefined &&
        isProcessingCustomEmojiId
      ) {
        // 先頭文字と中間文字が存在した場合
        const emojiEndPoint = i + 1
        // カスタム絵文字部分の圧縮
        negaiArray[newCustomEmoji.index] = '!'
        negaiArray.splice(
          newCustomEmoji.index + 1,
          emojiEndPoint - newCustomEmoji.index - 1
        )
        isProcessingCustomEmoji = false
        isProcessingCustomEmojiId = false

        i = newCustomEmoji.index
        splicedEmojis.push({
          index: newCustomEmoji.index,
          name: newCustomEmoji.name,
          id: newCustomEmoji.id,
        })
      } else if (isProcessingCustomEmoji) {
        // 先頭文字が見つかったのに中間文字が見つからなかった場合
        newCustomEmoji = {}
        isProcessingCustomEmoji = false
      }
    }

    // カスタム文字のnameを取得
    if (
      isProcessingCustomEmoji &&
      !isProcessingCustomEmojiId &&
      ![':', '<', '>'].includes(negaiArray[i])
    ) {
      if (emojiNamePattern.test(negaiArray[i])) {
        // カスタム絵文字名で使える文字か
        newCustomEmoji.name
          ? (newCustomEmoji.name += negaiArray[i])
          : (newCustomEmoji.name = negaiArray[i])
      } else {
        // カスタム絵文字として許されざる文字が入っていた場合
        newCustomEmoji = {}
        isProcessingCustomEmoji = false
      }
    }

    // カスタム文字のidを取得
    if (isProcessingCustomEmojiId && ![':', '<', '>'].includes(negaiArray[i])) {
      if (emojiIdPattern.test(negaiArray[i])) {
        // カスタム絵文字IDで使える文字か
        newCustomEmoji.id += negaiArray[i]
      } else {
        // カスタム絵文字IDとして許されざる文字が入っていた場合
        newCustomEmoji = {}
        isProcessingCustomEmoji = false
        isProcessingCustomEmojiId = false
      }
    }
    i++
  }

  return splicedEmojis
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
    .addBooleanOption((option) =>
      option
        .setName('匿名')
        .setDescription('匿名で書き込む?')
        .setRequired(false)
    ),
  execute: async (interaction: ChatInputCommandInteraction) => {
    const negaiText = interaction.options.getString('願い')
    if (negaiText === null) return

    const negaiArray = split(negaiText)

    // カスタム絵文字の捜索と圧縮
    const splicedEmojis = spliceCustomEmojis(negaiArray)
    const negaiLength = negaiArray.length

    await interaction.reply({
      content:
        '叶うわけないやろがい ' + negaiText + userMention(interaction.user.id),
      ephemeral: true,
    })
    //匿名かの判断
    let tanzakuSignature: string
    if (
      interaction.options.getBoolean('匿名') === false ||
      interaction.options.getBoolean('匿名') === null
    ) {
      //匿名では無い場合
      tanzakuSignature = interaction.user.username
    } else {
      //匿名の場合
      tanzakuSignature = '匿名'
    }

    // 短冊の作成
    let tanzakuString = '★━┷━━━┓\n'

    const splitSignature = split(tanzakuSignature)
    const signatureLength: number = splitSignature.length

    if (signatureLength > negaiLength) {
      //ユーザー名の方が長かった場合
      const diffLength = signatureLength - negaiLength
      for (let i = 0; i < diffLength; i++) {
        tanzakuString +=
          '┃ ' + '　   ' + convertToFullWidth(splitSignature[i]) + ' ┃' + '\n'
      }
      for (let i = 0; i < negaiLength; i++) {
        tanzakuString +=
          '┃' +
          formatLine(negaiArray[i], i, splicedEmojis) +
          '  ' +
          convertToFullWidth(splitSignature[diffLength + i]) +
          ' ┃' +
          '\n'
      }
    } else {
      //usernameの方が短かった場合
      const diffLength = negaiLength - signatureLength
      for (let i = 0; i < diffLength; i++) {
        tanzakuString +=
          '┃' +
          formatLine(negaiArray[i], i, splicedEmojis) +
          '  　' +
          ' ┃' +
          '\n'
      }
      for (let i = 0; i < signatureLength; i++) {
        tanzakuString +=
          '┃ ' +
          formatLine(
            negaiArray[diffLength + i],
            diffLength + i,
            splicedEmojis
          ) +
          '  ' +
          convertToFullWidth(splitSignature[i]) +
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
      console.log(
        `🎋 Generated new tanabata: "${negaiText}" by ${interaction.user.username}`
      )
    }
  },
}
