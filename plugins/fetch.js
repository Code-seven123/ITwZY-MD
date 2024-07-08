import fetch from "node-fetch"

const handler = async (conn, { id, args}, m) => {
  if(args != null || args != undefined || args != [] || args.length >= 2) {
    if (["GET", "PUT", "DELETE", "POST"].find(i => i == args[0].toUpperCase()) == undefined) {
      return;
    }
    try {
      
      const json = await fetch(args[1], {
        method: args[0]?.toUpperCase(),
        headers: args[2] == null || undefined ? {} : args[2]
      })
      const result = await json.json()
      const obj = typeof result == "object" ? JSON.stringify(json) : result
      const txt = `Status: ${json?.status}"${json?.statusText}"`
        + `result: \n\n${obj}`
      await sendMessage(id, { text: txt }, { quoted: m })
    } catch(e) {
      await conn.sendMessage(id, { text: `Error fetching ${e?.message}` })
    }
  } else {
    await conn.sendMessage(id, { text: "args 1,2,3 not found" }, { quoted: m })
  }
}

handler.cmd = /^(fetch)$/i
handler.desc = "delete message"
handler.category = "tools"
handler.args = "<method, { GET, POST, PUT, DELETE }>+<url>+<header>"

export default handler

