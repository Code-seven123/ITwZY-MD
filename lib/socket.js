import baileys, {
  makeWASocket,
  makeCacheableSignalKeyStore, 
  makeInMemoryStore,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  fetchLatestWaWebVersion,
  getAggregateVotesInPollMessage
} from "@whiskeysockets/baileys"
import readline from "readline"
import {
  browser,
  numBot,
  numDev,
  mysql,
  mysqlHost,
  mysqlPort,
  mysqlDb,
  mysqlPass,
  mysqlUser,
  mysqlTable,
  sessionName
} from "./config.js"
import NodeCache from "node-cache"
import MAIN_LOGGER from "./logger.js"
import { Boom } from "@hapi/boom"
import process from "process"
import messageProcess from "./message.js"
import { delay, __dirname } from "./utils.js"
import { join } from "path"
import { inspect } from "util"
import fs from "fs"
import { useMySQLAuthState } from "./mysql.js"

const logger = MAIN_LOGGER.child({})

async function startSock(){
  let authState = null
  if(mysql == "false") {
    authState = await useMultiFileAuthState("sessions")
  } else {
    authState = await useMySQLAuthState({
      host: mysqlHost,
      port: mysqlPort,
      database: mysqlDb,
      password: mysqlPass,
      user: mysqlUser,
      tableName: mysqlTable,
      session: sessionName
    })
  }
  const { state, saveCreds } = authState
  const msgRetryCounterCache = new NodeCache()

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  const question = (text) => new Promise((resolve) => rl.question(text, resolve))

  const { version, isLatest } = await fetchLatestWaWebVersion().catch(() => fetchLatestBaileysVersion())
  console.log(`Connected Using WAWeb v${version.join(".")}, isLatest: ${isLatest}`)

  const store = makeInMemoryStore({ logger })
  store?.readFromFile(join(__dirname, "../store.json"))
  setInterval(() => {
    store?.writeToFile(join(__dirname, "../store.json"))
  }, 10000)

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
    qrTimeout: 15000,
    defaultQueryTimeoutMs: 1800000
  })
  store?.bind(conn.ev)
  if(!conn.authState.creds.registered) {
    //    const phoneNumber = await question("Please enter your mobile phone number +")
    setTimeout(async () => {
      const code = await conn.requestPairingCode(numBot)
      console.log(`Pairing code: ${code}`)
    }, 3000)
  }
  conn.ev.process(async ( e ) => {
    if(e["creds.update"]){
      await saveCreds()
    }
    if(e["messaging-history.set"]) {
      const { chats, contacts, messages, isLatest } = e["messaging-history.set"]
      console.log(`recv ${chats.length} chats, ${contacts.length} contacts, ${messages.length} msgs (is latest: ${isLatest})`)
    }
    if(e["messages.upsert"]){
      const m = e["messages.upsert"]
      try {
        await messageProcess(conn, m, store)
      } catch (e) {
        const [res] = await conn.onWhatsApp(numDev)
        const errorLog = {
          level: "error",
          timestamps: new Date().toString(),
          data: {
            message: e?.message || "",
            stack: e?.stack || ""
          }
        }
        const jsonLog = JSON.stringify(errorLog || {}, null, 2)
        const result = []
        let i = 1
        for( const jsonL of jsonLog.split("\n") ){
          result.push(`WaLog(${i}) ${jsonL}`)
          i += 1
        }
        const modifiedLog = result.join("\n")
        const id = m?.messages[0]?.key?.remoteJid
        if(res?.exists) {
          await conn.sendMessage(id, { text: "`*   FAILED EXECUTION, PROGRAM ERROR   *`" })
          await conn.sendMessage(res?.jid, { text: modifiedLog })
        } else {
          await conn.sendMessage(id, { text: modifiedLog })
        }
        console.error(e)
      }
    }
    if(e["chats.set"]){
      console.log("got chats", store.chats.all())
    }
    if(e["contacts.set"]){
      console.log("got contacts", Object.values(store.contacts))
    }
    if(e["messages.update"]) {
      /*console.log(
        JSON.stringify(e["messages.update"], undefined, 2)
      )*/

      for(const { key, update } of e["messages.update"]) {
        if(update.pollUpdates) {
          const pollCreation = await getMessage(key)
          if(pollCreation) {
            console.log(
              "got poll update, aggregation: ",
              getAggregateVotesInPollMessage({
                message: pollCreation,
                pollUpdates: update.pollUpdates,
              })
            )
          }
        }
      }
    }
    if(e["group-participants.update"]){
      const gr = e["group-participants.update"]
      const contact = store.contacts[gr?.participants[0]]
      const user = contact?.notify || contact?.name || contact?.id
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

startSock(numBot)
