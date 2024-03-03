import { DisconnectReason } from '@whiskeysockets/baileys'
import conn from './lib/sock.js'
import { Boom } from '@hapi/boom'
import process from 'process'
import MAIN_LOGGER from './lib/logger.js'
import cfg from './config.js'
import utils from './lib/utils.js'
import readline from 'readline'

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const logger = MAIN_LOGGER.child({})

async function startItwzy() {
  conn.ev.on('connection.update', async ( update ) => {
    const { connection, lastDisconnect } = update
    if(connection === 'close') {

      const reason = new Boom(lastDisconnect?.error)?.output.statusCode
      console.log(reason)
      if (reason === DisconnectReason.badSession) {
        logger.error('Bad Session File, Please Delete Session and Scan Again')
        console.log('Bad Session File, Please Delete Session and Scan Again')
        process.exit()
      } else if (reason === DisconnectReason.connectionClosed) {
        logger.error('Connection closed, reconnecting....')
        console.log('Connection closed, reconnecting....')
        await startItwzy()
      } else if (reason === DisconnectReason.connectionLost) {
        logger.error('Connection Lost from Server, reconnecting...')
        console.log('Connection Lost from Server, reconnecting...')
        await startItwzy()
      } else if (reason === DisconnectReason.connectionReplaced) {
        logger.error('Connection Replaced, Another New Session Opened, Please Restart Bot')
        console.log('Connection Replaced, Another New Session Opened, Please Restart Bot')
        process.er.exit()
      } else if (reason === DisconnectReason.loggedOut) {
        logger.error('Device Logged Out, Please Delete Folder sessions and Scan Again.')
        console.log('Device Logged Out, Please Delete Folder sessions and Scan Again.')
        process.exit()
      } else if (reason === DisconnectReason.restartRequired) {
        logger.error('Restart Required, Restarting...')
        console.log('Restart Required, Restarting...')
        await startItwzy()
      } else if (reason === DisconnectReason.timedOut) {
        logger.error('Connection TimedOut, Reconnecting...')
        console.log('Connection TimedOut, Reconnecting...')
        await startItwzy()
      } else {
        logger.error(`Unknown DisconnectReason: ${reason}|${connection}`)
        console.log(`Unknown DisconnectReason: ${reason}|${connection}`)
        await startItwzy()
      }
    } else if(connection === 'open') {
      logger.info('opened connection')
      console.log('opened connection')
      await conn.updateProfileStatus('bot is starting')
      process.on('exit', async () => {
        await conn.updateProfileStatus('bot stopped')
      })
			rl.on('SIGINT', async () => {
      	await conn.updateProfileStatus('bot stopped')
        process.exit()
      })
			process.stdin.on('keypress', (_, key) => {
			  if (key && key.ctrl && key.name === 'c') {
			    console.log('CTRL+C detected');
    // Lakukan tindakan yang sesuai di sini
			    process.exit();
			  }
			})
    }
  })
  return conn
}

startItwzy()
