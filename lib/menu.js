import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import moment from 'moment'
import cfg from '../config.js'
import process from 'process'


const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const folder = path.join(__dirname, '../plugins')
const dataFinal = []

function uptime(){
  const uptimeInSeconds = process.uptime()
  const hours = Math.floor(uptimeInSeconds / 3600)
  const minutes = Math.floor((uptimeInSeconds % 3600) / 60)
  const seconds = Math.floor(uptimeInSeconds % 60)
    
  return `${hours} hours, ${minutes} minutes, ${seconds} seconds`
}

try {
  const roots = fs.readdirSync(folder)
  const datas = []
  for ( const root of roots ) {
    const catFolder = path.join(folder, root)
    const files = fs.readdirSync(catFolder)
    const filters = files.filter(file => path.extname(file) === '.js')
    //    data.push({ name: root, data:  })
    const plugin = []
    for (const filter of filters){
      const pluginsPath = path.join(catFolder, filter)
      plugin.push( pluginsPath )
    }
    datas.push({ name: root, file: plugin })
  }
  for ( const data of datas){
    const item = []
    for ( const plug of data.file ) {
      const def = await import(plug)
      item.push(def.default)
    }
    dataFinal.push({ name: data.name, data: item})


  }
} catch (e) {
  console.log(e)
}

const plugin = []

for(const data of dataFinal){
  const name = []
  for ( const file of data.data ){
    const cmd = file.cmd?.toString()?.slice(3)?.slice(0, -4).split('|')
    for (const c of cmd ) {
      const args = file.args || ''
      name.push({ name: c + ' ' + args })
    }
  }
  const text = `┌──>${data.name}\n`
  const body = []
  for (const d of name) {
    body.push(` | ${cfg.prefix}${d.name}\n`)
  }
  plugin.push(text + body.join(''))
}

export default function(user, cfg) {
  const msg = `*WALCOME* ${user} \n`
  	+ `📆today is : ${moment().format('MMMM DD, YYYY')}\n`
    + `🕓time is : ${moment().format('HH:mm:ss')} \n`
    + `⏳Uptime: ${uptime()}\n\n`
    + `🤖Bot Name : ${cfg.botName}\n`
    + `👨🏻‍💻Owner Name : ${cfg.owner[0].name}\n`
    + `☎️Number : ${cfg.owner[0].number}\n\n`
    + 'Use \'info\' to view information or description of the command. \nExample: \n.menu info\n\n'
    + '------Command List------\n'
  return msg + plugin.join('\n')
}
