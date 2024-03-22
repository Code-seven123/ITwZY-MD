
![icon](src/icon.jpg)

# Whatsapp Bot - Node Js
## ITwZY-MD

[![Repo Updated Badge](https://badges.strrl.dev/updated/Code-seven123/ITwZY-MD)](https://badges.strrl.dev)
![GitHub contributors](https://img.shields.io/github/contributors/Code-seven123/ITwZY-MD)
![GitHub repo size](https://img.shields.io/github/repo-size/code-seven123/ITwZY-MD?style=for-the-badge&logo=Affinity&labelColor=%23836FFF)

## • Features  Bot

| Fiture | Status |
| ------ | ---- |
| Facebook | ✓ |
| Instagram | ✓ |
| Admin | ✓ |
| lyrics | ✓ |
| bucin text (ID) | ✓ |
| Premium mode | ++ |
|  youtube downloader | ✓ |
| Converter mp4 to mp3 | ✓ |
| Gacha waifu | ✓ |



# Linux/debian/ubuntu
## • Instalasi

### - Install/Clone proyek
```bash
git clone https://github.com/Code-seven123/ITwZY-MD.git
```

### - Change directory
```bash
cd ITwZY-MD
```

## • install ffmpeg
```bash
sudo apt install ffmpeg
```

## • Install Dependencies
### - Npm
```bash
npm install
```

### - Yarn
```bash
yarn install
```

## • change configuration
Rename file `config.js.sample` to `config.js` and last edit your configuration in config.js 

## • Running Applications

### - Yarn
#### login from Pairing code
```bash
yarn start
```

### - Npm
#### login from Pairing code
```bash
npm run start
```

## • Open link in Chrome and input your phone number from get pairing code

## • Argumen information
### ``node index.js <options>``
### ``--use-pairing-code``
This is used for logging in via pairing code.
### ``--use-web``
This option will use the website for logging in.
### ``--use-premium``
This is used to switch to premium-only mode.
## • sample plugins file
```javascript

const handler = async (conn /* action variable */, { 
		 id, // Id Whatsapp sender
    commandName, // Command Name by sender
    args, // Get argument from command
    msgPrefix, // Prefix used by the sender.
    globalPrefix, // Prefix set in the configuration
    phoneNumber, // Phone number from sender
    user, // username sender
    reply, // reply data by object
    media // media data by object
	}, m /* data massage */) => {
  await conn.sendMessage(id, { text: "hello everyone" }, { quoted: m })
}

handler.cmd = /^(ping|test)$/i // set your command name
handler.desc = '!ping pong' // set your description
handler.category = 'utility' // set your category
handler.args = null // set your argument
handler.admin = true // use false for public or true for admin

export default handler
```
