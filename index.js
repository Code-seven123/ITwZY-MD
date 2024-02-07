import isOnline from 'is-online'
import fs from 'fs'
import MAIN_LOGGER from './lib/logger.js'
import process from 'process'
//import fsx from 'fs-extra'
//const notCache = process.argv.includes('--not-cache')

const logger = MAIN_LOGGER.child({})

const online = await isOnline()
if(!(online)) {
  logger.info('You are currently offline.')
  process.exit()
} else {
  logger.info('You are currently online.')
}

/*if(!(notCache)){
  if(!(fs.existsSync('./.cache'))){
    fs.mkdir('./.cache', { recursive: true }, (err) => {
	    if (err) {
	      logger.error(err, 'Failed to create a folder.')
	      process.exit()
	    } else {
	      logger.info('Folder "./.cache" berhasil dibuat.')
	    }
	  })
  } else {
    setInterval(() => {
      fsx.emtyDir('./.cache')
        .then(() => { logger.info('cache clear') })
        .catch(err => { logger.error(`${err}`) })
	  }, 43200000)
  }
}*/

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
