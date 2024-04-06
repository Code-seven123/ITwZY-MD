import fetch from "node-fetch"

const handler = async (conn, {  id }, m) => {

  const shorturl = await fetch("https://animechan.xyz/api/random")

  const json = await shorturl.json()

  const text = `${json.quote}\nBy ${json.character} ( ${json.anime} )`
  await conn.sendMessage(id, { text: text }, { quoted: m })

}

handler.cmd = /^(animequotes)$/i

handler.desc = "quotes from anime"

handler.category = "anime"

export default handler