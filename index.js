import isOnline from 'is-online'
import fs from 'fs'
import MAIN_LOGGER from './lib/logger.js'
import process from 'process'
import http from 'http'
const logger = MAIN_LOGGER.child({})

process.on('exit', () => {
  console.log('exit from system')
})
logger.info("Use 'Ctrl + c' to safely exit the program.")
console.log("Use 'Ctrl + c' to safely exit the program.")
const online = await isOnline()
if(!(online)) {
  logger.info('You are currently offline.')
  console.log('You are currently offline.')
  process.exit()
} else {
  logger.info('You are currently online.')
  console.log('You are currently online.')
}

fs.watch('./', { recursive: true }, (type, file) => {
	console.log(type, file)
})

if(!(fs.existsSync('./temp'))) {
  logger.info('temp not found')
  console.log('temp not found')
  fs.mkdir('./temp', { recursive: true }, (err) => {
    if (err) {
      logger.error(err, 'Failed to create a folder.')
      console.log(err, 'Failed to create a folder.')
      process.exit()
    } else {
      logger.info('Folder "./temp" berhasil dibuat.')
      console.log('Folder "./temp" berhasil dibuat.')
    }
  })
} else {
  logger.info('Folder temp found')
  console.log('Folder temp found')
}

if(!(fs.existsSync('./sessions'))) {
  logger.info('sessions not found')
  console.log('sessions not found')
  fs.mkdir('./sessions', { recursive: true }, (err) => {
    if (err) {
      logger.error(err, 'Failed to create a folder.')
      console.log(err, 'Failed to create a folder.')
      process.exit()
    } else {
      logger.info('Folder "./sessions" berhasil dibuat.')
      console.log('Folder "./sessions" berhasil dibuat.')
    }
  })
} else { 
  logger.info('Folder sessions found')
  console.log('Folder sessions found')
}

async function start(){
  try {
    return import('./main.js')
  } catch (e) {
    return await start()
  }
}
await start()

