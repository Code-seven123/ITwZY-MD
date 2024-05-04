import { limit } from "../lib/config.js"

const handler = async (conn, { id, adminControl, personalId, args}, m) => {
  const data = adminControl.penalti[personalId] || { count: "Not found" }
  const freeLimit = limit - data?.count <= 0 ? 0 : limit - data?.count
  await m.reply(id, `Your limit ${freeLimit}`)
}

handler.cmd = /^(limit)$/i
handler.desc = "check my limit"
handler.category = "utility"
handler.noLimit = true

export default handler
