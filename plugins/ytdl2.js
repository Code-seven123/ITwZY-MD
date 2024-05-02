import ytdl from "../lib/ytdl-core.js"
import { prefix } from "../lib/config.js"
import axios from "axios"

async function getBuffer(url) {
  try {
    const response = await axios.get(url, {
      responseType: "arraybuffer" // Mengatur responseType menjadi 'arraybuffer'
    })
    return response.data // Mengembalikan buffer dari respon
  } catch (error) {
    console.error("Error fetching media:", error)
    throw error
  }
}

const handler = async (conn, { id, args }, m) => {
  if(args[0] == null && args[0] == undefined){
    await m.reply(id, "Args not found")
  } else {
    const { links, info } = await ytdl(args[0])
    const res = links.videos.map(item => item?.quality)
    const txt = `*Title*: ${info.title}\n` 
      + `*Duration*: ${info.parsedDuration}\n`
      + `*Author*: ${info.author}\n`
    const inf = (args[1] === "audio") ? "Please play audio in external not use whatsapp" : `Use ${prefix}down for download ${args[1]}` + `, for argument is <resolusi> : \n- ${res.join("\n- ")}`
    await conn.sendMessage(id, { text: txt + inf}, { quoted: m})
    if(args[1] === "audio"){
      const link = await links.audios[0].url()
      const buffer = await getBuffer(link)
      await conn.sendMessage(id, { audio: buffer, mimetype: "audio/mpeg" })
    } else if(args[1] === "video"){
      return {
        mode: "quest",
        videos: links.videos
      }
    } else {
      await m.reply(id, "Type for media not found")
    }
  }
}

handler.answer = async(data, conn, { commandName, args, id }, m) => {
  if(args[0] === "end") return "ok"
  if(args[0] !== null && args[0] !== undefined){
    const videos = data.find(item => item.videos)
    const setResolusi = videos?.videos.find(item => item.quality === args[0])
    if(setResolusi !== undefined && setResolusi !== null){
      const down = await setResolusi.url()
      await conn.sendMessage(id, { video: { url: down }, caption: `Size: ${setResolusi.size}` }, { quoted: m })
      return "ok"
    } else {
      await m.reply(id, "Resolusi is null")
    }
  } else {
    await m.reply(id, "Resolusi is null")
  }
}

handler.cmd = /^(ytdl2|yt2)$/i
handler.desc = "type : audio or video"
handler.category = "download"
handler.args = "<url> + <type>"
handler.answerCommand = /^(down)$/i



export default handler
