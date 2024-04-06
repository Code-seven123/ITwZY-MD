const handler = async (conn, { id, reply }, m) => {
  const del = await conn.sendMessage(id, { delete: reply })

}

handler.cmd = /^(del|delete|hapus)$/i
handler.desc = "delete message"
handler.category = "utility"
//handler.args = null
handler.admin = true


export default handler
