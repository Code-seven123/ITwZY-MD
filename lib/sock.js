import { 
  fetchLatestBaileysVersion, 
  makeCacheableSignalKeyStore, 
  makeWASocket, 
  BufferJSON, 
  useMultiFileAuthState, 
  makeInMemoryStore
} from '@whiskeysockets/baileys'
import MAIN_LOGGER from './logger.js'
import awsEvent from './aws-event.js'
//console.log(makeWASocket.makeWASocket)

const logger = MAIN_LOGGER.child({})
logger.level = 'trace'

const useStore = !process.argv.includes('--no-store')
const doReplies = !process.argv.includes('--no-reply')
const usePairingCode = process.argv.includes('--use-pairing-code')
const useMobile = process.argv.includes('--mobile')

const { state, saveCreds } = await useMultiFileAuthState('../sessions')

const { version, isLatest } = await fetchLatestBaileysVersion()
console.log(`using WA v${version.join('.')}, isLatest: ${isLatest}`)

const store = makeInMemoryStore({ })
store.readFromFile('../store.json')
// saves the state to a file every 10s
setInterval(() => {
    store.writeToFile('../baileys_store.json')
}, 10_000)


const conn = await makeWASocket({
  // can provide additional config here
  logger,
  version: version,
  mobile: useMobile,
  auth: {
    creds: state.creds,
    keys: makeCacheableSignalKeyStore(state.keys, logger),
  },
  qrTimeout: 7000,
  printQRInTerminal: true,
  markOnlineOnConnect: true
})
conn.ev.on('creds.update', saveCreds)
store.bind(conn.ev)
conn.ev.on('chats.set', () => {
  // can use "store.chats" however you want, even after the socket dies out
  // "chats" => a KeyedDB instance
  console.log('got chats', store.chats.all())
})
conn.ev.on('contacts.set', () => {
    console.log('got contacts', Object.values(store.contacts))
})
await awsEvent()
//console.log(conn)
export default conn
