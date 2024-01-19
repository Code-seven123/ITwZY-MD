import { bucin } from '@bochilteam/scraper'

const handler = async (conn, { id }, m) => {
  const text = await bucin()
  await conn.sendMessage(id, { text: text }, { quoted: m })
}

handler.cmd = 'bucin'
handler.desc = 'kata kata bucin bot'
handler.category = 'text'
handler.args = null

export default handler
