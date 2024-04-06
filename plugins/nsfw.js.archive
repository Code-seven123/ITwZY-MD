import fetch from 'node-fetch'

const handler = async (conn, { id }, m) => {
  const api = await fetch('https://api.waifu.pics/nsfw/waifu')
  const data = await api.json()
  await conn.sendMessage(id, { image: { url: data.url } }, { quoted: m })
}

handler.cmd = /^(nsfw)$/i
handler.desc = 'gacha waifu'
handler.category = 'anime'
handler.admin = false
export default handler
