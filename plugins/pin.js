import baileys from "@whiskeysockets/baileys"
const handler = async (conn, { id, reply, storage }, m) => {
  const userId = reply?.remoteJid
  const messageId = reply?.id
  const obj = storage.messages[userId]
  const message = obj.get(messageId)

  const res = await conn.relayMessage(id, {
    pinInChatMessage: {
      key: message?.key, // Key object of the message to pin
      senderTimestampMs: new Date().getTime(),
      type: baileys.proto.Message.PinInChatMessage.Type.PIN_FOR_ALL
    },
    messageContextInfo: {
      messageAddOnDurationInSecs: 604800
    },
  }, {})
}

handler.cmd = /^(pin|unpin)$/i
handler.desc = "pin unpin message"
handler.category = "group"
handler.admin = true


export default handler
