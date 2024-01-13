import { DisconnectReason } from '@whiskeysockets/baileys'
import conn from './lib/sock.js'
import { Boom } from '@hapi/boom'
import process from 'process'
function startItwzy() {
  conn.ev.on('connection.update', async ( update ) => {
    const { connection, lastDisconnect } = update
    if(connection === 'close') {
      const reason = new Boom(lastDisconnect?.error)?.output.statusCode

      if (reason === DisconnectReason.badSession) {
        console.log('Bad Session File, Please Delete Session and Scan Again')
        process.exit()
      } else if (reason === DisconnectReason.connectionClosed) {
        console.log('Connection closed, reconnecting....')
        startItwzy()
      } else if (reason === DisconnectReason.connectionLost) {
        console.log('Connection Lost from Server, reconnecting...')
        startItwzy()
      } else if (reason === DisconnectReason.connectionReplaced) {
        console.log('Connection Replaced, Another New Session Opened, Please Restart Bot')
        process.exit()
      } else if (reason === DisconnectReason.loggedOut) {
        console.log('Device Logged Out, Please Delete Folder Session yusril and Scan Again.')
        process.exit()
      } else if (reason === DisconnectReason.restartRequired) {
        console.log('Restart Required, Restarting...')
        startItwzy()
      } else if (reason === DisconnectReason.timedOut) {
        console.log('Connection TimedOut, Reconnecting...')
        startItwzy()
      } else {
        console.log(`Unknown DisconnectReason: ${reason}|${connection}`)
        startItwzy()
      }
    } else if(connection === 'open') {
      console.log('opened connection')
    }
  })
}

startItwzy()
