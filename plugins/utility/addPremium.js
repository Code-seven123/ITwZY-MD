import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const json = fs.readFileSync(join(__dirname, '../../premium.json'))
const premi = JSON.parse(json)

const handler = async (conn, { globalPrefix, args, id }, m) =>{ 
  if(args[0] && args[1] && args[1].startsWith('@')){
    const data = {
      name: args[0],
      number: args[1].substr(1)
    }
    premi.user.push(data)
    
    const jsonPremi = JSON.stringify(premi, null, 2)
    
    fs.writeFile(join(__dirname, '../../premium.json'), jsonPremi, 'utf8', (err) => {
      if (err) {
        console.error('Error writing file:', err);
        return;
      }
      console.log(`1 user added to premium, info \n number: ${data.number} \n\n`)
    })
    
    await conn.sendMessage(id, { text: ` Adding user ${data.number} to premium user`})
  } else {
    await conn.sendMessage(id, { text: `Args not found, use ${globalPrefix}addPremi _username_ _@user_` })
  }
}

handler.cmd = /^(addPremi)$/i
handler.desc = 'Adding a premium user'
handler.category = 'utility'
handler.admin = true
handler.args = '<username> + <user>'
export default handler
