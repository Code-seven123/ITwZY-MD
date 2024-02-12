import fs from 'fs'
import ytdl from 'ytdl-core'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

async function cleanupFiles() {
  try {
    const files = fs.readdirSync(join(__dirname, '../../temp'))
    for (const file of files) {
      fs.unlinkSync(join(__dirname, '../../temp', file))
    }
  } catch (err) {
    console.error('Error cleaning up files:', err)
  }
}
const handler = async (conn, { id, args }, m) => {
  try {
    const output = join(__dirname, `../../temp/${new Date()}.mp4`)
	  const url = args[0]
    const stream = fs.createWriteStream(output)
    const data = await ytdl.getInfo(url)
    const title = data?.videoDetails?.author?.title 
    	|| data?.videoDetails?.author?.user
    const user = data?.videoDetails?.author

    const cap = `*Youtuber*: ${user}\n*Judul*: ${title}`
    await ytdl(url).pipe(stream)
    stream.on('error', async (err) => {
      await conn.sendMessage(id, { tex5: `${err}` })
    })
    stream.on('finish', async() => {
      await conn.sendMessage(id, { video: {
        url: output
      }, caption: cap }, { quoted: m })
    })
  } catch (e) {
    await conn.sendMessage(id, { text: `${e}` })
  } finally {
    await cleanupFiles()
  }
}

handler.cmd = /^(youtube|yt|ytdl)$/i
handler.desc = 'youtube downloader'
handler.category = 'download'
handler.args = '<url>'

export default handler
