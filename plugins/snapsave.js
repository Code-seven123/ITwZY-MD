import { snapsave } from "@bochilteam/scraper"

const handler = async (conn, { id, args }, m) => {
  const url = args[0]
  const data = await snapsave(url)
  for ( const video of data ){
    await conn.sendMessage(id, {
      video: {
        url: video.url
      }
    }, { quoted: m })
  }
}

handler.cmd = /^(snapsave|ig|snap)$/i
handler.desc = "FB & IG downloader"
handler.category = "download"
handler.args = "<url>"

export default handler
