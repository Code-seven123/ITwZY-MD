import { Couples } from "dhn-api" 
const handler = async (conn, { id }, m) => {
  const data = await Couples()
  await conn.sendMessage(id, { image: { url: data?.male }, caption: "Male" })
  await conn.sendMessage(id, { image: { url: data?.female }, caption: "female" })
}
handler.cmd = /^(couple)$/i 
handler.desc = "Couple by dhn api" 
handler.category = "fun"
export default handler
