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
const apiKey = process.env.API_KEY
const messageLoading = process.env.MESSAGE_LOADING
const limit = process.env.LIMIT
const numBot = process.env.NO_BOT
const numDev = process.env.NO_DEV

const mysql = process.env.MYSQL || "false"
const mysqlHost = process.env.MYSQL_HOST || "localhost"
const mysqlPort = process.env.MYSQL_PORT || 3306
const mysqlDb = process.env.MYSQL_DATABASE || "test"
const mysqlPass = process.env.MYSQL_PASSWORD || ""
const mysqlUser = process.env.MYSQL_USER || "root"
const mysqlTable = process.env.MYSQL_TABLE_NAME || "auth"

export {
  sessionName,
  prefix,
  botName,
  levelLog,
  browser,
  timeZone,
  messageLoading,
  limit,
  numBot,
  numDev,
  mysqlHost,
  mysqlPort,
  mysqlDb,
  mysqlPass,
  mysqlUser,
  mysqlTable,
  mysql,
  apiKey
}
