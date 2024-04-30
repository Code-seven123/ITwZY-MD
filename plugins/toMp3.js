import ffmpeg from "fluent-ffmpeg"
import fs from "fs"
import { fileURLToPath } from "url"
import { dirname, join } from "path"
import { downloadMediaMessage, downloadContentFromMessage } from "@whiskeysockets/baileys"
import MAIN_LOGGER from "../lib/logger.js"

const logger = MAIN_LOGGER.child({})

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

function rand(min, max){
  return Math.floor(Math.random() * (max - min + 1)) + min
}

async function toMp3(){
  return new Promise((resolve, reject) => {
    const outputPath = join(__dirname, `../temp/${rand(1000000, 99999999)}.mp3`)
    ffmpeg(join(__dirname, "../temp/video.mp4"))
      .toFormat("mp3")
      .save(outputPath)
      .on("error", (err) => reject(`Error converting file: ${err}`))
      .on("end", () => resolve(outputPath))
  })
}

async function cleanupFiles() {
  try {
    const files = fs.readdirSync(join(__dirname, "../temp"))
    for (const file of files) {
      fs.unlinkSync(join(__dirname, "../temp", file))
    }
  } catch (err) {
    console.error("Error cleaning up files:", err)
  }
}

const getFileBuffer = async (quotedMessage) => {
  const stream = await downloadContentFromMessage(quotedMessage, "buffer")
  let buffer = Buffer.from([])
  for await (const chunk of stream) {
    buffer = Buffer.concat([buffer, chunk])
  }
  return buffer
}

async function bufferDownload(m){
  const messageType = Object.keys(m.message)[0]
  if(messageType === "videoMessage") {
    const buffer = await downloadMediaMessage(
      m,
      "buffer",
      { },
      {
        logger,
      }
    )
    return buffer
  } else {
    const buff = await getFileBuffer(m.message.extendedTextMessage.contextinfo.quotedMessage.videoMessage)
    console.log("Quoted message")
    return buff
  }
}

const handler = async (conn, { id }, m) => {
  const messageType = Object.keys(m.message)[0]
  if (messageType === "videoMessage") {
    const buffer = await bufferDownload(m)
    fs.writeFile(join(__dirname, "../temp/video.mp4"), buffer, async (err) => {
      if (err) {
        conn.sendMessage(id, { text: `${err}` })
      } else {
        try {
          const data = await toMp3()
          console.log(data)
          const outBuffer = fs.readFileSync(data)
          await conn.sendMessage(id, { 
          	audio: outBuffer,
          	mimetype: "audio/mpeg"
          })
        } catch (err) {
          conn.sendMessage(id, { text: `Error converting video to audio: ${err}` })
        } finally {
          await cleanupFiles()
        }
      }
    })
  }
}

handler.cmd = /^(tomp3)$/i
handler.desc = "convert mp4 to mp3"
handler.category = "editor"

export default handler
