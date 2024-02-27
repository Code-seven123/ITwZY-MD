import cfg from '../config.js'
import menu from './menu.js'

const processMessage = async (m, commands, conn) => {
  for (const msg of m.messages) {
    const id = msg?.key?.remoteJid || 'not found'
    const cmd = (msg?.message?.conversation?.split(' ')[0]?.substr(1) ||
                     msg?.message?.extendedTextMessage?.text.split(' ')[0]?.substr(1) ||
                     msg?.message?.imageMessage?.caption.split(' ')[0]?.substr(1) ||
                     msg?.message?.videoMessage?.caption.split(' ')[0]?.substr(1)).toLowerCase()
    const args = msg?.message?.conversation?.split(' ').slice(1) ||
                     msg?.message?.extendedTextMessage?.text.split(' ').slice(1) ||
                     msg?.message?.imageMessage?.caption?.split(' ').slice(1) ||
                     msg?.message?.videoMessage?.caption?.split(' ').slice(1) || []
    const msgPrefix = (msg?.message?.conversation?.substr(0, 1) ||
                           msg?.message?.extendedTextMessage?.text.substr(0, 1) ||
                           msg?.message?.imageMessage?.caption?.substr(0, 1) ||
                           msg?.message?.videoMessage?.caption?.substr(0, 1)).toLowerCase()
    const user = msg?.pushName
    const IO = '0' + (id.split('@')[0]?.substr(2) || '')
    const phoneNumber = `${IO.substr(0, 4)}-${IO.substr(4, 4)}-${IO.substr(8)}`
    const rep = msg.message?.extendedTextMessage?.contextInfo
    const media = msg.message?.imageMessage
    const fullText = msg.message?.conversation ||
                         msg?.message?.extendedTextMessage?.text ||
                         msg?.message?.imageMessage?.caption ||
                         msg?.message?.videoMessage?.caption
    const key = {
      remoteJid: id,
      id: rep?.stanzaId || 'not found',
      fromMe: false,
      participant: rep?.participant || 'not found'
    }
    console.log(m)
    if (msgPrefix === cfg.prefix) {
      console.log(m.type, { id, cmd, args, phoneNumber, user, rep })
      for (const command of commands) {
        if (command.default.cmd.test(cmd)) {
          try {
            if (cfg.loadingMsg) {
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
    console.log(`Message from ${user}\n`, fullText || msg?.message?.extendedTextMessage?.text, '\n')
    console.log('replying to', msg?.key?.remoteJid, '\n')
  }
}

export default processMessage
