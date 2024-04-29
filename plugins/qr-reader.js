import MAIN_LOGGER from '../lib/logger.js'
import { downloadMediaMessage } from "baileys"
import QRCodeReader from 'qrcode-reader'
import Jimp from 'jimp'

const logger = MAIN_LOGGER.child({})
const handler = async (conn, { id, args }, m) => {
  const qr = new QRCodeReader()
  await m.reply(id, 'Parsing QR code...')
  const messageType = Object.keys(m.message)[0]
  if(messageType === 'imageMessage') {
    const buffer = await downloadMediaMessage(
      m,
      "buffer",
      {},
      {
        logger,
      }
    )
    Jimp.read(buffer, async (err, image) => {
      if (err) {
          await m.reply(id, `${err}`)
      }
      var qr = new QRCodeReader();
      qr.callback = async (err, value) => {
        if (err) {
            await m.reply(id, `${err}`)
        }
        await conn.sendMessage(id, { image: buffer, caption: `Is text: ${value.result}` })
      };
      qr.decode(image.bitmap);
    });
  } else {
    await m.reply(id, 'Image not found')
  }
}

handler.cmd = /^(parseqr|qrencode)$/i
handler.desc = "Qr code reader"
handler.category = "tools"


export default handler
