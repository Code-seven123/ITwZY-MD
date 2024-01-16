const handler = async (conn, { user, id, reply }, m) => {
  await conn.sendMessage(id, { text: 'deleting message.'})
  await conn.sendMessage(id, { delete: reply })

}

handler.cmd = 'del'
handler.desc = 'delete message'
handler.category = 'utility'
handler.args = null

export default handler
