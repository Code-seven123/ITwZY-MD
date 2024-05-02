import { fileURLToPath } from "url"
import { dirname } from "path"
import moment from "moment-timezone"
import { timeZone } from "./config.js"
import { spawn } from "child_process"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

const delay = async (ms) => new Promise((resolve) => {
  setTimeout(resolve, ms)
})

async function getUptime() {
  return new Promise((resolve, reject) => {
    const uptimeProcess = spawn("uptime", ["-p"])

    let uptimeData = ""

    uptimeProcess.stdout.on("data", (data) => {
      uptimeData += data.toString()
    })

    uptimeProcess.stderr.on("data", (data) => {
      reject(`Error: ${data}`)
    })

    uptimeProcess.on("close", (code) => {
      if (code === 0) {
        resolve(uptimeData)
      } else {
        reject(`Child process exited with code ${code}`)
      }
    })
  })
}

function frontText(text) {
  return text.replace(/(?:^|[\.\?!]\s*)([a-z])/g, (match, char) => {
    return char.toUpperCase()
  })
}

async function wait(variable, isi) {
  console.log(variable)
  return new Promise(resolve => {
    const handler = {
      set(target, key, value) {
        target[key] = value
        if (key === "value" && value === isi) {
          resolve()
        }
        return true
      }
    }

    const proxyVariable = new Proxy(variable, handler);

    // Menunggu sampai variabel memiliki nilai "finish"
    (function checkFinish() {
      if (proxyVariable.value !== isi) {
        setTimeout(checkFinish, 1000)
      }
      console.log(variable)
    })()
  })
}

const time = moment().tz(timeZone)

export {
  __filename,
  __dirname,
  randomInt,
  delay,
  getUptime,
  time,
  wait,
  frontText
}
