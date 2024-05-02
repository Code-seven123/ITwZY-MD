import { config } from "dotenv"
import process from "process"
import { userInfo } from "os"
config()

const sessionName = process.env.SESSION_NAME
const prefix = process.env.BOT_PREFIX
const botName = process.env.BOT_NAME
const levelLog = process.env.LOG_LEVEL
const browser = process.env.WA_BROWSER.split(",")
const timeZone = process.env.TIME_ZONE
const aiKey = process.env.OPENAI_API_KEY
const messageLoading = process.env.MESSAGE_LOADING
const limit = process.env.LIMIT

export {
  sessionName,
  prefix,
  botName,
  levelLog,
  browser,
  timeZone,
  aiKey,
  messageLoading,
  limit
}
