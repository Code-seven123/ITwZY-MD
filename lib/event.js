import cfg from '../config.js'
import commands from '../plugins.js'
import menu from './menu.js'
export default async (e, conn, store, saveCreds, /* state */ ) => {
  if(e['creds.update']){
    await saveCreds()
  }
  if(e['chats.set']){
    console.log('got chats', store.chats.all())
  }
  if(e['contacts.set']){
    console.log('got contacts', Object.values(store.contacts))
  }
  if(e['messages.upsert']){
    const m = e['messages.upsert']
    const id = m.messages[0].key.remoteJid
    const cmd = m.messages[0].message.conversation?.split(' ')[0].substr(1)
    const args = m.messages[0].message.conversation?.split(' ').slice(1)
    const msgPrefix = m.messages[0].message.conversation?.substr(0, 1)
    const user = m.messages[0].pushName
    const IO = '0' + id.split('@')[0].substr(2)
    const phoneNumber = IO.substr(0, 4) + '-' + IO.substr(4, 4) + '-' + IO.substr(8)
    const rep = m.messages[0].message.extendedTextMessage?.contextInfo

    const key = {
      remoteJid: rep?.mentionedJid || 'not found',
      id: rep?.stanzaId || 'not found',
      participant: rep?.participant || 'not found'
    }
    console.log(m)
    if(msgPrefix == cfg.prefix){
      console.log({id, cmd, args, msgPrefix, user, phoneNumber})
      for ( const command of commands ) {
        if(/^(info)$/i.test(args[0])){
          await conn.sendMessage(id, {
            text: command.default.desc
          }, { quoted: m })
        }
        if(command.default.cmd.test(cmd)){
          try{
            await command.default(conn, {
              id: id, 
              commandName: cmd, 
              args: args, 
              msgPrefix: msgPrefix, 
              globalPrefix: cfg.prefix,
              phoneNumber: phoneNumber,
              user: user,
              reply: key
            }, m.messages[0])
          } catch (e) { console.error(e) }
        }
      }
      if(cmd == 'menu') {
        await conn.sendMessage(id, { text: menu(user, cfg.prefix) })
      }
    }

    console.log('replying to', m.messages[0].key.remoteJid)
    
    //    await conn.sendMessage(m.messages[0].key.remoteJid, { text: 'Hello there!' })
  }
  if(e['groups.upsert']) {
    const mg = e['groups.upsert']

    console.log(mg)
  }
}
