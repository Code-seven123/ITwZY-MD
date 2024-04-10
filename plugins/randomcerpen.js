import { Cerpen } from 'dhn-api'
const handler = async (conn, { id }, m) => {
  const data = await Cerpen()
  await conn.sendMessage(id, { text: data })
}
handler.cmd = /^(cerpen)$/i
handler.desc = "Random cerpen by dhn api"
handler.category = "fun"
export default handler
