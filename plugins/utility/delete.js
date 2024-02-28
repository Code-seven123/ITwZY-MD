const handler = async (conn, { id, reply }, m) => {
  const del = await conn.sendMessage(id, { delete: reply })
  await conn.sendMessage(id, { text: 'deleting message.'}, { quoted: m })
}

handler.cmd = /^(del|delete|hapus)$/i
handler.desc = 'delete message'
handler.category = 'utility'
//handler.args = null
handler.admin = true


export default handler
