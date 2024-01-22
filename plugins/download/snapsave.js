import { snapsave } from '@bochilteam/scraper-sosmed'
/*import Axios from 'axios'
import fs from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
function fakeName() {
  const min = 10000000
  const max = 99999999
  const randomInRange = Math.floor(Math.random() * (max - min + 1)) + min
  return `${randomInRange}.mp4`
}*/

const handler = async (conn, { id, args }, m) => {
  const url = args[0]
  const data = await snapsave(url)
  /*  const path = join(__dirname, '../../temp/' + fakeName())
  console.log(path)*/
  for ( const video of data ){
    await conn.sendMessage(id, {
      text: 'your link video \n' + video.url
    }, { quoted: m })
    /*    const writer = fs.createWriteStream(path)
    const res = await Axios({
      url: video.url,
      method: 'GET',
      responseType: 'stream',
    })
    res.data.pipe(writer)
    await new Promise((resolve, reject) => {
      writer.on('finish', async () => {
        await conn.sendMessage(id, {
          video: path,
          caption: 'your package ' + user,
          gifPlayback: true
        }, { quoted: m })
      })
      writer.on('error', reject)
    })*/
  }
}

handler.cmd = /^(snapsave|fb|ig|snap)$/i
handler.desc = 'FB & IG downloader'
handler.category = 'download'
handler.args = '<url>'

export default handler
