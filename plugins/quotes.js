import { Quotes } from "dhn-api"
const handler = async (conn, { id, reply }, m) => {
  const data = await Quotes()
  await conn.sendMessage(id, { text: `${data.quotes} \nBy ${data?.author}` })

}

handler.cmd = /^(quotes|quote)$/i

handler.desc = "Quotes"
handler.category = "fun"

export default handler
