# spacecruiser
![HEADER IMAGE](https://static.wikia.nocookie.net/rickandmorty/images/1/17/Ricks_ship.PNG/revision/latest?cb=20160108071357)
Discordサーバー、sanchezyspace管理用Bot

# 環境構築
1. 開発用Discord Botを[新たに作成、トークンを取得、サーバーに招待](https://www.geeklibrary.jp/counter-attack/discord-js-bot/?nab=0)
   アプリ、bot名は両方`spacecruiser-dev-chelluoxou`みたいな感じで、`spacecruiser-dev`から必ずはじまるようにして、誰が開発しているBotなのかわかるようにしてください
2. Notionのトークンを取得（dev今のところないです [開発チャンネル](https://discord.com/channels/1111117517281312827/1114946016681152663/1123150198907093105)にprodあります）
3. `.env.development`を以下のように記述
    ```
    DISCORD_TOKEN = {開発用botのトークン}
    DISCORD_CLIENT_ID = {開発用BotのクライアントID}
    DISCORD_GUILD_ID = {稼働サーバーID}
    DISCORD_PROJECT_CATEGORY_ID = {プロジェクトチャンネルカテゴリのID}
    DISCORD_PROJECTS_CHANNEL_ID = {プロジェクト一覧チャンネルのID}

    NOTION_TOKEN = {notionのトークン}
    NOTION_PROJECTS_DATABASE_ID = {projectsデータベースのID}
    ```
    NotionのトークンとかDiscordサーバーのチャンネルIDとか、足りない情報は[開発チャンネル](https://discord.com/channels/1111117517281312827/1114946016681152663/1123150198907093105)に載ってます

4. パッケージのインストール
    ```sh
    $ npm install
    ```

5. 開発用Botにコマンドをデプロイ
    （Discord上でのコマンド入力仕様に関する変更があるたびに実行が必要）
    ```sh
    $ npm run deploy-commands:dev
    ```

6. 実行
    （コマンドの処理部分、その他コードの変更時はこれだけでOK）
    ```sh
    $ npm run dev
    ```

# npmスクリプトの使い方
- `src/interactions`にあるコマンドをDiscordサーバーにデプロイ
  ```sh
  $ npm run deploy-commands:dev 
  ```
- ビルドと実行
  ```sh
  $ npm run dev
  ```
- ビルドと実行（watchモード）
  ```sh
  $ npm run dev:watch
  ```

# contribution
1. **`develop`ブランチから**開発ブランチを切る
2. 開発する
3. **`develop`ブランチに**PR出す
- **`develop`**ブランチに**勝手にマージしたらだめ**だし**直接pushしない**ことkoto
- 当然、**`main`**ブランチにも**勝手にマージしたらだめだ**だし**直接pushしない**こと

# 開発tips

## サーバーで使えるコマンドの追加方法
1. コマンドのスクリプトを作成
    TypeScriptで書きたい人は `.ts`を作ってください。
    **スラッシュコマンドの場合：**
    ```sh
    $ touch src/interactions/chat-input-command/{command-name}.js
    ```
    **コンテクストメニューの場合：**
    ```sh
    $ touch src/interactions/context-menu-command/{command-name}.js
    ```
2. テンプレートをコピペ
   **スラッシュコマンドの場合 (JavaScript)：**
    ```javascript
    import { SlashCommandBuilder } from 'discord.js';

    export default {
      data: new SlashCommandBuilder()
        .setName('new-command')
        .setDescription('spacecruiser replies with wubba lubba dub-dub!'),

      execute: async (interaction) => {
        if (interaction.isChatInputCommand()) {
          interaction.reply('Wubba Lubba dub-dub');
        }
      },
    };
    ```

   **スラッシュコマンドの場合 (TypeScript)：**
    ```typescript
    import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';

    export default {
      data: new SlashCommandBuilder()
        .setName('new-command')
        .setDescription('spacecruiser replies with wubba lubba dub-dub!'),

      execute: async (interaction: ChatInputCommandInteraction) => {
          interaction.reply('Wubba Lubba dub-dub');
      },
    };
    ```

    **メッセージコンテキストメニューの場合 (JavaScript)：**
    ```javascript
    import { ApplicationCommandType, ContextMenuCommandBuilder } from 'discord.js'

    export default {
      data: new ContextMenuCommandBuilder()
        .setName('New Command')
        .setType(ApplicationCommandType.Message),

      execute: async (interaction) => {
        if (interaction.isMessageContextMenuCommand()) {
          interaction.reply('Wubba Lubba dub-dub')
        }
      },
    }
    ```

    **メッセージコンテキストメニューの場合 (TypeScript)：**
    ```typescript
    import {
      ApplicationCommandType,
      ContextMenuCommandBuilder,
      MessageContextMenuCommandInteraction,
    } from 'discord.js'

    export default {
      data: new ContextMenuCommandBuilder()
        .setName('New Command')
        .setType(ApplicationCommandType.Message),

      execute: async (interaction: MessageContextMenuCommandInteraction) => {
        interaction.reply('Wubba Lubba dub-dub')
      },
    }
    ```
3. 開発用Botにコマンドをデプロイ
    ```sh
    $ npm run deploy-commands:dev
    ```
## 便利なリンク
- [Discord JS Japan - やりたいこと逆引き集、サンプルプログラム](https://scrapbox.io/discordjs-japan/%E3%82%84%E3%82%8A%E3%81%9F%E3%81%84%E3%81%93%E3%81%A8%E9%80%86%E5%BC%95%E3%81%8D%E9%9B%86)
  日本語でサクサク読める。サンプルだけで30個あるし、これは見るだけでなんとなく雰囲気掴めると思います。ただし、逆引きサンプルとかクラスの説明自体はドキュメントよりもシンプルな書かれ方をしてる。ある程度わかってる人向け。
- [【Javascriptで作成する】Discordのbotの作り方 Discord.js v14](https://www.geeklibrary.jp/counter-attack/discord-js-bot/?nab=0)
  Discord.js v14でBotを作る方法をイチから説明してくれてる。文量多め。丁寧。

- [公式ドキュメント old.discordjs.dev](https://old.discordjs.dev/#/docs/discord.js/main/general/welcome)
  型定義、関数、クラスに関するドキュメントはこっち
- [公式ドキュメント discordjs.guide](https://discordjs.guide/)
  導入ガイドや、逆引き集、チュートリアルなどはこっち。
- [GitHub - discordjs/discord.js](https://github.com/discordjs/discord.js)
  ギット・ハブ
## production環境へのデプロイ

覚書です　基本的に勝手にやらないで
1. `.env.production`を以下のように記述
    ```
    DISCORD_TOKEN = {本番用botのトークン}
    DISCORD_CLIENT_ID = {本番用BotのクライアントID}
    DISCORD_GUILD_ID = {稼働サーバーID}
    DISCORD_PROJECT_CATEGORY_ID = {プロジェクトチャンネルカテゴリのID}
    DISCORD_PROJECTS_CHANNEL_ID = {プロジェクト一覧チャンネルのID}

    NOTION_TOKEN = {notionのトークン}
    NOTION_PROJECTS_DATABASE_ID = {projectsデータベースのID}
    ```

2. 本番環境としてコマンドをデプロイ
    ```sh
    $ npm run deploy-commands:prod
    ```
3. 開発用Botがデプロイしていたコマンドをクリーンアップ
    ```sh
    $ npm run delete-commands:dev
    ```
4. developブランチにマージ
5. [Railway](https://railway.app/project/3a862890-c117-4016-b1ff-688753a9f711/service/49ebe294-7b32-4a4e-b577-3a5d8b98ee3f)への自動デプロイを確認
   

# 使用ライブラリなど
- Discord.js v14
- Notion API
- dotenv
- TypeScript
- Yargs

- ESLint
- Prettier
- husky
# 招待
[公開用Botを招待する](https://discord.com/api/oauth2/authorize?client_id=1116186393392193627&permissions=8&scope=bot)