import fs from "fs"
import ytdl from "ytdl-core"
import { dirname, join } from "path"
import { fileURLToPath } from "url"
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

async function cleanupFiles() {
  try {
    const files = fs.readdirSync(join(__dirname, "../temp"))
    for (const file of files) {
      fs.unlinkSync(join(__dirname, "../temp", file))
    }
  } catch (err) {
    console.error("Error cleaning up files:", err)
  }
}

const handler = async (conn, { args, id }, m) => {
  const url = args[0]
  if(url) {
    try {
      const data = await ytdl.getInfo(url)

      //Info send
      const res = data?.player_response?.videoDetails
      const caption = `*Author*: ${res.author || "Not found"}\n`
        + `*Title*: ${res.title || "Not Found"}\n`
        + `*Description*: ${res.shortDescription || "Not found"}\n`
      await conn.sendMessage(id, { text: caption }, { quoted: m })

      //Video download
      const format = await ytdl.chooseFormat(data.formats,{quality:"18"})
      const outputFilePath = join(__dirname, `../temp/${data.videoDetails.title}.mp4`)
      const outputStream = fs.createWriteStream(outputFilePath)
      await ytdl.downloadFromInfo(data, { format: format }).pipe(outputStream)
      outputStream.on("finish", async () => {
        await conn.sendMessage(id, { video: {  url: outputFilePath} })
        await conn.sendMessage(id, { text: "Finished" })
      })
    } catch (e) {
      await conn.sendMessage(id, { text: `${e}` })
      console.error(e)
    } finally {
      await cleanupFiles()
    }
  } else {
    await conn.sendMessage(id, { text: "link youtube not defined" })
  }
}

handler.cmd = /^(yt|ytdl)$/i
handler.desc = "youtube downloader"
handler.category = "download"
handler.args = "<link>"

export default handler
