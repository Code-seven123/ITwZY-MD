import fs from 'fs'
import { frontText, __dirname, time, uptime } from './utils.js'
import { join } from 'path'
import { prefix, botName } from './config.js'

const pluginsPath = join(__dirname, '../plugins')

async function getPlugins(){
  const getAllFiles = fs.readdirSync(pluginsPath)
  const filteredFiles = getAllFiles.filter(i => i.endsWith('.js'))
  const filteredPath = filteredFiles.map(i => join(pluginsPath, i))
  const pluginsData = []
  for ( const filteredFile of filteredPath ){
    const readingFile = await import(filteredFile)
    pluginsData.push(readingFile.default)
  }
  return pluginsData
}

getPlugins().then(i => console.log(`Attack ${i.length} plugins`))

async function listByCategory(){
  const data = await getPlugins()
  const category = Array.from(new Set(data.map(i => i.category.toLowerCase()))).sort()
  const sortingData = category.map((item) => {
    return { category: item.toLowerCase(), data: data.filter(i => i.category.toLowerCase() === item) }
  })
  return sortingData
}

async function listedData(){
  const plugins = await listByCategory()
  const list = []
  for( const plugin of plugins ){
    const resultData = plugin.data.map(item => {
      const args = (item.args !== undefined && item.args !== null) ? item.args : ''
      const commandName = item.cmd?.toString()?.slice(3)?.slice(0, -4).split("|")
      const styled = commandName.map(i => `\n> ${prefix}${i} ${args}`)
      return styled
    }).flat(1)
    const txt = `    »»${frontText(plugin.category)}${resultData.join('')}\n\n`
    list.push(txt)
  }
  return list.join('')
}

async function menu(user){
  const txt = `Konnichiwa ${user}\n\n` +
    `📆Today: ${time.format("MMMM DD, YYYY")}\n` +
    `🕓Clock: ${time.format("HH:mm:ss")}\n` +
    `🤖Bot Name: ${botName}\n` +
    `⏳Uptime: ${uptime()}\n\n` +
    "Use 'info' to view information or description of the command. \nExample: \n.menu info\n\n" +
    "}------Command List-------{\n"
  const plugin = await listedData()
  return txt + plugin
}

const datas = await getPlugins()

const commandName = []
for (const data of datas){
  const command = data?.cmd?.toString()?.slice(3)?.slice(0, -4).split("|")
  commandName.push(command.flat())
}
const newCommandName = commandName.flat()

export {
  menu,
  datas as commands,
  newCommandName as commandName
}
