import os from "os"
import { botName } from "../lib/config.js"
import fs from "fs"
import { join } from "path"
import { __dirname, run } from "../lib/utils.js"
import { runExec } from "../lib/exec.js"

function toGb(byte){
  return (byte / (1024 * 1024 * 1024)).toFixed(1)
}
function frontText(text) {
  const st = text.slice(0, 1).toUpperCase()
  const end = text.slice(1).toLowerCase()
  return st + end
}

const handler = async (conn, { user, id, storage, personalId }, m) => {
  const json = await runExec("speedtest-cli --json")
  const speed = JSON.parse(json || {})
  const speedTxt = "\n\nfetched from speedtest.net\n" +
    + `📡ISP: ${speed?.client?.isp || "unknown"} (${speed?.client?.country || "unknown"})\n`
    + `📶Ping: ${speed?.ping || "00.00"} ms\n`
    + `⬆️Upload: ${(speed?.upload / 1000000).toFixed(2) || "00.00"} Mbps\n`
    + `⬇️Download: ${(speed?.download / 1000000).toFixed(2) || "00.00"} Mbps`
  const txt = "Testing system\n\n\n"
    + `🔴Ram: ${toGb(os.totalmem())} / ${toGb(os.totalmem() - os.freemem())}\n`
    + `🟢Free Ram: ${toGb(os.freemem())}\n`
    + `💻Os: ${os.platform() + " " + os.arch()}`
  const adReply = {
    text: txt + speedTxt,
    contextInfo: {
      externalAdReply: {
        title: `${frontText(botName).split("").join(".")} : Konnichiwa ${user}`,
        thumbnail: fs.readFileSync(join(__dirname, "../src/icon.jpg")),
        sourceUrl: "https://wa.me/6288222358226"
      }
    }
  }
  await conn.sendMessage(id, adReply, { quoted: m })
}

handler.cmd = /^(ping|test|tes)$/i
handler.desc = "testing"
handler.category = "utility"
export default handler
