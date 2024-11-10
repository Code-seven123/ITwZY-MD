import { lyrics } from "@bochilteam/scraper"


const handler = async (conn, { id, args }, m) => {
  const text = args.join(" ")
  const data = await lyrics(text)
	
  const result = `*Judul Lagu* : ${data.title}\n` + `*Author* : ${data.author}\n` + `*link* : ${data.link}` + `\n\n Lyrics : \n ${data.lyrics}`
  
  await conn.sendMessage(id, { text: result }, { quoted: m })
}

handler.cmd = /^(lirik|lyrics|lyric)$/i
handler.desc = "lirik lagu"
handler.category = "google"
handler.args = "<judul>"

export default handler
