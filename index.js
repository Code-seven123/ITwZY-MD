import isOnline from 'is-online'
import fs from 'fs'
import MAIN_LOGGER from './lib/logger.js'
import process from 'process'
const logger = MAIN_LOGGER.child({})

const online = await isOnline()
if(!(online)) {
  logger.info('You are currently offline.')
  process.exit()
} else {
  logger.info('You are currently online.')
}


if(!(fs.existsSync('./sessions'))) {
  logger.info('sessions not found')
  fs.mkdir('./sessions', { recursive: true }, (err) => {
    if (err) {
      logger.error(err, 'Failed to create a folder.')
      process.exit()
    } else {
      logger.info('Folder "./sessions" berhasil dibuat.')
    }
  })
} else { 
  logger.info('Folder sessions found')
}

await import('./main.js')
