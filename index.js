import makeWASocket, { DisconnectReason } from '@whiskeysockets/baileys'
import { Boom } from '@hapi/boom'
import conn from './lib/sock.js'

(async function wa() {
  conn.ev.on('connection.update', update => {
    const { connection, lastDisconnect } = update
    if(connection === 'close') {/*
      const shouldReconnect = (lastDisconnect.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut
      console.log('connection closed to ', lastDisconnect.error, ', reconnecting ', shouldReconnect)
      if(shouldReconnect){*/
        wa()
//      }
    } else if(connection === 'open') {
      console.log('opened connection')
    }
  })
  conn.ev.on('messages.upsert', async (m) => {
    console.log(JSON.stringify(m, undefined, 2))

    console.log('replying to', m.messages[0].key.remoteJid)
    await conn.sendMessage(m.messages[0].key.remoteJid, { text: 'Hello there!' })
  })
})();
