import baileys, {
  makeWASocket,
  makeCacheableSignalKeyStore, 
  makeInMemoryStore,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  fetchLatestWaWebVersion,
  getAggregateVotesInPollMessage,
  Browsers
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
  sessionName,
  botName,
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
logger.level = "trace"

const useQR = process.argv.includes('--use-qr')
const onDemandMap = new Map()

console.log("Use qr status : ", useQR)

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

  const { version, isLatest } = await fetchLatestBaileysVersion()
  console.log(`Connected Using WAWeb v${version.join(".")}, isLatest: ${isLatest}`)

  const store = true ? makeInMemoryStore({ logger }) : undefined
  store?.readFromFile(join(__dirname, `../store/store-${numBot}.json`))
  setInterval(() => {
    store?.writeToFile(join(__dirname, `../store/store-${numBot}.json`))
  }, 10_000)

  const conn = await makeWASocket({
    logger,
    version: [2, 3000, 1014090025],
    receivedPendingNotifications: false,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, logger),
    },
    printQRInTerminal: useQR,
    msgRetryCounterCache,
    syncFullHistory: true,
    markOnlineOnConnect: true,
    generateHighQualityLinkPreview: true,
    browser: Browsers.ubuntu("Desktop"),
    getMessage,
  })
  store?.bind(conn.ev)
  if(useQR != true && !conn.authState.creds.registered) {
    setTimeout(async () => {
      const code = await conn.requestPairingCode(numBot);
      console.log(`Code: ${code?.match(/.{1,4}/g)?.join("-")}`);
    }, 3000)
  }
  const sendMessageWTyping = async(msg, jid) => {
		await sock.presenceSubscribe(jid)
		await delay(500)

		await sock.sendPresenceUpdate('composing', jid)
		await delay(2000)

		await sock.sendPresenceUpdate('paused', jid)

		await sock.sendMessage(jid, msg)
	}
  conn.ev.process(async ( e ) => {
    if(e["creds.update"]){
      await saveCreds()
    }
    if(e["messages.upsert"]){
      const m = e["messages.upsert"]
      try {
        if (
					msg.message?.protocolMessage?.type ===
					proto.Message.ProtocolMessage.Type.HISTORY_SYNC_NOTIFICATION
			  ) {
					const historySyncNotification = getHistoryMsg(msg.message)
					if (
					  historySyncNotification?.syncType ==
					  proto.HistorySync.HistorySyncType.ON_DEMAND
					) {
					  const { messages } =
						await downloadAndProcessHistorySyncNotification(
						  historySyncNotification,
						  {}
						)

						const chatId = onDemandMap.get(
							historySyncNotification?.peerDataRequestSessionId
						)
						console.log(messages)

					  onDemandMap.delete(
							historySyncNotification?.peerDataRequestSessionId
					  )

						const messageId = await sock.fetchMessageHistory(
							50,
							oldestMessageKey,
							oldestMessageTimestamp
						)
						onDemandMap.set(messageId, chatId)
					}
					if (msg.message?.conversation || msg.message?.extendedTextMessage?.text) {
						const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text
						if (text == "requestPlaceholder" && !upsert.requestId) {
							const messageId = await sock.requestPlaceholderResend(msg.key) 
							console.log('requested placeholder resync, id=', messageId)
						} else if (upsert.requestId) {
							console.log('Message received from phone, id=', upsert.requestId, msg)
						}

							// go to an old chat and send this
						if (text == "onDemandHistSync") {
							const messageId = await sock.fetchMessageHistory(50, msg.key, msg?.messageTimestamp) 
							console.log('requested on-demand sync, id=', messageId)
						}
					}
			  }
        if(m?.type == 'notify') {
            await messageProcess(conn, m, store)
        }
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
    if (e['connection.update']) {
      const { connection, lastDisconnect } = e['connection.update'];
      if (connection === 'close') {
        const reason = new Boom(lastDisconnect?.error)?.output.statusCode;
        console.error(`Connection closed due to error: ${reason}`);
        if (reason === DisconnectReason.connectionLost) {
          console.log("Connection Lost. Reconnecting...");
          await startSock();
        } else if (reason === DisconnectReason.badSession) {
          console.log("Bad session. Please remove session and restarting.");
          process.exit();
        } else {
          console.log("Unexpected Disconnect Reason:", reason);
          await startSock();
        }
      }
    }
  })

  async function getMessage(key){
    if(store) {
      const msg = await store.loadMessage(key?.remoteJid, key?.id)
      return msg?.message || undefined
    }
    return baileys.proto.Message.fromObject({})
  }
  return conn
}

try { 
  startSock()
} catch (e) {
  console.error(e)
}
