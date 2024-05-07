import { runExec } from '../lib/exec.js'
const handler = async (conn, { id }, m) => {
  const data = await runExec("fortune")
  await conn.sendMessage(id, { text: `${data}` })
}

handler.cmd = /^(fortune)$/i
handler.desc = "Random quotes and fortunes"
handler.category = "words"


export default handler
