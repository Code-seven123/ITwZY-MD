import fetch from 'node-fetch'

const handler = async (conn, { id }, m) => {
  const api = await fetch('https://api.waifu.pics/sfw/waifu')
  const data = await api.json()
  console.log(data.url)
/*  try{*/
	  await conn.sendMessage(id, { image: {
	    url: data.url
	  } })
/*  } catch (e) {
     console.error(e)
  }*/
//  await conn.sendMessage(id, { text: '🥰🥰🥰🥰' })
}

handler.cmd = /^(waifu|anime)$/i
handler.desc = 'gacha waify'
handler.category = 'anime'
handler.args = null

export default handler
