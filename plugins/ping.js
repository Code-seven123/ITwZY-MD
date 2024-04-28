import os from 'os'
import { botName } from '../lib/config.js'
import fs from 'fs'
import { join } from 'path'
import { __dirname } from '../lib/utils.js'

function toGb(byte){
  return (byte / (1024 * 1024 * 1024)).toFixed(1)
}
function frontText(text) {
  const st = text.slice(0, 1).toUpperCase()
  const end = text.slice(1).toLowerCase()
  return st + end
}

const handler = async (conn, { user, id, storage }, m) => {
  const txt = `Testing system\n\n\n`
    + `🔴Ram: ${toGb(os.totalmem())} / ${toGb(os.totalmem() - os.freemem())}\n`
    + `🟢Free Ram: ${toGb(os.freemem())}\n`
    + `💻Os: ${os.platform() + ' ' + os.arch()}`
  const adReply = {
    text: txt,
    contextInfo: {
      externalAdReply: {
        title: `${frontText(botName).split('').join('.')} : Konnichiwa ${user}`,
        thumbnail: fs.readFileSync(join(__dirname, '../src/icon.jpg')),
        sourceUrl: "https://wa.me/6288222358226"
      }
    }
  }
  await conn.sendMessage(id, adReply, { quoted: m })
}

handler.cmd = /^(ping|test|tes)$/i
handler.desc = "testing"
handler.category = "utility"
export default handler
