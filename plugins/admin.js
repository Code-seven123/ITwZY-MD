const handler = async (conn, { user, id, args, group }, m) => {
  if(group.status){
    if(args[0] !== undefined && args[1] !== undefined && args[0] !== null && args[1] !== null) {
      const result = await conn.onWhatsApp(args[1].slice(1))
      const response = await conn.groupParticipantsUpdate(
        id,
        [result?.jid],
        (args[0] === 'promote') ? "promote" : "demote"
      )
      await conn.sendMessage(id, { text: `User $${args[0]} ${(args[0] === 'promote') ? "promote" : "demote"} from groip`, mentions: [result?.jid]})
    } else {
      await m.reply(id, "Argument 1 and 2 not found")
    }
  } else {
    await m.reply(id, "Use command in group")
  }
}

handler.cmd = /^(admin)$/i
handler.desc = "add and remove group admin"
handler.category = "Group"
handler.args = "<promote / demote> + <mention>"

handler.admin = true

export default handler
