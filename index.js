import { DisconnectReason, PHONENUMBER_MCC } from '@whiskeysockets/baileys'
import conn from './lib/sock.js'
import { Boom } from '@hapi/boom'
import process from 'process'
import readline from 'readline'
import open from 'open'
import { Buffer } from 'buffer'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const question = (text) => new Promise(resolve => rl.question(text, resolve))

const usePairingCode = process.argv.includes('--use-pairing-code')
const useMobile = process.argv.includes('--mobile')

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
        console.log('Device Logged Out, Please Delete Folder Session yusril and Scan Again.')
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
    if(useMobile) { 
      throw new Error('Cannot use pairing code with mobile api')
    }
 
    const phoneNumber = await question('Please enter your mobile phone number:\n')
    const code = await conn.requestPairingCode(phoneNumber)
    console.log(`Pairing code: ${code}`)
  }
  if(useMobile && !conn.authState.creds.registered) {
    const { registration } = conn.authState.creds || { registration: {} }

    if(!registration.phoneNumber) {
      registration.phoneNumber = await question('Please enter your mobile phone number:\n')
    }

    const libPhonenumber = await import('libphonenumber-js')
    const phoneNumber = libPhonenumber.parsePhoneNumber(registration.phoneNumber)
    if(!phoneNumber?.isValid()) {
      throw new Error('Invalid phone number: ' + registration.phoneNumber)
    }

    registration.phoneNumber = phoneNumber.format('E.164')
    registration.phoneNumberCountryCode = phoneNumber.countryCallingCode
    registration.phoneNumberNationalNumber = phoneNumber.nationalNumber
    const mcc = PHONENUMBER_MCC[phoneNumber.countryCallingCode]
    if(!mcc) {
      throw new Error('Could not find MCC for phone number: ' + registration.phoneNumber + '\nPlease specify the MCC manually.')
    }

    registration.phoneNumberMobileCountryCode = mcc
    
    const mob = {
      async enterCode() {
        try {
          const code = await question('Please enter the one time code:\n')
          const response = await conn.register(code.replace(/["']/g, '').trim().toLowerCase())
          console.log('Successfully registered your phone number.')
          console.log(response)
          rl.close()
        } catch(error) {
          console.error('Failed to register your phone number. Please try again.\n', error)
          await this.askForOTP()
        }
      },
    
      async askForOTP() {
        if (!registration.method) {
          let code = await question('How would you like to receive the one time code for registration? "sms" or "voice"\n')
          code = code.replace(/["']/g, '').trim().toLowerCase()
          if(code !== 'sms' && code !== 'voice') {
            return await this.askForOTP()
          }

          registration.method = code
        }

        try {
          await conn.requestRegistrationCode(registration)
          await this.enterCode()
        } catch(error) {
          console.error('Failed to request registration code. Please try again.\n', error)

          if(error?.reason === 'code_checkpoint') {
            await this.enterCaptcha()
          }

          await this.askForOTP()
        }
      },
    
      async enterCaptcha() {
        const response = await conn.requestRegistrationCode({ ...registration, method: 'captcha' })
        const path = __dirname + '/captcha.png'
        fs.writeFileSync(path, Buffer.from(response.image_blob, 'base64'))

        open(path)
        const code = await question('Please enter the captcha code:\n')
        fs.unlinkSync(path)
        registration.captcha = code.replace(/["']/g, '').trim().toLowerCase()
      }
    }
    await mob.askForOTP()
  }
}

startItwzy()
