import fs from "fs"
import { frontText, __dirname, uptime, time } from "./utils.js"
import { join, extname } from "path"
import { botName, prefix } from "./config.js"
const pluginsPath = join(__dirname, "../plugins")
const plugins = fs.readdirSync(pluginsPath)
const files = plugins.filter(file => file.endsWith(".js"))

const datas = []
for( const file of files ) {
  const getPath = join(__dirname, `../plugins/${file}`)
  const get = await import(getPath)
  datas.push(get.default)
}

console.log(`${datas.length} plugin detected`)

const category = Array.from(new Set(datas.map(data => data.category)))
const handler = []
for( const cat of category ){
  const data = datas.filter(data => data.category === cat)

  handler.push({ category: cat, data: data })
}

const plugin = []

for(const data of handler.sort((a, b) => a - b)){
  const name = []
  for ( const file of data.data ){
    const cmd = file.cmd?.toString()?.slice(3)?.slice(0, -4).split("|")
    for (const c of cmd ) {
      const args = file.args || ""
      name.push({ name: c + " " + args })
    }
  }
  const text = `┌──{ ${frontText(data.category)} }\n`
  const body = []
  for (const d of name) {
    body.push(` | ${prefix}${d.name}\n`)
  }
  plugin.push(text + body.join(""))
}

async function menu(user){
  const txt = `Konnichiwa ${user}\n\n` + 
    `📆Today: ${time.format("MMMM DD, YYYY")}\n` +
    `🕓Clock: ${time.format("HH:mm:ss")}\n` +
    `🤖Bot Name: ${botName}\n` +
    `⏳Uptime: ${uptime()}\n\n` +
    "Use 'info' to view information or description of the command. \nExample: \n.menu info\n\n" +
    "}------Command List-------{\n"
  return txt + plugin.join("\n\n")
}

export {
  menu,
  datas as commands
}
