export default async (e, conn, store, saveCreds, /* state */ ) => {
  if(e['creds.update']){
    await saveCreds()
  }
  if(e['chats.set']){
    console.log('got chats', store.chats.all())
  }
  if(e['contacts.set']){
    console.log('got contacts', Object.values(store.contacts))
  }
  if(e['messages.upsert']){
    const m = e['messages.upsert']
    console.log(JSON.stringify(m, undefined, 2))

    console.log('replying to', m.messages[0].key.remoteJid)
    await conn.sendMessage(m.messages[0].key.remoteJid, { text: 'Hello there!' })
  }
}
