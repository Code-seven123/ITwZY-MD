import cfg from '../config.js' 
import commands from '../plugins.js' 
import menu from './menu.js' 
import fs from 'fs' 
import { fileURLToPath } from 'url' 
import { dirname, join } from 'path' 
import group from './group.js'
import processMassage from './massage.js'
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

async function cleanupFiles() {
  try {
    const files = fs.readdirSync(join(__dirname, '../temp'))
    for (const file of files) {
      fs.unlinkSync(join(__dirname, '../temp', file))
    }
  } catch (err) {
    console.error('Error cleaning up files:', err)
  }
}

export default async (e, conn, saveCreds) => {
  if(e['creds.update']){
    await saveCreds()
  }
  if(e['messages.reaction']) {
    console.log('messages.reaction', e['messages.reaction'])
  }
  if(e['messages.upsert']){
    const m = e['messages.upsert']
	  await processMassage(m, commands, conn)
  }
/*  if(e['groups.upsert']) {
  	const m = e['groups.upsert']
  	await group(m)
  	
  }*/
}
