import { searchMusics } from "node-youtube-music"
import { wait } from "../lib/utils.js"
import { prefix } from "../lib/config.js"
import bailesy from "@whiskeysockets/baileys"
const handler = async (conn, { id, args }, m) => {
  if(args[0] !== undefined){
    const musics = await searchMusics(args.join(" "))
    const data = []
    const rows = []
    let no = 1
    for( const music of musics ){
      const ytid = music?.youtubeId
      const title = music?.title
      const label = music?.duration.label
      const album = music?.album
      const artists = []
      for( const art of music.artists ) {
        artists.push(`- ${art.name}`)
      }
      data.push(`*No*: ${no}\n*Youtube ID*: ${ytid}\n*Title Music*: ${title}\n*artists*: \n${artists.join("\n")}\n*Album*: ${album}\n*Duration*: ${label}\n`)
      rows.push({
        header: `${no}. ${title}`,
        title: `${prefix}yt2 https://youtu.be/${ytid} audio`,
        id: "id"
      })
      no += 1
    }
    const list = {
      title: "Music list",
      sections: [
        {
          title: "music",
          rows: rows
        }
      ]
    }
    let msg = bailesy.generateWAMessageFromContent(id, {
      viewOnceMessage: {
        message: {
          "messageContextInfo": {
            "deviceListMetadata": {},
            "deviceListMetadataVersion": 2
          },
          interactiveMessage: bailesy.proto.Message.InteractiveMessage.create({
            body: bailesy.proto.Message.InteractiveMessage.Body.create({
              text: `${musics.length} music files retrieved. \nUse the command number to select which music to download, and use the 'end' argument to stop the command.\nExample:\n${prefix}no 1\n${prefix}no end\n\n` + data.join("\n")
            }),
            nativeFlowMessage: bailesy.proto.Message.InteractiveMessage.NativeFlowMessage.create({
              buttons: [
                {
                  "name": "single_select",
                  "buttonParamsJson": JSON.stringify(list)
                }
              ]
            })
          })
        }
      }
    }, {})
    await conn.relayMessage(id, msg.message, {
      messageId: msg.key.id,
      quoted: m
    })
  } else {
    await conn.sendMessage(id, { text: "title not found" })
  }
}

handler.cmd = /^(searchmusic|music)$/i
handler.desc = "Use searchmusic to get the YouTube ID, then use ytdl with the YouTube ID to get the video, and finally convert the video to a song using tomp3."
handler.category = "download"
handler.args = "<title>"

export default handler
