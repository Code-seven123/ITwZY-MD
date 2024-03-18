import fs from 'fs'
import ytdl from 'ytdl-core'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

function rand(min, max){
  return Math.floor(Math.random() * (max - min + 1)) + min
}

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

const handler = async (conn, { args, id }, m) => {
  const url = args[0]
  if(url) {
    try {
      const data = await ytdl.getInfo(url)
      const res = data?.player_response?.videoDetails
      const caption = `*Author*: ${res.author || 'Not found'}\n`
			  + `*Title*: ${res.title || 'Not Found'}\n`
			  + `*Description*: ${res.shortDescription || 'Not found'}\n`
      await conn.sendMessage(id, { text: caption }, { quoted: m })
      const output = join(__dirname, `../../temp/${rand(99999999, 10000000000)}.mp4`)
      const stream = fs.createWriteStream(output)
      const video = await ytdl(url)
      video.pipe(stream)
      stream.on('finish', async () => {
        await conn.sendMessage(id, { video: {  url: output} })
        await conn.sendMessage(id, { text: 'Finished' })
      })
      video.on('end', async () => {
        await conn.sendMessage(id, { video: {  url: output} })
        await conn.sendMessage(id, { text: 'Finished' })
      })
    } catch (e) {
      await conn.sendMessage(id, { text: `${e}` })
      console.error(e)
    } finally {
      await cleanupFiles()
    }
  } else {
    await conn.sendMessage(id, { text: 'link youtube not defined' })
  }
}

handler.cmd = /^(yt|ytdl)$/i
handler.desc = 'youtube downloader'
handler.category = 'download'
handler.args = '<link>'

export default handler
