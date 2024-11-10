import { facebookdlv2 } from "@bochilteam/scraper"
const handler = async (conn, { args, id }, m) => {
  if(args !== undefined){
    const data = await facebookdlv2(args[0])
    const thumnail = data?.thumbnail
    const result = data?.result
    const video = result.find(item => item.quality === "360p")?.url
    await conn.sendMessage(id, { video: { url: video } }, { quoted: m })
  } else {
    await conn.sendMessage(id, { text: "link not found" })
  }
}

handler.cmd = /^(fb|fbdl)$/i
handler.desc = "facebok download versi 1"
handler.category = "download"
export default handler
