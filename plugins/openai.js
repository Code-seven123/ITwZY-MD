import fetch from "node-fetch"
import { aiKey } from "../lib/config.js"

const handler = async (conn, { args, id }, m) => {
  const body = {
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: args.join(" ")
      }
    ]
  }

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${aiKey}`
    },
    body: JSON.stringify(body)
  })
  const completion = await res.json()
  if(completion?.choices != undefined) {
    for( const result of completion.choices ){
      const msgResult = result?.message?.content | completion?.error?.message
      const role = result?.message?.role | ""
      await conn.sendMessage(id, { text: "`" + role.toUpperCase() + "` \n" + msgResult }, { quoted: m })
    }
  } else {
    await conn.sendMessage(id, { text: completion?.error?.message }, { quoted: m })
  }
}

handler.cmd = /^(tanyaai|ai|how)$/i
handler.desc = "chat gpt command"
handler.category = "tools"
handler.args = "<question>"

export default handler
