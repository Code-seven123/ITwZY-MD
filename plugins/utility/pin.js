import bailesy from '@whiskeysockets/baileys'

const handler = async (conn, { reply, id }, m) => {
  const data = {
    chatId: reply?.remoteJid,
    messageId: reply?.participant
  }
  const obj = await conn.storage.messages[data.chatId]
  const message = obj.get(data.messageId)
  await conn.relayMessage(id, {
    pinInChatMessage: {
      key: message.key,
      senderTimestampMs: new Date().getTime(),
      type: bailesy?.proto?.Message?.PinInChatMessage?.Type?.PIN_FOR_ALL
    },
    messageContextInfo:{
      messageAddOnDurationInSecs: 604800
    }
  }, {})
}

handler.cmd = /^(pin)$/i
handler.desc = 'pin message'
handler.category = 'utility'
handler.admin = true

export default handler
