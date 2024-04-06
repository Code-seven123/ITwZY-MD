const handler = async (conn, { user, id, commandName, adminControl, args }, m) => {
  if(/^(promote)$/i.test(commandName)) {
    if(args[0] !== undefined && args[1] !== undefined ) {
      const result = await conn.onWhatsApp(args[1].slice(1))
      await conn.sendMessage(id, { text: `Promote user ${args[1]} to ${args[0]}`, mentions: [result[0].jid] })
      const res = await adminControl.promote.create(args[0], result[0].jid)
      if(res === "ok"){
        await conn.sendMessage(id, { text: `Promote user ${args[1]} to ${args[0]}`, mentions: [result[0].jid] })
      } else {
        await conn.sendMessage(id, { text: `Failed promote user ${args[1]} to ${args[0]}`, mentions: [result[0].jid] })
      }
    } else {
      await m.reply(id, "Argument not found")
    }
  } else if(/^(demote)$/i.test(commandName)) {
    if(args[0] !== undefined && args[1] !== undefined ) {
      const result = await conn.onWhatsApp(args[1].slice(1))
      await conn.sendMessage(id, { text: `Demote user ${args[1]} to ${args[0]}`, mentions: [result[0].jid] })
      const res = await adminControl.promote.delete(args[0], result[0].jid)
      if(res === "ok"){
        await conn.sendMessage(id, { text: `Demote user ${args[1]} to ${args[0]}`, mentions: [result[0].jid] })
      } else {
        await conn.sendMessage(id, { text: `Failed demote user ${args[1]} to ${args[0]}`, mentions: [result[0].jid] })
      }
    } else {
      await m.reply(id, "Argument not found")
    }
  } else if(/^(seemote)$/i.test(commandName)) {
    if(args[0] !== undefined && args[1] !== undefined ) {
      const result = await conn.onWhatsApp(args[1].slice(1))
      const { id: usr, status: permission } = await adminControl.promote.read(result[0].jid)
      await m.reply(id, `List permision user\n\n *ID*: ${usr}\n*status*: ${permission}`)
    } else {
      await m.reply(id, "Argument not found")
    }
  } else {
    await m.reply(id, "Error: command not matched")
  }
}

handler.cmd = /^(promote|demote|seemote)$/i
handler.desc = "permisiion control, status (admin or premium)"
handler.category = "utility"
handler.args = "<status> + <phone number>"
handler.admin = true

export default handler
