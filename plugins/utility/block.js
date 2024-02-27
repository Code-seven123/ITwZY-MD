const handler = async (conn, { user, id, args }, m) => {
  const target = args[1].slice(1) + '@s.whatsapp.net'
  if(args[0] == 'block'){
    await conn.updateBlockStatus(target, 'block')
    await conn.sendMessage(id, { text: `${args[1]} blocked` }, { quoted: m })
  } else if(args[0] == 'unblock'){
    await conn.updateBlockStatus(target, 'unblock')
    await conn.sendMessage(id, { text: `${args[1]} unblocked` }, { quoted: m })
  } else {
    await conn.sendMessage(id, { text: 'args empty' }, { quoted: m })
  }
}

handler.cmd = /^(block)$/i
handler.desc = 'block and unblock user'
handler.category = 'utility'
handler.args = '<block or unblock> + <user>'

export default handler
