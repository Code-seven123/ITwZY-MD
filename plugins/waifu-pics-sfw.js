import fetch from "node-fetch"

const handler = async (conn, { id, commandName }, m) => {
  const words = [
    "waifu",
    "neko",
    "shinobu",
    "megumin",
    "bully",
    "cuddle",
    "cry",
    "hug",
    "awoo",
    "kiss",
    "lick",
    "pat",
    "smug",
    "bonk",
    "yeet",
    "blush",
    "smile",
    "wave",
    "highfive",
    "handhold",
    "nom",
    "bite",
    "glomp",
    "slap",
    "kill",
    "happy",
    "dance",
    "cringe"
  ]
  const type = words.find(i => i == commandName.toLowerCase())
  const api = await fetch(`https://api.waifu.pics/sfw/${type}`)
  const data = await api.json()
  await conn.sendMessage(id, { image: { url: data.url } }, { quoted: m })
}

handler.cmd = /^(waifu|neko|shinobu|megumin|bully|cuddle|cry|hug|awoo|kiss|lick|pat|smug|bonk|yeet|blush|smile|wave|highfive|handhold|nom|bite|glomp|slap|kill|kick|happy|wink|poke|dance|cringe)$/i
handler.desc = "gacha waifu"
handler.category = "anime"

export default handler
