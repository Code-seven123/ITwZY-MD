import { downloadMediaMessage } from "@whiskeysockets/baileys"
import ffmpeg from "fluent-ffmpeg"
import MAIN_LOGGER from "../lib/logger.js"
import fs from "fs"
import { fileURLToPath } from "url"
import { dirname, join } from "path"

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
  if (messageType === "imageMessage") {
    const buffer = await downloadMediaMessage(
      m,
      "buffer",
      {},
      {
        logger,
      }
    )
    fs.writeFile(join(__dirname, "../temp/gambar.jpg"), buffer, async (err) => {
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
  } else if (messageType === "videoMessage" && gif.includes("gifAttribution")) {
    const buffer = await downloadMediaMessage(
      m,
      "buffer",
      {},
      {
        logger,
      }
    )
    fs.writeFile(join(__dirname, "../temp/gif.mp4"), buffer, async (err) => {
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
    await conn.sendMessage(id, { text: "Image Or GIF Not Found" })
  }
}

handler.cmd = /^(s|stiker|scv)$/i
handler.desc = "sticker maker"
handler.category = "utility"
handler.args = null

export default handler
