import baileys, { 
  fetchLatestBaileysVersion, 
  makeCacheableSignalKeyStore, 
  makeWASocket, 
  /* BufferJSON,  */
  useMultiFileAuthState, 
  makeInMemoryStore,
} from '@whiskeysockets/baileys'
import MAIN_LOGGER from './logger.js'
import event from './event.js'
import NodeCache from 'node-cache'
import process from 'process'
import cfg from '../config.js'
import server from './server.js'
const logger = MAIN_LOGGER.child({})

const usePairingCode = process.argv.includes('--use-pairing-code')
console.log({usePairingCode})
const msgRetryCounterCache = new NodeCache()
const { state, saveCreds } = await useMultiFileAuthState('sessions')

const { version, isLatest } = await fetchLatestBaileysVersion()
console.log(`using WA v${version.join('.')}, isLatest: ${isLatest}`)

const store = makeInMemoryStore({ logger })
store.readFromFile('../store.json')
// saves the state to a file every 10s
setInterval(() => {
  store.writeToFile('../store.json')
}, 10_000)


const getMessage = async (key) => {
  if(store) {
  	const msg = await store.loadMessage(key?.remoteJid, key?.id)
    return msg?.message || undefined
  }
  return baileys.proto.Message.fromObject({})
}

const conn = await makeWASocket({
  // can provide additional config here
  logger,
  version: version,
  receivedPendingNotifications: true,
  auth: {
    creds: state.creds,
    keys: makeCacheableSignalKeyStore(state.keys, logger),
  },
  msgRetryCounterCache,
  markOnlineOnConnect: true,
  generateHighQualityLinkPreview: true,
  browser: cfg.browser,
  getMessage,
  qrTimeout: 15000
})
store?.bind(conn.ev)

await server(conn)

conn.ev.process(async ( e ) => { 
  await event(
    e,
    conn,
    store,
    saveCreds
  )
})

export default conn
