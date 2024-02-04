const handler = async (conn, { id, reply }, m) => {
  await conn.sendMessage(id, { text: 'deleting message.'}, { quoted: m })
  const msg = await conn.readMessages([reply])
  await conn.sendMessage(id, { delete: msg })
}

handler.cmd = /^(del|delete|hapus)$/i
handler.desc = 'delete message'
handler.category = 'utility'
//handler.args = null

export default handler
