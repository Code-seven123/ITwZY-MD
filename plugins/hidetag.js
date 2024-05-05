const handler = async (conn, { id, reply, storage }, m) => {
  let msg = null
  if(reply?.remoteJid !== undefined){
    msg = storage.messages[reply.remoteJid].get(reply?.id)
  } else {
    msg = m
  }
  const { participants } = await conn.groupMetadata(id) || id
  const userId = []
  for( const all of participants ){
    userId.push(all.id)
  }
  await conn.sendMessage(id, { text: "`@everyone`", mentions: userId }, { quoted: msg || m })
}

handler.cmd = /^(hidetag)$/i
handler.desc = "Mention all member"
handler.category = "utility"
export default handler
