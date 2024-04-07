import baileys, {
  makeWASocket,
  makeCacheableSignalKeyStore, 
  fetchLatestBaileysVersion,
  makeInMemoryStore,
  useMultiFileAuthState,
  DisconnectReason
} from "@whiskeysockets/baileys"
//import { useMySQLAuthState } from "mysql-baileys"
import readline from "readline"
import {
  browser
} from "./config.js"
import NodeCache from "node-cache"
import MAIN_LOGGER from "./logger.js"
import { Boom } from "@hapi/boom"
import process from "process"
import messageProcess from "./message.js"
import { delay } from "./utils.js"

const logger = MAIN_LOGGER.child({})
const useStore = process.argv.includes("--use-store")

async function startSock(){
  const { state, saveCreds } = await useMultiFileAuthState("sessions")
  const msgRetryCounterCache = new NodeCache()

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  const question = (text) => new Promise((resolve) => rl.question(text, resolve))

  const { verror, version, isLatest } = await fetchLatestBaileysVersion()
  console.log(`using WA v${version.join(".")}, isLatest: ${isLatest}`)

  if (verror){
    console.log("Session No connection, check your internet.")
    return startSock()
  }

  const store = useStore ? makeInMemoryStore({ logger }) : undefined
  store?.readFromFile("./store.json")
  setInterval(() => {
    store?.writeToFile("./store.json")
  }, 600000)

  const getMessage = async (key) => {
    if(store) {
      const msg = await store.loadMessage(key?.remoteJid, key?.id)
      return msg?.message || undefined
    }
    return baileys.proto.Message.fromObject({})
  }

  const conn = await makeWASocket({
    logger,
    version: version,
    receivedPendingNotifications: false,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, logger),
    },
    msgRetryCounterCache,
    markOnlineOnConnect: true,
    generateHighQualityLinkPreview: true,
    browser: browser,
    getMessage,
    qrTimeout: 15000
  })

  store?.bind(conn.ev)

  if(!conn.authState.creds.registered) {
    const phoneNumber = await question("Please enter your mobile phone number +")
    setTimeout(async () => {
      const code = await conn.requestPairingCode(phoneNumber)
      console.log(`Pairing code: ${code}`)
    }, 3000)
  }

  conn.ev.process(async ( e ) => {
    if(e["creds.update"]){
      await saveCreds()
    }
    if(e["messages.upsert"]){
      const m = e["messages.upsert"]
      await messageProcess(conn, m)
    }
    if(e["chats.set"]){
      console.log("got chats", store.chats.all())
    }
    if(e["contacts.set"]){
      console.log("got contacts", Object.values(store.contacts))
    }

    if(e["group-participants.update"]){
      const gr = e["group-participants.update"]
      const user = gr?.participants[0]?.split("@")[0]
      if (gr.action == "add") {
        await conn.sendMessage(gr.id, { text: `Selamat Datang ${user}` })
      } else if (gr.action  == "promote"){
        await conn.sendMessage(gr.id, { text: `Selamat ${user} anda dipromosikan menjadi admin` })
      } else if (gr.action == "demote"){
        await conn.sendMessage(gr.id, { text: `Maaf ${user}, anda diberhentikan menjadi admin` })
      } else if (gr.action == "remove"){
        await conn.sendMessage(gr.id, { text: `Selamat tinggal ${user}`})
      }
    }
    if(e["connection.update"]){
      const { connection, lastDisconnect } = e["connection.update"]
      if(connection === "close") {
        const reason = new Boom(lastDisconnect?.error)?.output.statusCode
        if (reason === DisconnectReason.badSession) {
          logger.error("Bad Session File, Please Delete Session and Scan Again")
          console.log("Bad Session File, Please Delete Session and Scan Again")
          process.exit()
        } else if (reason === DisconnectReason.connectionClosed) {
          logger.error("Connection closed, reconnecting....")
          console.log("Connection closed, reconnecting....")
          await startSock()
        } else if (reason === DisconnectReason.connectionLost) {
          logger.error("Connection Lost from Server, reconnecting...")
          console.log("Connection Lost from Server, reconnecting...")
          await startSock()
        } else if (reason === DisconnectReason.connectionReplaced) {
          logger.error("Connection Replaced, Another New Session Opened, Please Restart Bot")
          console.log("Connection Replaced, Another New Session Opened, Please Restart Bot")
          process.exit()
        } else if (reason === DisconnectReason.loggedOut) {
          logger.error("Device Logged Out, Please Delete Folder sessions and Scan Again.")
          console.log("Device Logged Out, Please Delete Folder sessions and Scan Again.")
          process.exit()
        } else if (reason === DisconnectReason.restartRequired) {
          logger.error("Restart Required, Restarting...")
          console.log("Restart Required, Restarting...")
          await startSock()
        } else if (reason === DisconnectReason.timedOut) {
          logger.error("Connection TimedOut, Reconnecting...")
          console.log("Connection TimedOut, Reconnecting...")
          await startSock()
        } else {
          logger.error(`Unknown DisconnectReason: ${reason}|${connection}`)
          console.log(`Unknown DisconnectReason: ${reason}|${connection}`)
          await startSock()
        }
      } else if(connection === "open") {
        logger.info("opened connection")
        console.log("opened connection")
        await conn.updateProfileStatus("bot is starting")
        process.on("exit", () => {
          conn.updateProfileStatus("bot stopped").catch(e => console.log(e))
        })
        rl.on("SIGINT", async () => {
          await conn.updateProfileStatus("bot stopped")
          process.exit()
          console.log("Exit from SIGINT, system Id", process.pid)
        })
      }
    }
  })
  return conn
}

startSock()
