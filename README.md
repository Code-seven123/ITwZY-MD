# Whatsapp Bot - Node Js
## ITwZY-MD

[![Repo Updated Badge](https://badges.strrl.dev/updated/Code-seven123/ITwZY-MD)](https://badges.strrl.dev)
![GitHub contributors](https://img.shields.io/github/contributors/Code-seven123/ITwZY-MD)


## • Features  Bot

| Fiture | Status |
| ------ | ---- |
| Facebook | ✓ |
| Instagram | ✓ |
| Admin | ++ |
| lyrics | ✓ |
| bucin text (ID) | ✓ |



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
#### login from QR code
```bash
yarn start
```
#### login from Pairing code
```bash
yarn pairingCode
```

### - Npm
#### login from QR code
```bash
npm run start
```
#### login from Pairing code
```bash
npm run pairingCode
```

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

export default handler
```

## • options
### --notCache

`--notCache` functions to stop the scheduled time, which is 24 days or 86400000 milliseconds
