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
const online = await isOnline()
if(!(online)) {
  logger.info('You are currently offline.')
  process.exit()
} else {
  logger.info('You are currently online.')
}

fs.watch('./', { recursive: true }, (type, file) => {
	console.log(type, file)
})

if(!(fs.existsSync('./temp'))) {
  logger.info('temp not found')
  fs.mkdir('./temp', { recursive: true }, (err) => {
    if (err) {
      logger.error(err, 'Failed to create a folder.')
      process.exit()
    } else {
      logger.info('Folder "./temp" berhasil dibuat.')
    }
  })
} else {
  logger.info('Folder temp found')
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

http.createServer((req, res) => {
  if(req.url == '/'){
  	res.writeHead(200, { 'Content-Type': 'text/html' })
  	const html = `<h1 align="center">BOT IS STARTING</h1>
        <button onclick="location.href = '/stop'">STOP BOT</button>`
    res.end(html)
  } else if(req.url == '/stop'){
    res.end('exit')
    process.exit()
  } else {
    res.end('error')
  }
}).listen(2929)

async function start(){
  try {
    return import('./main.js')
  } catch (e) {
    return await start()
  }
}
await start()

