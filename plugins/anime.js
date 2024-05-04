import fetch from "node-fetch"
import { randomInt } from "../lib/utils.js"

async function gacha(args){
  const apiUrl = "https://api.waifu.im/search"

  const params = {
    included_tags: args
  }

  const URLparams = new URLSearchParams()

  for ( const key in params ){
    URLparams.append(key, params[key])
  }
  const headers = new Headers()
  headers.append("Accept-Version", "v5")


  const api = await fetch(`${apiUrl}?${URLparams.toString()}`, { headers })
  const result = await api.json()
  if("detail" in result) return { text: result.detail }
  const no = (result?.images.length === 1) ? 0 : randomInt(0, result?.images?.length)
  const data = result?.images[no]
  console.log(URLparams.toString())
  const tags = []
  for( const tag of data.tags ){
    tags.push(tag?.name)
  }
  return {
    image: { url: data?.url },
    caption: `URL: ${data?.url}\nArtist: ${data?.artist?.name}\nSource: ${data?.source}\nTags: ${tags.join(", ")}`
  }
}

const handler = async (conn, { id, args }, m) => {
  await m.reply(id, "Getting data...")
  try {
    const data = await gacha(args)
    await conn.sendMessage(id, data, { quoted: m })
  } catch (e) {
    await m.reply(id, `Error getting data: ${e}`)
  }
}

handler.cmd = /^(anime)$/i
handler.desc = "*waifu by tags*, \nTags information\n18+ content tags : \n- ero\n- ass\n- hentai\n- milf\n- oral\n- paizuri\n- ecchi\nNot 18+ content tags :\n- waifu\n maid\n- marin-kitagawa\n- mori-calliope\n- raiden-shogun\n- oppai\n- selfies\n- uniform\n- kamisato-ayaka"
handler.category = "anime"
handler.args = "<tags>"


export default handler
