import { downloadMediaMessage } from '@whiskeysockets/baileys'
import MAIN_LOGGER from '../../lib/logger.js'

const logger = MAIN_LOGGER.child({})

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
        // pass this so that baileys can request a reupload of media
        // that has been deleted
        reuploadRequest: conn.updateMediaMessage(m)
      }
    )
    console.log(buffer)
    await conn.sendMessages(id, { image: buffer })
    await conn.sendMessages(id, { text: 'Your stiker' })
  } else {
    await conn.sendMessages(id, { text: 'Image Not Found' })
  }
}

handler.cmd = /^(s|stiker|scv)$/i
handler.desc = '!ping pong'
handler.category = 'utility'
handler.args = null

export default handler
