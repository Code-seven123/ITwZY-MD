import P from 'pino'

export default P({ 
  timestamp: () => `,"time":"${new Date().toJSON()}"`, 
  level: 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true
    }
  }
})
