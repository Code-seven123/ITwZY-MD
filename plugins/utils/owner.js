import cfg from '../../config.js'

const handler = async (conn, { id }, m) => {
  for ( const owner of cfg.owner ) {
    const n = owner.number
    const num = '+' + n.substr(0, 4) + ' ' + n.substr(4, 4) + ' ' + n.substr(8)
    const vcard = 'BEGIN:VCARD\n' // metadata of the contact card
            + 'VERSION:3.0\n' 
            + `FN:${owner.name}\n` // full name
            + 'ORG:OWNER;\n'
            + `TEL;type=CELL;type=VOICE;waid=${owner.number}:${num}\n` // WhatsApp ID + phone number
            + 'END:VCARD'
    await conn.sendMessage(id, { 
      contacts: { 
        displayName: owner.name, 
        contacts: [{ vcard }] 
      }
    }, { quoted: m })
  }
}

handler.cmd = /^(admin|owner)$/i
handler.desc = 'owner list'
handler.category = 'utility'
handler.args = null
export default handler
