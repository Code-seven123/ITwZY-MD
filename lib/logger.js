import P from 'pino'
import { fileURLToPath } from 'url'
import { resolve, dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

function logFile(level){
  const logFilePath = resolve(__dirname, `../log/${level}.log`)
  return P.destination(logFilePath)
}

const streams = [
  { level: 'info',  stream: logFile('info')},
  { level: 'fatal',  stream: logFile('fatal')},
  { level: 'warn',  stream: logFile('warn')},
  { level: 'error',  stream: logFile('error')}
]

export default P({ 
  streams: streams,
  timestamp: () => `,"time":"${new Date().toJSON()}"`, 
  level: 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true
    }
  }
})
