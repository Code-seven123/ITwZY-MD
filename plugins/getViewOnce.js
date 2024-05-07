import {
  downloadContentFromMessage
} from "@whiskeysockets/baileys"

async function downloadMedia(msg){
  const keys = Object.keys(msg)
  if(keys[0] === "imageMessage"){
    const stream = await downloadContentFromMessage(msg?.imageMessage, "image")
    let buffer = Buffer.from([])
    for await ( const chunk of stream ){
      buffer = Buffer.concat([buffer, chunk])
    }
    return { image: buffer, caption: `succes getting content\n ${msg?.imageMessage?.caption || ""}` }
  } else if(keys[0] === "videoMessage"){
    const stream = await downloadContentFromMessage(msg?.videoMessage, "video")
    let buffer = Buffer.from([])
    for await ( const chunk of stream ){
      buffer = Buffer.concat([buffer, chunk])
    }
    return { video: buffer, caption: `succes geting content\n ${msg?.videoMessage?.caption || ""}` }
  } else {
    return false
  }
}
const handler = async (conn, { id, reply, storage }, m) => {
  const obj = storage.messages[reply.remoteJid]
  const msg = obj.get(reply?.id)
  if(msg == undefined){
    await m.reply(id, "Not geting data")
  } else if(msg?.message?.viewOnceMessageV2 == undefined){
    await m.reply(id, "Please reply view once message")
  } else {
    const viewOnceMessage = msg?.message?.viewOnceMessageV2?.message
    const result = await downloadMedia(viewOnceMessage)
    if(result == false){
      await m.reply(id, "It doesn't support media that are not images or videos.")
    } else {
      await conn.sendMessage(id, result, { quoted: msg })
    }
  }
}

handler.cmd = /^(getviewonce)$/i
handler.desc = "Getting media from view once message"
handler.category = "utility"


export default handler
