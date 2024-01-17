import { DisconnectReason } from '@whiskeysockets/baileys'
import conn from './lib/sock.js'
import { Boom } from '@hapi/boom'
import process from 'process'
import readline from 'readline'
import fs from 'fs'
import fsX from 'fs-extra'

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const question = (text) => new Promise(resolve => rl.question(text, resolve))

const usePairingCode = process.argv.includes('--use-pairing-code')
const temporarily = process.argv.includes('--notCache')

if(!(fs.existsSync('./.cache'))) {
  logger.info('./.cache not found')
  fs.mkdir('./.cacge', { recursive: true }, (err) => {
    if (err) {
      logger.error(err, 'Failed to create a folder.')
      process.exit()
    } else {
      logger.info('Folder "./.cache" berhasil dibuat.')
    }
  })
} else if(fs.existsSync('./.cache')) {
  if( !(temporarily) ) {
    setInterval(() => {
      fsX.emptyDir('./.cache')
        .then(() => {
          console.log('Isi folder "./.cache" berhasil dihapus.')
        })
        .catch((err) => {
          console.error('Gagal menghapus isi folder: \n', err)
        })
    }, 86400000)
  }
}

async function startItwzy() {
  conn.ev.on('connection.update', async ( update ) => {
    const { connection, lastDisconnect } = update
    if(connection === 'close') {
      const reason = new Boom(lastDisconnect?.error)?.output.statusCode

      if (reason === DisconnectReason.badSession) {
        console.log('Bad Session File, Please Delete Session and Scan Again')
        process.exit()
      } else if (reason === DisconnectReason.connectionClosed) {
        console.log('Connection closed, reconnecting....')
        await startItwzy()
      } else if (reason === DisconnectReason.connectionLost) {
        console.log('Connection Lost from Server, reconnecting...')
        await startItwzy()
      } else if (reason === DisconnectReason.connectionReplaced) {
        console.log('Connection Replaced, Another New Session Opened, Please Restart Bot')
        process.exit()
      } else if (reason === DisconnectReason.loggedOut) {
        console.log('Device Logged Out, Please Delete Folder sessions and Scan Again.')
        process.exit()
      } else if (reason === DisconnectReason.restartRequired) {
        console.log('Restart Required, Restarting...')
        await startItwzy()
      } else if (reason === DisconnectReason.timedOut) {
        console.log('Connection TimedOut, Reconnecting...')
        await startItwzy()
      } else {
        console.log(`Unknown DisconnectReason: ${reason}|${connection}`)
        await startItwzy()
      }
    } else if(connection === 'open') {
      console.log('opened connection')
    }
  })
  if(usePairingCode && !conn.authState.creds.registered) {
    const phoneNumber = await question('Please enter your mobile phone number:\n')
    const code = await conn.requestPairingCode(phoneNumber.replace(/[^0-9]/g, ''))
    console.log('your phone number is ', phoneNumber.replace(/[^0-9]/g, ''))
    console.log(`Pairing code: ${code.match(/.{1,4}/g).join('-')}`)
  }
  return conn
}

startItwzy()
