const handler = async (conn, m) => {
  return { conn, m }
}

handler.cmd = "test"
handler.desc = 'test'

export default handler
