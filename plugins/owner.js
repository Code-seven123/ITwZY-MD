import { __dirname } from "../lib/utils.js"
import { join } from "path"

const handler = async (conn, { id, adminControl }, m) => {
  const card = []
  const admin = adminControl?.dataUser?.admin
  for( const owner of admin.data ) {
    console.log(owner)
    const n = owner.split("@")[0]
    const num = "+" + n.substr(0, 4) + " " + n.substr(4, 4) + " " + n.substr(8)
    const vcard = "BEGIN:VCARD\n" // metadata of the contact card
            + "VERSION:3.0\n"
            + "FN:admin\n"
            + "ORG:OWNER;\n"
            + `TEL;type=CELL;type=VOICE;waid=${n}:${num}\n`
            + "END:VCARD"
    card.push({vcard})
  }
  await conn.sendMessage(id, {
    contacts: {
      displayName: "Owner User",
      contacts: card
    }
  }, { quoted: m })
}
handler.cmd = /^(dev|owner)$/i
handler.desc = "owner list"
handler.category = "utility"

export default handler
