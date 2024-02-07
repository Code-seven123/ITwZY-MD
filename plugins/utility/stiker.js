import { downloadMediaMessage } from '@whiskeysockets/baileys'
import MAIN_LOGGER from '../../lib/logger.js'
import imagemin from 'imagemin'
import imageminWebp from 'imagemin-webp'
import gif2webp from 'imagemin-gif2webp'
import fs from 'fs'
const logger = MAIN_LOGGER.child({ })


const handler = async (conn, { user, id }, m) => {
  const messageType = Object.keys (m.message)[0]
  console.log(messageType)
  if (messageType === 'imageMessage') {
    const buffer = await downloadMediaMessage(
      m,
      'buffer',
      { },
      { 
        logger,
      }
    )
    const data = await imagemin.buffer(buffer, {
		  plugins: [
		    imageminWebp({
		      quality: 70,
		      resize: {
		        height: 512,
		        width: 512
		      },
		      size: 512
		    })
		  ]
    })
    await conn.sendMessage(id, { sticker: data })
  } /*else if(messageType === 'videoMessage') {
		const bufferv = await downloadMediaMessage(
      m,
      'buffer',
      { },
      {
        logger,
      }
    )
    const datav = await imagemin.buffer(bufferv, {
      plugins: [
        gif2webp({
					quality: 70
        })
      ]
    })
    await conn.sendMessage(id, { sticker: datav })
  }*/ else {
    await conn.sendMessage(id, { text: 'Image Not Found' })
  }
}

handler.cmd = /^(s|stiker|scv)$/i
handler.desc = '!ping pong'
handler.category = 'utility'
handler.args = null

export default handler
