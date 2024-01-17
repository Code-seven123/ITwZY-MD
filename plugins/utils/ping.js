const handler = async (conn, { user, id }, m) => {
  await conn.sendMessage(id, { text: `pong \n\n attack by _${user}_` }, { quoted: m })
}

handler.cmd = 'ping'
handler.desc = '!ping pong'
handler.category = 'utility'
handler.args = null

export default handler
