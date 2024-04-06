import fetch from "node-fetch"

const handler = async (conn, { args, id }, m) => {

  const url = "https://cleanuri.com/api/v1/shorten"

  const data = new URLSearchParams({

    url: args.join(" ")

  })

  const options = {

    method: "POST",

    body: data

  }

  const shorturl = await fetch(url, options)

  const json = await shorturl.json()

  await conn.sendMessage(id, { text: `*Your short URL* \nURL: ${json.result_url}` }, { quoted: m })

}

handler.cmd = /^(shorturl|urlshorteners)$/i

handler.desc = "URL Shorteners by cleanuri"

handler.category = "utility"

export default handler