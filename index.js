import MAIN_LOGGER from "./lib/logger.js"
import isOnline from "is-online"
import fs from "fs"
import nodemon from "nodemon"
import process from "process"
import http from "http"

http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" })
  res.end("Bot starting")
}).listen(process.env.PORT || 8000, () => {
  console.log(`Server berjalan di http://%:${process.env.PORT || 8000}`)
})

const logger = MAIN_LOGGER.child({})

process.on("exit", () => {
  console.log("exit from system, system ID", process.pid)
})

logger.info("Use 'Ctrl + c' to safely exit the program.")
console.log("Use 'Ctrl + c' to safely exit the program.")
await isOnline().then((online) => {
  console.log(online ? "Your currenty online" : "your currenty offline")
  logger.info(online ? "Your currenty online" : "your currenty offline")
})

const sessions = (process.env.MYSQL == "false") ? "./sessions" : ""
for( const item of ["./temp", "./store", sessions] ){
  if(item == "") {
  } else if(!fs.existsSync(item)) {
    logger.info(`\"${item}\" not found`)
    console.log(`\"${item}\" not found`)
    fs.mkdir(item, { recursive: true }, (err) => {
      if (err) {
        logger.error(err, "Failed to create a folder.")
        console.log(err, "Failed to create a folder.")
        process.exit(0)
      } else {
        logger.info(`Folder "${item}" berhasil dibuat.`)
        console.log(`Folder "${item}" berhasil dibuat.`)
      }
    })
  } else {
    logger.info(`\"${item}\" found`)
    console.log(`\"${item}\" found`)
  }
}
  
async function start(){
  const args = [process.argv.filter(arg => arg.startsWith("--"))]
  nodemon({
    script: "./lib/socket.js", // Your main server file
    ext: "js json", // File extensions to watch
    ignore: ["node_modules/", "sessions/", "temp/", "store/"],
    args: args.flat()
  })
  nodemon.on("start", () => {
    console.log("Program starting!!")
  })

  nodemon.on("restart", (files) => {
    console.log("Server restarting due to changes in:", files)
  })

  nodemon.on("crash", () => {
    console.error("Server has crashed!")
    process.exit(0)
  })
}
start()
