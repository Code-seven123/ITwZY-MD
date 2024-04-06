const handler = async (conn, { id, reply }, m) => {
  const { participants } = await conn.groupMetadata(id) || id
  const userId = []
  for( const all of participants ){
    userId.push(all.id)
  }
  await conn.sendMessage(id, { text: "`@everyone`", mentions: userId }, { quoted: m })
}

handler.cmd = /^(hidetag)$/i
handler.desc = "Mention all member"
handler.category = "utility"
export default handler
