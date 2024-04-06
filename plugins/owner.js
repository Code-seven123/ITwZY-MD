import { __dirname } from "../lib/utils.js"
import { join } from "path"

const handler = async (conn, { id }, m) => {
  const card = []
  const data = JSON.stringify(join(__dirname, "../permissions/admin.json"))
  for( const owner of data.data ) {
    const n = owner.split("@")[0]
    const num = "+" + n.substr(0, 4) + " " + n.substr(4, 4) + " " + n.substr(8)
    const vcard = "BEGIN:VCARD\n" // metadata of the contact card
            + "VERSION:3.0\n"
            + "FN:$admin\n"
            + "ORG:OWNER;\n"
            + `TEL;type=CELL;type=VOICE;waid=${n}:${num}\n` // WhatsApp ID + phone number
            + "END:VCARD"
    card.push({ vcard })
  }
  await conn.sendMessage(id, {
    contacts: {
      displayName: "Owner User",
      contacts: card
    }
  }, { quoted: m })
}
handler.cmd = /^(admin|owner)$/i
handler.desc = "owner list"
handler.category = "utility"

export default handler
