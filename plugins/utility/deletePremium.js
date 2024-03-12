import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const json = fs.readFileSync(join(__dirname, '../../premium.json'))
const premi = JSON.parse(json)

const handler = async (conn, { globalPrefix, args, id }, m) =>{ 
  if(args[0] && args[0].startsWith('@')){
    
    const deleted = premi.user.find(item => item.number == args[0].substr(1))
    const data = premi.user.filter(item => item !== deleted)
    premi.user = data
    
    await conn.sendMessage(id, { text: ` Deleting user ${deleted.number} to premium user`})
    
    const jsonPremi = JSON.stringify(premi, null, 2)
    
    fs.writeFile(join(__dirname, '../../premium.json'), jsonPremi, 'utf8', (err) => {
      if (err) {
        console.error('Error writing file:', err);
        return;
      }
      console.log(`1 user added to premium, info \n number: ${data.number} \n\n`)
    })
    
  } else {
    await conn.sendMessage(id, { text: `Args not found, use ${globalPrefix}addPremi _username_ _@user_` })
  }
}

handler.cmd = /^(delPremi)$/i
handler.desc = 'Deleting a premium user'
handler.category = 'utility'
handler.admin = true
handler.args = '<user>'
export default handler
