import P from 'pino'
import cfg from '../config.js'
export default P({ 
  timestamp: () => `,"time":"${new Date().toJSON()}"`, 
  level: cfg.levelLog,
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true
    }
  }
})
