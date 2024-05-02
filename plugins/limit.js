import { limit } from '../lib/config.js'

const handler = async (conn, { id, adminControl, personalId, args}, m) => {
   const user = await conn.onWhatsApp(args[0].slice(1))

   if(user !== undefined){
     const data = adminControl.penalti[user[0].jid]
     await m.reply(id, `Your limit ${limit - data?.count}`)
   } else {
     const data = adminControl.penalti[personalId]
     await m.reply(id, `Your limit ${limit - data?.count}`)
   }
}

handler.cmd = /^(limit)$/i
handler.desc = "check my limit"
handler.category = "utility"
handler.noLimit = true

export default handler
