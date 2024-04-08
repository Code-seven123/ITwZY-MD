const handler = async (conn, { user, id, args, group, personalId }, m) => {
  if(group?.status){
    if(args[0] !== undefined && args[0] !== null) {
      const result = await conn.onWhatsApp(args[0].slice(1))
      const response = await conn.groupParticipantsUpdate(
        id,
        [result?.jid],
        "remove"
      )
      await conn.sendMessage(id, { text: `User $${args[0]} kicked from groip`, mentions: [result?.jid]})
    } else {
      await m.reply(id, "Argument 1 not found")
    }
  } else {
    await m.reply(id, "Use command in group")
  }
}

handler.cmd = /^(kick)$/i
handler.desc = "!ping pong"
handler.category = "Group"
handler.args = "<mention>"
handler.admin = true

export default handler
