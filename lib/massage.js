import cfg from '../config.js'
import menu from './menu.js'

const processMessage = async (m, commands, conn) => {
  for (const msg of m.messages) {
    const id = msg?.key?.remoteJid || 'not found'
    const cmd = msg?.message?.conversation?.split(' ')[0].substr(1) ||
                     msg?.message?.extendedTextMessage?.text.split(' ')[0].substr(1) ||
                     msg?.message?.imageMessage?.caption.split(' ')[0].substr(1) ||
                     msg?.message?.videoMessage?.caption.split(' ')[0].substr(1)
    const msgPrefix = msg?.message?.conversation.substr(0, 1) ||
                           msg?.message?.extendedTextMessage?.text.substr(0, 1) ||
                           msg?.message?.imageMessage?.caption.substr(0, 1) ||
                           msg?.message?.videoMessage?.caption.substr(0, 1)
    const user = msg?.pushName
    const IO = (id.split('@')[0] || '')
    const phoneNumber = '0' + IO.substr(2)
    const rep = msg.message?.extendedTextMessage?.contextInfo
    const media = msg.message?.imageMessage
    const fullText = msg.message?.conversation ||
                         msg?.message?.extendedTextMessage?.text ||
                         msg?.message?.imageMessage?.caption ||
                         msg?.message?.videoMessage?.caption
    const args = fullText.split(' ').slice(1)
    const key = {
      remoteJid: id,
      id: rep?.stanzaId || 'not found',
      fromMe: false,
      participant: rep?.participant || 'not found'
    }
    const userInGroup = (msg?.key?.participant === undefined) ? '' 
    : msg?.key?.participant.split('@')[0] || ''
    const isGroup = id.endsWith('@g.us') || false
    console.log({id: id,
                commandName: cmd,
                args: args,
                phoneNumber: phoneNumber,
                user: user})
    if (msgPrefix === cfg.prefix) {
      for (const command of commands) {
        const admin = cfg.owner.find(item => item.number == userInGroup)
        console.log(admin)
        if (command.default.cmd.test(cmd)) {
          try {
            if (cfg.loadingMsg) {
              await conn.sendMessage(id, { text: cfg.loadingMsgText })
            }
            if (/^(info)$/i.test(args[0])) {
              await conn.sendMessage(id, { text: `${command.default.desc}` }, { quoted: msg })
            } else if(command.default.admin && admin && isGroup) {
              await command.default(conn, {
                id: id,
                commandName: cmd,
                args: args,
                msgPrefix: msgPrefix,
                globalPrefix: cfg.prefix,
                phoneNumber: phoneNumber,
                user: user,
                reply: key,
                media: media,
                group: {
                  status: isGroup,
                  id: (id.endsWith('@g.us')) ? id : null
                }
              }, msg)
            } else if(!command.default.admin || !isGroup) {
              await command.default(conn, {
                id: id,
                commandName: cmd,
                args: args,
                msgPrefix: msgPrefix,
                globalPrefix: cfg.prefix,
                phoneNumber: phoneNumber,
                user: user,
                reply: key,
                media: media,
                group: {
                	status: isGroup,
									id: (id.endsWith('@g.us')) ? id : null
               	}
              }, msg)
            } else {
              await conn.sendMessage(id, { text: `admin only` }, { quoted: msg })
            }
          } catch (e) {
            await conn.sendMessage(id, { text: `${e}` })
          } finally {
            // await cleanupFiles()
          }
        }
      }
      if (cmd === 'menu') {
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
    await conn.readMessages([msg?.key])
    console.log(`Message from ${user}\n`, fullText || msg?.message?.extendedTextMessage?.text, '\n')
    console.log('replying to', msg?.key?.remoteJid, '\n')
  }
}

export default processMessage
