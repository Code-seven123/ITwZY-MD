import cfg from '../config.js' 
import commands from '../plugins.js' 
import menu from './menu.js' 
import fs from 'fs' 
import { fileURLToPath } from 'url' 
import { dirname, join } from 'path' 
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

async function cleanupFiles() {
  try {
    const files = fs.readdirSync(join(__dirname, '../temp'))
    for (const file of files) {
      fs.unlinkSync(join(__dirname, '../temp', file))
    }
  } catch (err) {
    console.error('Error cleaning up files:', err)
  }
}

export default async (e, conn, store, saveCreds, /* state */ ) => {
  if(e['creds.update']){
    await saveCreds()
  }
    if(e['labels.association']) {
    console.log('labels.association', e['labels.association'])
  }

  if(e['labels.edit']) {
    console.log('labels.edit', e['labels.edit'])
  }

  if(e.call) {
    console.log('recv call event', e.call)
  }
  // history received
  if(e['messaging-history.set']) {
    const { chats, contacts, messages, isLatest } = e['messaging-history.set']
    console.log(`recv ${chats.length} chats, ${contacts.length} contacts, ${messages.length} msgs (is latest: ${isLatest})`)
  }
  if(e['message-receipt.update']) {
    console.log('message-receipt.update', e['message-receipt.update'])
  }

  if(e['messages.reaction']) {
    console.log('messages.reaction', e['messages.reaction'])
  }

  if(e['presence.update']) {
    console.log('presence.update', e['presence.update'])
  }

  if(e['chats.update']) {
    console.log('chats.update', e['chats.update'])
  }

  if(e['chats.delete']) {
    console.log('chats deleted ', e['chats.delete'])
  }
  if(e['chats.set']){
    console.log('got chats', store.chats.all())
  }
  if(e['contacts.set']){
    console.log('got contacts', Object.values(store.contacts))
  }
  if(e['messages.upsert']){
    const m = e['messages.upsert']
    for ( const msg of m.messages ) {
      const id = msg?.key?.remoteJid
      const cmd = msg?.message?.conversation?.split(' ')[0].substr(1) 
      		|| msg?.message?.extendedTextMessage?.text.split(' ')[0].substr(1)
      		|| msg?.message?.imageMessage?.caption.split(' ')[0].substr(1)
      		|| msg?.message?.videoMessage?.caption.split(' ')[0].substr(1)
      const args = msg?.message?.conversation?.split(' ').slice(1)
      		|| msg?.message?.extendedTextMessage?.text.split(' ').slice(1)
      		|| msg?.message?.imageMessage?.caption?.split(' ').slice(1)
      		|| msg?.message?.videoMessage?.caption?.split(' ').slice(1)
      const msgPrefix = msg?.message?.conversation?.substr(0, 1)
          || msg?.message?.extendedTextMessage?.text.substr(0, 1)
          || msg?.message?.imageMessage?.caption?.substr(0, 1)
          || msg?.message?.videoMessage?.caption?.substr(0, 1)
      const user = msg?.pushName
      const IO = '0' + id.split('@')[0].substr(2)
      const phoneNumber = IO.substr(0, 4) + '-' + IO.substr(4, 4) + '-' + IO.substr(8)
      const rep = msg.message?.extendedTextMessage?.contextInfo
      const media = msg.message?.imageMessage
      const fullText = msg.message?.conversation 
      		|| msg?.message?.extendedTextMessage?.text
      		|| msg?.message?.imageMessage?.caption
      		|| msg?.message?.videoMessage?.caption
      const key = {
        remoteJid: id || 'not found',
        id: rep?.stanzaId || 'not found',
        fromMe: false,
        participant: rep?.participant || 'not found'
      }
      if(msgPrefix == cfg.prefix){
        console.log(m.type, { id, cmd, args, phoneNumber, user, rep })
        for ( const command of commands ) {
          if(command.default.cmd.test(cmd)){
            try{
              if ( cfg.loadingMsg ) {
                await conn.sendMessage(id, { text: cfg.loadingMsgText })
              }
              if (/^(info)$/i.test(args[0])) {
                await conn.sendMessage(id, { text: `${command.default.desc}` }, { quoted: msg })
              } else {
  	            await command.default(conn, {
	                id: id, 
	                commandName: cmd, 
	                args: args, 
	                msgPrefix: msgPrefix, 
	                globalPrefix: cfg.prefix,
	                phoneNumber: phoneNumber,
	                user: user,
	                reply: key,
	                media: media
	              }, msg)
              }
            } catch (e) { 
            	await conn.sendMessage(id, { text: `${e}` }) 
            } finally {
//              await cleanupFiles()
            }
          }
        }
        if(cmd == 'menu') {
          const content = {
            text: menu(user, cfg),
            contextInfo: {
              externalAdReply: {
                title: `*Hello* ${user}`,
                thumbnailUrl: cfg.thumnailMenus,
                mediaType: 1,
                renderLargerThumbnail: true
              }
            }
          }
          await conn.sendMessage(id, content, { quoted: msg })
        }
      }
      console.log(`Message from ${user}\n`, fullText || msg?.message?.extendedTextMessage?.text, '\n')
      console.log('replying to', msg?.key?.remoteJid, '\n')
    }
  }
  if(e['groups.upsert']) {
    const mg = e['groups.upsert']
		
    console.log('group', mg)
  }
}
