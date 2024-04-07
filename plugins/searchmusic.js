import { searchMusics } from "node-youtube-music"
import { wait } from '../lib/utils.js'
import { prefix } from '../lib/config.js'

const handler = async (conn, { id, args }, m) => {
  if(args[0] !== undefined){
    const musics = await searchMusics(args.join(" "))
    const data = []
    const back = []
    for( const music of musics ){
      console.log(music)
      const ytid = music?.youtubeId
      const title = music?.title
      const label = music?.duration.label
      const album = music?.album
      data.push(`*Youtube ID*: ${ytid}\n*Title Music*: ${title}\n*Album*: ${album}\n*Duration*: ${label}\n`)
      back.push(ytid)
    }
    await conn.sendMessage(id, { text: data.join("\n") }, { quoted: m })
    return {
      mode: "quest",
      ytid: back
    }
  } else {
    await conn.sendMessage(id, { text: "title not found" })
  }
}

handler.answer = async(data, conn, { commandName, args, id }, m) => {
  const no = parseInt(args[0]) - 1
  const myData = data.find(item => item)
  const ytid = myData.ytid[no] || 'not found'
  await m.reply(id, `Youtube ID select no ${args[0]}, ID ${ytid}`)
  await conn.sendMessage(id, { text: `${prefix}ytdl ${ytid}` })
  return 'ok'
}

handler.cmd = /^(searchmusic|music)$/i
handler.desc = "Use searchmusic to get the YouTube ID, then use ytdl with the YouTube ID to get the video, and finally convert the video to a song using tomp3."
handler.category = "download"
handler.args = "<title>"
handler.answerCommand = /^(no)$/i

export default handler
