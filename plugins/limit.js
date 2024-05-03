import { limit } from '../lib/config.js'

const handler = async (conn, { id, adminControl, personalId, args}, m) => {
   const data = adminControl.penalti[personalId]
   await m.reply(id, `Your limit ${limit - data?.count}`)
}

handler.cmd = /^(limit)$/i
handler.desc = "check my limit"
handler.category = "utility"
handler.noLimit = true

export default handler
