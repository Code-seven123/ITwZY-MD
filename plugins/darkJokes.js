import { Darkjokes } from 'dhn-api'
const handler = async (conn, { id, reply }, m) => {
  const data = await Darkjokes()
  await conn.sendMessage(id, { image: { url: data } })

}

handler.cmd = /^(darkjokes)$/i

handler.desc = "darkjokes"
handler.category = "fun"

export default handler
