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

const handler = async (conn, { user, id }, m) => {
  const txt = `Testing system\n\n\n`
    + `🔴Ram: ${toGb(os.totalmem())} / ${toGb(os.totalmem() - os.freemem())}\n`
    + `🟢Free Ram: ${toGb(os.freemem())}\n`
    + `💻Os: ${os.platform() + ' ' + os.arch()}`
/*  const adReply = {
    text: txt,
    contextInfo: {
      externalAdReply: {
        title: `${frontText(botName).split('').join('.')} : Konnichiwa ${user}`,
        thumbnail: fs.readFileSync(join(__dirname, '../src/icon.jpg')),
        sourceUrl: "https://wa.me/6288222358226"
      }
    }
  }*/
  const adReply = {
    text: "Selamat Hari Raya Idul Fitri 1445 H. Dengan berakhirnya bulan suci Ramadhan semoga kita selalu dalam keadaan hati yang bersih dan saling memaafkan satu sama lain.",
    contextInfo: {
      externalAdReply: {
        title: `Idul Fitri 1445H`,
        thumbnail: fs.readFileSync(join(__dirname, '../src/gambar.jpg')),
        sourceUrl: "https://nasional.kompas.com/read/2024/04/09/16062411/kemenag-prediksi-idul-fitri-1445-h-jatuh-pada-rabu-besok"
      }
    }
  }
  await conn.sendMessage(id, adReply, { quoted: m })
}

handler.cmd = /^(ping|test|tes)$/i
handler.desc = "testing"
handler.category = "utility"
export default handler
