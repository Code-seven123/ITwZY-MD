import { 
  fetchLatestBaileysVersion, 
  makeCacheableSignalKeyStore, 
  makeWASocket, 
  /* BufferJSON,  */
  useMultiFileAuthState, 
  makeInMemoryStore
} from '@whiskeysockets/baileys'
import MAIN_LOGGER from './logger.js'
import event from './event.js'
import NodeCache from 'node-cache'
//import process from 'process'

const logger = MAIN_LOGGER.child({})

//const usePairingCode = process.argv.includes('--use-pairing-code')
//const useMobile = process.argv.includes('--mobile')

const msgRetryCounterCache = new NodeCache()

const { state, saveCreds } = await useMultiFileAuthState('sessions')

const { version, isLatest } = await fetchLatestBaileysVersion()
console.log(`using WA v${version.join('.')}, isLatest: ${isLatest}`)

const store = makeInMemoryStore({ })
store.readFromFile('../store.json')
// saves the state to a file every 10s
setInterval(() => {
  store.writeToFile('../store.json')
}, 10_000)


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
  printQRInTerminal: true,
  markOnlineOnConnect: true
})
store?.bind(conn.ev)
conn.ev.process(async ( e ) => { await event(e, conn, store, saveCreds, state ) })
export default conn
