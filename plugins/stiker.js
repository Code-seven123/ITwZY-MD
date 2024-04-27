import {
  downloadMediaMessage,
  downloadContentFromMessage
} from "@whiskeysockets/baileys"
import ffmpeg from "fluent-ffmpeg"
import MAIN_LOGGER from "../lib/logger.js"
import fs from "fs"
import { fileURLToPath } from "url"
import { dirname, join } from "path"
import { inspect } from 'util'

const logger = MAIN_LOGGER.child({})

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

async function toMp3(file) {
  return new Promise((resolve, reject) => {
    const outputPath = join(__dirname, `../temp/${rand(1000000, 99999999)}.webp`)
    ffmpeg(join(__dirname, `../temp/${file}`))
      .addOutputOptions([
        "-vcodec", "libwebp", "-vf",
        "scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15, pad=320:320:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse"
      ])
      .toFormat("webp")
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

const handler = async (conn, { id }, m) => {
  const messageType = Object.keys(m.message)[0]
  const gif = Object.keys(m.message?.videoMessage || { text: "undefined" })
  let mediaBuffer = null
  let mediaType = null
  if(messageType === "extendedTextMessage"){
    const quotedMessage = m.message?.extendedTextMessage?.contextInfo?.quotedMessage
    const qutedGif = Object.keys(quotedMessage?.videoMessage|| { text: "undefined" })
    if(Object.keys(quotedMessage)[0] === "imageMessage"){
      const stream = await downloadContentFromMessage(quotedMessage?.imageMessage, "image")
      let buffer = Buffer.from([])
      for await ( const chunk of stream ){
        buffer = Buffer.concat([buffer, chunk])
      }
      mediaBuffer = buffer
      mediaType = "image"
    } else if(Object.keys(quotedMessage)[0] === "videoMessage" && qutedGif.includes("gifAttribution")) {
      const stream = await downloadContentFromMessage(quotedMessage?.videoMessage, "video")
      let buffer = Buffer.from([])
      for await ( const chunk of stream ){
        buffer = Buffer.concat([buffer, chunk])
      }
      mediaBuffer = buffer
      mediaType = "video"
    } else {
      await m.reply(id, "Quoted message not image or gif")
    }
  } else if(messageType === "imageMessage"){
    mediaBuffer = await downloadMediaMessage(
      m,
      "buffer",
      {},
      {
        logger,
        reuploadRequest: conn.updateMediaMessage
      }
    )
    mediaType = "image"
  } else if(messageType === "videoMessage" && gif.includes("gifAttribution")) {
    mediaBuffer = await downloadMediaMessage(
      m,
      "buffer",
      {},
      {
        logger,
        reuploadRequest: conn.updateMediaMessage
      }
    )
    mediaType = "video"
  } else {
    await m.reply(id, "Image or gif not found")
  }

  if(mediaBuffer != null){
    if(mediaType === "image"){
      fs.writeFile(join(__dirname, "../temp/gambar.jpg"), mediaBuffer, async (err) => {
        if (err) {
          await conn.sendMessage(id, { text: `${err}` })
        } else {
          try {
            const data = await toMp3("gambar.jpg")
            await conn.sendMessage(id, { sticker: { url: data } })
          } catch (e) {
            await conn.sendMessage(id, { text: `${e}` })
          } finally {
            await cleanupFiles()
          }
        }
      })
    } else if(mediaType === "video") {
      fs.writeFile(join(__dirname, "../temp/gif.mp4"), mediaBuffer, async (err) => {
        if (err) {
          await conn.sendMessage(id, { text: `${err}` })
        } else {
          try {
            const data = await toMp3("gif.mp4")
            await conn.sendMessage(id, { sticker: { url: data } })
          } catch (e) {
            await conn.sendMessage(id, { text: `${e}` })
          } finally {
            await cleanupFiles()
          }
        }
      })
    } else {
      await m.reply(id, "MediaType not mached")
    }
  } else {
    await m.reply(id, "Buffer not getting")
  }

}

handler.cmd = /^(s|stiker|scv)$/i
handler.desc = "sticker maker"
handler.category = "utility"
handler.args = null

export default handler
