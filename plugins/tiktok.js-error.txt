import { tiktokdl } from "@bochilteam/scraper"

const handler = async (conn, { id, args }, m) => {
  const url = args[0]
  const data = await tiktokdl(url)
  await conn.sendMessage(id, {
    video: {
      url: data.video.no_watermark || data.video.no_watermark_hd
    }
  }, { quoted: m })
  await conn.sendMessage(id, { text: `name: ${data.author.nickname} \n id: ${data.author.unique_id}` })
}

handler.cmd = /^(tiktok)$/i
handler.desc = "Tiktok downloader"
handler.category = "download"
handler.args = "<url>"

export default handler
