import fetch from "node-fetch"

const handler = async (conn, { id }, m) => {
  const api = await fetch("https://api.waifu.pics/sfw/waifu")
  const data = await api.json()
  await conn.sendMessage(id, { image: { url: data.url } }, { quoted: m })
}

handler.cmd = /^(waifu)$/i
handler.desc = "gacha waifu"
handler.category = "anime"

export default handler
