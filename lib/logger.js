import { levelLog } from "./config.js"
import P from "pino"
export default P({ 
  timestamp: () => `,"time":"${new Date().toJSON()}"`, 
  level: levelLog,
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true
    }
  }
})
