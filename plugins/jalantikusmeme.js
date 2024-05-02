import { JalanTikusMeme } from "dhn-api"

const handler = async (conn, { id }, m) => {
  const data = await JalanTikusMeme() 
  await conn.sendMessage(id, { image: {  url: data }, caption: "Meme by jalan tikus" })
}
handler.cmd = /^(memejal)$/i 
handler.desc = "meme by jalan tikus" 
handler.category = "fun"
export default handler
