import { KiryuuSearch } from "dhn-api"

const handler = async (conn, { id, args }, m) => {
  if(args == []) return
  const data = await KiryuuSearch(args.join(" "))
  if(Array.isArray(data)) {
    const txt = data.map(i => `Status: ${i?.status}\n`
      + `Creator: ${i?.creator}\n`
      + `Title: ${i?.manga_name?.replaceAll('\t', '')}\t.R ${i?.manga_rating}\n`
      + `Latest chapter: ${i?.manga_eps}\n`
      + `URL: ${i?.manga_url}\n`
    )
    await conn.sendMessage(id, { 
      text: `Getting ${data?.length} komik.\n\n`+txt?.join("\n"),
    }, { quoted: m })
  } else {
    await conn.sendMessage(id, { text: `Failed search data: \n${data}` })
  }
  
}

handler.cmd = /^(kiryuSearch)$/i
handler.desc = "manga/manhwa/donghua kiryuu"
handler.category = "anime"
handler.args = "<title>"

export default handler
