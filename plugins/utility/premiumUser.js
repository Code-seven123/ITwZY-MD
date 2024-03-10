import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const json = fs.readFileSync(join(__dirname, '../../premium.json'))
const premi = JSON.parse(json)

const handler = async (conn, { id }, m) =>{ 
  const data = []
  for( const user of premi.user){
    data.push(`Name: ${user.name}\nNumber: ${user.number}\n`)
  }
  
  await conn.sendMessage(id, { text: `List of premium user \n\n\n${data.join('\n')}` })
}

handler.cmd = /^(premiList)$/i
handler.desc = 'List a premium user'
handler.category = 'utility'
handler.admin = true
handler.args = null
export default handler
