import cfg from '../config.js'
import menu from './menu.js'
import fs from 'fs'
import { fileURLToPath } from 'url' 
import { dirname, join } from 'path' 

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const json = fs.readFileSync(join(__dirname, '../premium.json'))
const premi = JSON.parse(json)
const usePremi = process.argv.includes('--use-premium')
const groupOnly = process.argv.includes('--group')
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
    const args = fullText?.split(' ').slice(1)
    const key = {
      remoteJid: id,
      id: rep?.stanzaId || 'not found',
      fromMe: false,
      participant: rep?.participant || 'not found'
    }
    const userInGroup = (msg?.key?.participant === undefined) ? '' : msg?.key?.participant.split('@')[0] || ''
    const isGroup = id.endsWith('@g.us') || false
    const userPremi = (isGroup) ? userInGroup : IO
    const premium = typeof premi.user.find(item => item.number == userPremi) !== 'undefined'
    const admin = typeof cfg.owner.find(item => item.number == userInGroup) !== 'undefined'
    const config = {
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
    }
    
    if (msgPrefix === cfg.prefix) {
      for (const command of commands) {
        if (command.default.cmd.test(cmd)) {
          try {
            console.log('Commnad execute information\n', {
              id: id,
              commandName: cmd,
              args: args,
              phoneNumber: phoneNumber,
              user: user
            })
            console.log(user, ' status \n', {
              admin: admin,
              premium: premium,
              normal: (admin == false && premium == false)
            })
            if (cfg.loadingMsg) {
              await conn.sendMessage(id, { text: cfg.loadingMsgText })
            }
            if (/^(info)$/i.test(args[0])) {
              await conn.sendMessage(id, { text: `${command.default.desc}` }, { quoted: msg })
            } else if(groupOnly && !isGroup){
							await conn.sendMessage(id, { text: 'Your use private chat, this bot use group only, please use command in group' })
            } else if(usePremi && !premium){
              await conn.sendMessage(id, { text: "You are not premium user, please register with the admin to become a premium user." })
            } else if(!isGroup && !admin){
              await command.default(conn, config, msg)
            } else if(command.default.admin && admin && isGroup){
              await command.default(conn, config, msg)
            } else if(command.default.admin && !admin){
              await conn.sendMessage(id, { text: 'your not admin, this command for admin'})
            } else if(!command.default.admin) {
              await command.default(conn, config, msg) 
            } else {
              await conn.sendMessage(id, { text : 'Error'})
            }
            
            
            /*{
              await command.default(conn, config, msg)
            }*/
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
    console.log('replying to', msg?.key?.remoteJid, `\nType ${m.type}\nMessage from ${user} \n ${fullText}\n`)
  }
}

export default processMessage
