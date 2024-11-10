import { googleImage } from "@bochilteam/scraper"

function rnd(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

const handler = async (conn, { user, id, args }, m) => {
  const pic = await googleImage(args.join[" "])
  const data = pic[rnd(0, pic.length)]
  await conn.sendMessage(id, { 
    image: { url: data }
  }, { quoted: m })
}

handler.cmd = /^(googlepicture|gimage|googleimage)$/i
handler.desc = "random image from query"
handler.category = "download"
handler.args = "<query>"

export default handler
