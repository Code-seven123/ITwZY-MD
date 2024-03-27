import baileys, { 
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
import process from 'process'
import cfg from '../config.js'
import server from './server.js'
import readline from 'readline'
const logger = MAIN_LOGGER.child({})
const useWeb = process.argv.includes('--use-web')
const usePairingCode = process.argv.includes('--use-pairing-code')
const useStore = process.argv.includes('--use-store')

const msgRetryCounterCache = new NodeCache()
const { state, saveCreds } = await useMultiFileAuthState('sessions')

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const question = (text) => new Promise((resolve) => rl.question(text, resolve))
const { version, isLatest } = await fetchLatestBaileysVersion()
console.log(`using WA v${version.join('.')}, isLatest: ${isLatest}`)

const store = useStore ? makeInMemoryStore({ logger }) : undefined
store?.readFromFile('store.json')
// save every 10s
setInterval(() => {
  store?.writeToFile('store.json')
}, 600000)

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
  printQRInTerminal: !usePairingCode,
  msgRetryCounterCache,
  markOnlineOnConnect: true,
  generateHighQualityLinkPreview: true,
  browser: cfg.browser,
  getMessage,
  qrTimeout: 15000
})

store?.bind(sock.ev)

if(useWeb){
  await server(conn)
} else {
  if(usePairingCode && !conn.authState.creds.registered) {
  	const phoneNumber = await question('Please enter your mobile phone number +')
  	setTimeout(async () => {
 	    const code = await conn.requestPairingCode(phoneNumber)
	    console.log(`Pairing code: ${code}`)
    }, 3000)
  }
}

try {
  conn.ev.process(async ( e ) => { 
  	await event(
    	e,
	    conn,
	    saveCreds
	  )
  })
} catch (e) {
  console.log(e)
}
export default conn
