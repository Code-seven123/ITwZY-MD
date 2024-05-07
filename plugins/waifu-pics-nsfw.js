import fetch from 'node-fetch'

const handler = async (conn, { commandName, id }, m) => {
  const words = ["waifu", "neko", "trap", "blowjob"]
  const type = words.find(i => i == commandName.toLowerCase().slice(0, -2))
  const api = await fetch(`https://api.waifu.pics/nsfw/${type}`)
  const data = await api.json()
  if(type == "blowjob"){
    await conn.sendMessage(id, { video: { url: data.url }}, { quoted: m })
  } else {
    await conn.sendMessage(id, { image: { url: data.url } }, { quoted: m })
  }
}

handler.cmd = /^(waifu18|neko18|trap18|blowjob18)$/i
handler.desc = 'gacha waifu'
handler.category = 'anime18'
handler.admin = true

export default handler
