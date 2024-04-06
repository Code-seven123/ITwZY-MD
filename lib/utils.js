import { fileURLToPath } from "url"
import { dirname } from "path"
import moment from "moment-timezone"
import { timeZone } from "./config.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

const delay = async (ms) => new Promise((resolve) => {
  setTimeout(resolve, ms)
})

function uptime(){
  const uptimeInSeconds = process.uptime()
  const hours = Math.floor(uptimeInSeconds / 3600)
  const minutes = Math.floor((uptimeInSeconds % 3600) / 60)
  const seconds = Math.floor(uptimeInSeconds % 60)

  return `${hours} hours, ${minutes} minutes, ${seconds} seconds`
}

const time = moment().tz(timeZone)

export {
  __filename,
  __dirname,
  randomInt,
  delay,
  uptime,
  time
}
