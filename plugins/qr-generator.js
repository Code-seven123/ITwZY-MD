import qr from "qrcode"

const handler = async (conn, { id, args }, m) => {
  await m.reply(id, "Generate QR code...")
  qr.toBuffer(args.join(" "), { scale: 10 }, async (err, buffer) => {
    if(err) {
      await m.reply(id, `Error generate: ${err}`)
    }
    await conn.sendMessage(id, { image: buffer })
  })
}

handler.cmd = /^(makeqr|qr)$/i
handler.desc = "Qr code generator"
handler.category = "tools"
handler.args = "<teks / url>"


export default handler
