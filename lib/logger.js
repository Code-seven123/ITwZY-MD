import { levelLog } from "./config.js"
import P from "pino"
export default P({ 
  timestamp: () => `,"time":"${new Date().toJSON()}"`,
  base: null,
  messageKey: "msg"
}, /*P.destination('wa-logs.txt')*/)
