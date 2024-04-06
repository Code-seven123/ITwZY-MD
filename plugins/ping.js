const handler = async (conn, { user, id }, m) => {
  await conn.sendMessage(id, { text: `pong \n\n attack by _${user}_` }, { quoted: m })
}

handler.cmd = /^(ping|test)$/i
handler.desc = "!ping pong"
handler.category = "utility"
export default handler
