# spacecruiser
![HEADER IMAGE](https://static.wikia.nocookie.net/rickandmorty/images/1/17/Ricks_ship.PNG/revision/latest?cb=20160108071357)
Discordサーバー、sanchezyspace管理用Bot

# 導入
1. 環境変数を以下のように記述
    ```
    DISCORD_TOKEN = {開発用botのトークン}
    DISCORD_GUILD_ID = {your server id}
    DISCORD_CLIENT_ID = {your discord app client id}
    DISCORD_PROJECT_CATEGORY_ID ={your project category id}
    DISCORD_PROJECTS_CHANNEL_ID = {your project channel id}

    NOTION_TOKEN = {your notion token}
    NOTION_PROJECTS_DATABASE_ID = {your notion database id}
    ```
1. npm install
    ```
    $ npm install
    ```

2. ビルド
    ```
    $ npm run build
    ```
3. 実行
    ```
    $ npm start
    ```
# 使い方
- `src/commands`にあるスラッシュコマンドをDiscordサーバーにデプロイ
  ```
  $ npm run deploycommands
  ```
- ビルドと実行
  ```
  $ npm run dev
  ```
- ビルドと実行（watchモード）
  ```
  $ npm run dev:watch
  ```

# 招待
[Botを招待する](https://discord.com/api/oauth2/authorize?client_id=1116186393392193627&permissions=8&scope=bot)