import { searchMusics } from "node-youtube-music"

const handler = async (conn, { id, args }, m) => {
  if(args[0] !== undefined){
    const musics = await searchMusics(args.join(" "))
    const data = []
    for( const music of musics ){
      console.log(music)
      const ytid = music?.youtubeId
      const title = music?.title
      const label = music?.duration.label
      const album = music?.album
      data.push(`*Youtube ID*: ${ytid}\n*Title Music*: ${title}\n*Album*: ${album}\n*Duration*: ${label}\n`)
    }
    await conn.sendMessage(id, { text: data.join("\n") }, { quoted: m })
  } else {
    await conn.sendMessage(id, { text: "title not found" })
  }
}

handler.cmd = /^(searchmusic|music)$/i
handler.desc = "Use searchmusic to get the YouTube ID, then use ytdl with the YouTube ID to get the video, and finally convert the video to a song using tomp3."
handler.category = "download"
handler.args = "<title>"
export default handler
